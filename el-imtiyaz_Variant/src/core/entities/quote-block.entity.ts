/**
 * Quote Block — one "devis" block from the Excel `Devis` sheet.
 *
 * The Devis sheet contains 10 repeating quote blocks, each ~50 rows tall.
 * Each block computes:
 *   - Per-line totals:  =SUM(A{r}:H{r})
 *   - Sub-total:        =SUM(I{top}:I{bottom})
 *   - Net payable:      =subtotal − advances − discounts
 *   - 5% tax on school fees: =SUM(F{top}:F{bottom}) * 0.05
 *   - Block date:       =TODAY()
 *
 * The block also has 5 dropdown columns per line item:
 *   D = CLASSE, E = FI, F = FRAISSCOLAIRE, G = SERVICE, H = transport
 *
 * In-app, each block is a persistent record with its line items stored as
 * a JSON array — mirroring how the Excel rows form a visual block.
 */

import { Identifier } from "../value-objects/identifier";

/** One line item within a quote block — Excel rows 15..26 of a block. */
export interface QuoteLineItem {
  /** Stable client-side id (uuid). */
  id: string;
  label: string;
  /** Class dropdown value (Excel col D). */
  classe?: string;
  /** Registration fee dropdown value (Excel col E). */
  fi?: string;
  /** School fee dropdown value (Excel col F). */
  fraisScolaire?: string;
  /** Service dropdown value (Excel col G). */
  service?: string;
  /** Transport dropdown value (Excel col H). */
  transport?: string;
  /** 8 amount columns (Excel A..H) collapsed to an array. */
  amounts: number[];   // length 8
  /** Computed: SUM(amounts). The service refreshes this. */
  lineTotal: number;
}

export interface QuoteBlock {
  id: Identifier<"QuoteBlock">;
  name: string;
  description?: string;
  /** Linked student (optional). */
  studentId?: string;
  /** Linked academic year. */
  academicYearId?: string;
  /** The line items in this block (typically 10). */
  items: QuoteLineItem[];
  /**
   * Advances already paid (Excel I29 etc.).
   *
   * ── Issue 5.2 (iteration 3) ──
   * Excel does NOT have an "advances" field — this column was an
   * invention. The Excel grand-total formula is:
   *     I31: =I27 - I29                (subtotal − réduction)
   *     I31: =I27 - I29 - I30          (subtotal − réduction − remboursement)
   * where I29 is the family discount ("Réduction") and I30 is the
   * "Remboursement" credit. The software previously lumped both into
   * `advances + discounts`.
   *
   * We now keep `advances` for backward compatibility but it is no
   * longer used in `netPayable`. Use `discounts` for the "Réduction"
   * (I29) and `remboursement` for the credit (I30).
   */
  advances: number;
  /** Discounts applied (Excel I29 — "Réduction"). */
  discounts: number;
  /**
   * Refunds/credits applied (Excel I30 — "Remboursement").
   *
   * Added in iteration 3 (issue 5.2). When > 0, netPayable subtracts
   * this from the subtotal in addition to `discounts`, mirroring the
   * Excel formula `=I27 - I29 - I30`.
   */
  remboursement: number;
  /** Computed sub-total (Excel I27). */
  subTotal: number;
  /** Computed net payable (Excel I31). */
  netPayable: number;
  /**
   * 5% early-payment bonus on school fees (Excel D35 = SUM(F15:F26) * 0.05).
   *
   * ── Issues 5.3 / 5.4 (iteration 3) ──
   * Excel's D35 is an *informational* note about a conditional bonus:
   * "5% remise si le paiement est effectué en totalité avant le 30
   * juin". The previous software persisted this unconditionally as a
   * "tax". We now compute it only when `paymentDate` is on or before
   * the cutoff (30 June of the payment year). When the condition is
   * not met, the field is persisted as 0.
   */
  schoolFeeTax: number;
  /** Block date (Excel I9 = TODAY()). */
  blockDate: string;
  /**
   * Optional payment date used to evaluate the 5% early-payment bonus
   * (issues 5.3 / 5.4). ISO date string (`YYYY-MM-DD`) or null when
   * the payment has not yet been made. When null/missing, the
   * schoolFeeTax is 0.
   */
  paymentDate?: string | null;
  /** Optional template this block was generated from. */
  templateId?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateQuoteBlockInput {
  name: string;
  description?: string;
  studentId?: string;
  academicYearId?: string;
  items?: Array<Omit<QuoteLineItem, "id" | "lineTotal">>;
  advances?: number;
  discounts?: number;
  /** Refunds/credits applied (Excel I30 — "Remboursement"). Issue 5.2. */
  remboursement?: number;
  templateId?: string;
  blockDate?: string;
  /** Payment date for early-payment bonus evaluation. Issues 5.3/5.4. */
  paymentDate?: string | null;
}

export type UpdateQuoteBlockInput = Partial<CreateQuoteBlockInput>;
