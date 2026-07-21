/**
 * Quote Service — reproduces the Excel `Devis` sheet behaviour in-app.
 *
 * Each quote block contains line items and computes:
 *   - Per-line total:  =SUM(A{r}:H{r})     →  item.lineTotal
 *   - Sub-total:       =SUM(I{top}:I{bot}) →  block.subTotal
 *   - Net payable:     =I27 − I29 [− I30]  →  block.netPayable
 *   - 5% bonus on school fees (conditional):
 *       =SUM(F) * 0.05  →  block.schoolFeeTax   (only when paymentDate ≤ 30 June)
 *   - Block date:      =TODAY()            →  block.blockDate
 *
 * The sheet has 10 repeating blocks per print page; we expose them as
 * individual QuoteBlock entities that can be linked to students.
 *
 * ── Iteration 3 changes ────────────────────────────────────────────
 *   • Issue 5.2: `netPayable` now mirrors Excel exactly. The invented
 *     `advances` field is no longer subtracted; instead `discounts`
 *     ("Réduction", Excel I29) and `remboursement` (Excel I30) are
 *     subtracted, matching the two Excel formula patterns:
 *         I31: =I27 - I29                (no remboursement)
 *         I31: =I27 - I29 - I30          (with remboursement)
 *   • Issues 5.3 / 5.4 / 9.2: `schoolFeeTax` is now computed only when
 *     `paymentDate` is on or before 30 June of the payment year — the
 *     Excel "Nb 01" early-payment bonus. When the condition is not
 *     met, the field is 0. It is also no longer a "tax" — it is an
 *     informational discount, exactly as Excel's D35 note describes.
 *   • Issue 5.6: Added the "Nb 02" confirmation rule as a soft
 *     warning. Excel states: "Toute inscription doit etre confirmée
 *     par un versement (frais d'inscription + 1er tranche)." We
 *     surface a warning when neither the FI nor the first tranche
 *     appears in any line item's amounts — we do NOT block the save.
 */

import { QuoteBlockRepository, QuoteBlockQuery } from "../infrastructure/repositories/quote-block.repository";
import type {
  QuoteBlock,
  QuoteLineItem,
  CreateQuoteBlockInput,
  UpdateQuoteBlockInput,
} from "../core/entities/quote-block.entity";
import type { IEventBus } from "../core/interfaces/event-bus.interface";
import {
  QUOTE_SCHOOL_FEE_TAX_RATE,
  QUOTE_EARLY_PAYMENT_CUTOFF_MONTH,
  QUOTE_EARLY_PAYMENT_CUTOFF_DAY,
} from "../core/enums";
import { NotFoundError, ValidationError } from "../infrastructure/error/app-error";
import { logger } from "../infrastructure/logger/logger";

/**
 * A soft validation warning. Excel's "Nb 02" rule on the Devis sheet
 * is informational — it tells the operator that an inscription should
 * be confirmed by an initial payment, but it does NOT block the save.
 * The software mirrors that semantics by returning warnings rather
 * than throwing — see issue 5.6 in software_review.md.
 */
export interface QuoteValidationWarning {
  field: string;
  message: string;
  value: unknown;
}

export interface QuoteComputationResult {
  subTotal: number;
  netPayable: number;
  schoolFeeTax: number;
  items: QuoteLineItem[];
}

/**
 * Evaluate whether a payment date qualifies for the 5% early-payment
 * bonus (issues 5.3 / 5.4).
 *
 * Excel's D35 note: "5% remise si le paiement est effectué en
 * totalité avant le 30 juin". We interpret "30 June" as 30 June of
 * the payment year (so the rule is year-agnostic). Returns true when
 * `paymentDate` is a valid ISO date on or before 30 June of its own
 * year; false otherwise (including when paymentDate is missing or
 * malformed).
 *
 * Exported so the iteration-3 test suite can verify the rule directly.
 */
export function qualifiesForEarlyPaymentBonus(
  paymentDate: string | null | undefined,
): boolean {
  if (!paymentDate || typeof paymentDate !== "string") return false;
  // Accept "YYYY-MM-DD" or full ISO. Take just the date portion.
  const datePart = paymentDate.length >= 10 ? paymentDate.slice(0, 10) : paymentDate;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (!m) return false;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return false;
  }
  // Build the cutoff as YYYY-06-30 and compare numerically (year, then month, then day).
  // Equivalent to: paymentDate <= `${year}-${cutoffMonth padded}-${cutoffDay padded}`
  const cutoffMonthPadded = String(QUOTE_EARLY_PAYMENT_CUTOFF_MONTH).padStart(2, "0");
  const cutoffDayPadded = String(QUOTE_EARLY_PAYMENT_CUTOFF_DAY).padStart(2, "0");
  const cutoffStr = `${year}-${cutoffMonthPadded}-${cutoffDayPadded}`;
  return datePart <= cutoffStr;
}

/**
 * Detect whether the line items in a quote block include at least one
 * registration-fee payment (FI) and at least one first-tranche
 * payment. Used by the "Nb 02" confirmation rule (issue 5.6).
 *
 * Excel's "Nb 02" rule: "Toute inscription doit etre confirmée par
 * un versement (frais d'inscription + 1er tranche)." The Devis sheet
 * line items store amounts in an 8-column array mirroring the
 * spreadsheet's A..H layout. Column E (index 4) is the FI dropdown
 * amount and column F (index 5) is the Frais Scolaire amount; the
 * first tranche is typically represented as a non-zero FI amount.
 *
 * We use a permissive heuristic: a block is "confirmed" when at least
 * one line item has a non-zero amount in the FI column (index 4) OR
 * in the school-fee column (index 5). This avoids false negatives
 * when the operator splits the confirmation payment across multiple
 * children in the same block.
 */
export function isQuoteConfirmed(items: QuoteLineItem[]): boolean {
  if (!Array.isArray(items) || items.length === 0) return false;
  return items.some((it) => {
    const fi = Number(it.amounts?.[4]) || 0;
    const frais = Number(it.amounts?.[5]) || 0;
    return fi > 0 || frais > 0;
  });
}

export class QuoteService {
  readonly serviceName = "QuoteService";

  constructor(
    private readonly quotes: QuoteBlockRepository,
    private readonly eventBus?: IEventBus
  ) {}

  async list(query: QuoteBlockQuery = {}): Promise<QuoteBlock[]> {
    return this.quotes.list(query);
  }

  async getById(id: string): Promise<QuoteBlock> {
    const q = await this.quotes.findById(id);
    if (!q) throw new NotFoundError("QuoteBlock", id);
    return q;
  }

  async getByStudent(studentId: string): Promise<QuoteBlock[]> {
    return this.quotes.list({ studentId });
  }

  /**
   * Create a new quote block. Per-line totals, sub-total, net payable
   * and school-fee tax are all computed automatically — same as Excel.
   */
  async create(input: CreateQuoteBlockInput): Promise<QuoteBlock> {
    if (!input.name?.trim()) throw new ValidationError("Quote name is required");
    if (input.items && input.items.length > 0) {
      for (const it of input.items) {
        if (it.amounts.length !== 8) {
          throw new ValidationError(
            `Line item "${it.label}" must have exactly 8 amount columns (A..H) — got ${it.amounts.length}`
          );
        }
      }
    }

    // ── Issue 5.6: "Nb 02" confirmation rule (soft warning) ──
    //
    // Excel's Devis sheet says: "Toute inscription doit etre
    // confirmée par un versement (frais d'inscription + 1er
    // tranche)." The previous software had no equivalent enforcement.
    // We now surface a warning when neither the FI column (index 4)
    // nor the school-fee column (index 5) of any line item carries a
    // non-zero amount. The save is NOT blocked — Excel's rule is
    // informational, and an operator may legitimately create a draft
    // quote before the confirmation payment is recorded.
    const warnings = this.validateInput(input);

    // ── Issue 8.7: duplicate devis number (soft warning) ──
    //
    // Excel's Devis sheet contains duplicate block identifiers (e.g.
    // two blocks share "0103/2021/2022"). The spreadsheet allows
    // this; the software's quote_blocks table has no uniqueness
    // constraint on `name`. We surface an advisory warning when a
    // block with the same name already exists, so the operator can
    // decide whether the duplication is intentional (e.g. a re-quote
    // for the same family) or a typo. The save is NOT blocked.
    const dupWarnings = await this.checkDuplicateName(input.name);
    const allWarnings = [...warnings, ...dupWarnings];
    if (allWarnings.length > 0) {
      logger.warn("quote.block.validationWarnings", {
        name: input.name,
        warnings: allWarnings,
      });
    }

    const paymentDate = input.paymentDate ?? null;
    const computed = this.compute(
      input.items ?? [],
      input.discounts ?? 0,
      input.remboursement ?? 0,
      paymentDate,
    );
    const quote = await this.quotes.create({
      ...input,
      ...computed,
      paymentDate,
      blockDate: input.blockDate ?? new Date().toISOString().slice(0, 10),
    });

    if (this.eventBus) {
      await this.eventBus.publish("quote.created", {
        entityId: quote.id.value,
        entityType: "QuoteBlock",
        after: quote,
        actor: { actorId: "system", actorName: "System" },
      });
    }

    logger.info("quote.created", {
      id: quote.id.value,
      name: quote.name,
      subTotal: quote.subTotal,
      netPayable: quote.netPayable,
      schoolFeeTax: quote.schoolFeeTax,
      warnings: allWarnings.length,
    });

    return quote;
  }

  async update(id: string, patch: UpdateQuoteBlockInput): Promise<QuoteBlock> {
    const before = await this.getById(id);

    const mergedItems = patch.items ?? before.items;
    const mergedAdvances = patch.advances ?? before.advances;
    const mergedDiscounts = patch.discounts ?? before.discounts;
    // Iteration 3 — issue 5.2: merge remboursement.
    const mergedRemboursement = patch.remboursement ?? before.remboursement ?? 0;
    // Iteration 3 — issues 5.3/5.4: merge paymentDate (null is a valid value).
    const mergedPaymentDate =
      patch.paymentDate !== undefined ? patch.paymentDate : (before.paymentDate ?? null);

    const warnings = this.validateInput({
      ...patch,
      items: mergedItems,
    });
    if (warnings.length > 0) {
      logger.warn("quote.block.validationWarnings", { id, warnings });
    }

    const computed = this.compute(mergedItems, mergedDiscounts, mergedRemboursement, mergedPaymentDate);
    const updated = await this.quotes.update(id, {
      ...patch,
      ...computed,
      paymentDate: mergedPaymentDate,
    });

    if (this.eventBus) {
      await this.eventBus.publish("quote.updated", {
        entityId: id,
        entityType: "QuoteBlock",
        before,
        after: updated,
        actor: { actorId: "system", actorName: "System" },
      });
    }

    // Silence the "mergedAdvances is unused" lint — we keep the
    // legacy field for backward-compat reads but it is NOT used in
    // the new netPayable formula (issue 5.2).
    void mergedAdvances;

    return updated;
  }

  async delete(id: string): Promise<void> {
    const before = await this.getById(id);
    await this.quotes.delete(id);
    if (this.eventBus) {
      await this.eventBus.publish("quote.deleted", {
        entityId: id,
        entityType: "QuoteBlock",
        before,
        actor: { actorId: "system", actorName: "System" },
      });
    }
  }

  /**
   * Compute the Excel-mirroring totals for a quote block:
   *   - Refresh each item's lineTotal: =SUM(amounts)
   *   - subTotal:    =SUM(lineItems.lineTotal)
   *   - netPayable:  =subTotal − discounts [− remboursement]
   *   - schoolFeeTax:=SUM(lineItems.fraisScolaire) * 0.05   (conditional)
   *
   * The "fraisScolaireAmount" is the 6th column (index 5) of the amounts
   * array — mirroring how Excel column F holds the school-fee amount.
   *
   * ── Iteration 3 changes ──
   *   • `advances` is no longer subtracted from `netPayable`. Excel's
   *     I31 formula is `=I27 - I29` (subtotal − réduction) or
   *     `=I27 - I29 - I30` (with remboursement). The previous
   *     `subTotal − advances − discounts` was an invention. (issue 5.2)
   *   • `schoolFeeTax` is now 0 unless `paymentDate` qualifies for
   *     the early-payment bonus (≤ 30 June of its year). The Excel
   *     note makes the 5% conditional; we honour that. (issues 5.3/5.4)
   */
  compute(
    items: Array<Omit<QuoteLineItem, "id" | "lineTotal"> & Partial<Pick<QuoteLineItem, "id" | "lineTotal">>>,
    discounts: number,
    remboursement: number,
    paymentDate?: string | null,
  ): QuoteComputationResult {
    const refreshedItems: QuoteLineItem[] = items.map((it) => ({
      id: it.id ?? generateItemId(),
      label: it.label,
      classe: it.classe,
      fi: it.fi,
      fraisScolaire: it.fraisScolaire,
      service: it.service,
      transport: it.transport,
      amounts: it.amounts,
      lineTotal: it.amounts.reduce((s, a) => s + (Number(a) || 0), 0),
    }));

    const subTotal = refreshedItems.reduce((s, it) => s + it.lineTotal, 0);

    // ── Issue 5.2: netPayable mirrors Excel's I31 formula ──
    //
    //   I31: =I27 - I29                (no remboursement)
    //   I31: =I27 - I29 - I30          (with remboursement)
    //
    // When `remboursement` is 0 (the common case), the second term
    // vanishes and the result equals the first formula. We clamp at 0
    // — Excel never displays a negative grand total because the
    // operator simply wouldn't type a remboursement larger than the
    // subtotal, but the software should be defensive.
    const netPayable = Math.max(
      0,
      subTotal - (Number(discounts) || 0) - (Number(remboursement) || 0),
    );

    // ── Issues 5.3 / 5.4 / 9.2: schoolFeeTax is conditional ──
    //
    // Excel's D35 note: "5% remise si le paiement est effectué en
    // totalité avant le 30 juin". We compute the bonus only when
    // `paymentDate` is on or before 30 June of its own year. When the
    // condition is not met, `schoolFeeTax` is 0. The field is no
    // longer a "tax" — it is an informational discount, exactly as
    // Excel's note describes.
    let schoolFeeTax = 0;
    if (qualifiesForEarlyPaymentBonus(paymentDate)) {
      const schoolFeeSum = refreshedItems.reduce(
        (s, it) => s + (Number(it.amounts[5]) || 0),
        0,
      );
      schoolFeeTax = schoolFeeSum * QUOTE_SCHOOL_FEE_TAX_RATE;
    }

    return { subTotal, netPayable, schoolFeeTax, items: refreshedItems };
  }

  /**
   * Validate a quote-block input.
   *
   * ── Issue 5.6: "Nb 02" confirmation rule (soft warning) ──
   * Excel states: "Toute inscription doit etre confirmée par un
   * versement (frais d'inscription + 1er tranche)." We surface a
   * warning when neither the FI column (index 4) nor the school-fee
   * column (index 5) of any line item carries a non-zero amount. The
   * save is NOT blocked — Excel's rule is informational, and an
   * operator may legitimately create a draft quote before the
   * confirmation payment is recorded.
   */
  validateInput(input: CreateQuoteBlockInput): QuoteValidationWarning[] {
    const warnings: QuoteValidationWarning[] = [];
    const items = input.items ?? [];
    if (items.length > 0 && !isQuoteConfirmed(items)) {
      warnings.push({
        field: "items",
        value: items.map((it) => ({ label: it.label, amounts: it.amounts })),
        message:
          'Nb 02: This quote is not yet confirmed by a payment. Excel\'s rule is: ' +
          '"Toute inscription doit etre confirmée par un versement ' +
          '(frais d\'inscription + 1er tranche)." The save proceeds — ' +
          'record the confirmation payment when it is received.',
      });
    }
    return warnings;
  }

  /**
   * ── Issue 8.7: detect duplicate devis numbers (soft warning) ──
   *
   * Excel's Devis sheet contains duplicate block identifiers (e.g.
   * two blocks share "0103/2021/2022"). The spreadsheet allows this;
   * the software's quote_blocks table has no uniqueness constraint on
   * `name`. We surface an advisory warning when a non-deleted block
   * with the same name already exists. The save is NOT blocked —
   * duplication may be intentional (e.g. a re-quote for the same
   * family) or a typo; the operator decides.
   */
  async checkDuplicateName(name: string): Promise<QuoteValidationWarning[]> {
    if (!name || !name.trim()) return [];
    const all = await this.quotes.list({});
    const matches = all.filter((q) => q.name === name);
    if (matches.length > 0) {
      return [
        {
          field: "name",
          value: name,
          message:
            `Issue 8.7: A quote block named "${name}" already exists ` +
            `(${matches.length} prior occurrence(s)). Excel's Devis sheet ` +
            `allows duplicate block identifiers, so the save proceeds — ` +
            `verify this is intentional (e.g. a re-quote) and not a typo.`,
        },
      ];
    }
    return [];
  }

  /**
   * Recompute and persist the totals for an existing quote — useful after
   * editing line items via the UI.
   */
  async recompute(id: string): Promise<QuoteBlock> {
    const quote = await this.getById(id);
    const computed = this.compute(
      quote.items,
      quote.discounts,
      quote.remboursement ?? 0,
      quote.paymentDate ?? null,
    );
    return this.quotes.update(id, computed);
  }
}

let _itemCounter = 0;
function generateItemId(): string {
  _itemCounter += 1;
  return `li_${Date.now().toString(36)}_${_itemCounter}`;
}
