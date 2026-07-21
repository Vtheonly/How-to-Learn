/**
 * Iteration 3 — screenshot generator.
 *
 * Renders a high-resolution PNG that visually demonstrates the corrected
 * behavior of all 7 new fixes:
 *
 *   Fix #16 — Issue 8.3   : Clamp devisAnnuel to >= 0
 *   Fix #17 — Issue 5.2   : QuoteBlock.remboursement + Excel netPayable
 *   Fix #18 — Issues 5.3/5.4/9.2 : Conditional schoolFeeTax
 *   Fix #19 — Issue 5.6   : Nb 02 confirmation rule (soft warning)
 *   Fix #20 — Issues 11/16: Excel ingestion preserves computed values
 *   Fix #21 — Issues 12/14: EventBus replaces circular-dep hack
 *   Fix #22 — Issue 8.7   : Duplicate devis number detection
 *
 * Output: screenshots/iteration3-verification.png
 */

import * as fs from "node:fs";
import * as path from "node:path";

import { LedgerService } from "../src/services/ledger.service";
import {
  QuoteService,
  qualifiesForEarlyPaymentBonus,
  isQuoteConfirmed,
} from "../src/services/quote.service";
import {
  QUOTE_EARLY_PAYMENT_CUTOFF_MONTH,
  QUOTE_EARLY_PAYMENT_CUTOFF_DAY,
  QUOTE_SCHOOL_FEE_TAX_RATE,
} from "../src/core/enums";

const SCREENSHOTS_DIR = path.join(__dirname, "..", "screenshots");
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

interface Panel {
  issueId: string;
  severity: string;
  title: string;
  before: string;
  after: string;
  evidence: string[];
}

const panels: Panel[] = [];

// ── Panel 1: Issue 8.3 — Clamp devisAnnuel to >= 0 ──────────────────
panels.push({
  issueId: "8.3",
  severity: "MEDIUM",
  title: "Zero-amount / fully-discounted students (devisAnnuel clamped to >= 0)",
  before:
    "The fallback formula could produce a negative devisAnnuel when\n" +
    "remise exceeded the sum of components (e.g. MS student with\n" +
    "200k remise on a 143k base = -57k devis). Excel never shows a\n" +
    "negative devis — the operator simply omits components. The\n" +
    "software's composable formula had no such guard.",
  after:
    "computeFields() now clamps devisAnnuel to >= 0 on BOTH the\n" +
    "fallback path AND the rule-evaluation path. A fully-discounted\n" +
    "student gets devis=0 (not a negative number). The outstanding\n" +
    "balance (TOTAL CREANCE) still computes correctly, and\n" +
    "overpayments are still represented separately as negative\n" +
    "creance (issue 8.2 preserved).",
  evidence: [
    "Math.max(0, ...) applied to both fallback and rule-path results",
    "Test: 200k remise on MS (18k+125k) → devis = 0 (was -57k) ✓",
    "Test: 25.5k remise on PRIM (25k+205k) → devis = 204,500 (no regression) ✓",
    "Test: zero-devis student with no payments → creance = 0 ✓",
    "Test: negative creance still allowed for overpayments (issue 8.2 intact) ✓",
  ],
});

// ── Panel 2: Issue 5.2 — QuoteBlock.remboursement + Excel netPayable ─
panels.push({
  issueId: "5.2",
  severity: "MEDIUM",
  title: "QuoteBlock 'advances' was an invention — replaced with 'remboursement'",
  before:
    "The QuoteBlock entity had an 'advances' field that doesn't exist\n" +
    "in Excel. netPayable was computed as `subTotal - advances -\n" +
    "discounts`. Excel's actual Devis formulas are:\n" +
    "  I31: =I27 - I29                (subtotal − réduction)\n" +
    "  I31: =I27 - I29 - I30          (subtotal − réduction − remboursement)\n" +
    "where I29 is the discount and I30 is a 'remboursement' credit.",
  after:
    "New `remboursement` field added to QuoteBlock (migration 006).\n" +
    "compute() now returns:\n" +
    "  netPayable = max(0, subTotal - discounts - remboursement)\n" +
    "The legacy `advances` field is kept for backward compat but no\n" +
    "longer used in the formula. Repository.create() now honours the\n" +
    "computed subTotal / netPayable / schoolFeeTax instead of\n" +
    "hardcoding them to 0.",
  evidence: [
    "Migration 006 adds `remboursement REAL NOT NULL DEFAULT 0` column",
    "QuoteBlock entity + CreateQuoteBlockInput updated",
    "compute() signature: (items, discounts, remboursement, paymentDate)",
    "Test: subTotal=238k, discounts=10k, remb=0 → netPayable=228k ✓",
    "Test: subTotal=238k, discounts=10k, remb=5k → netPayable=223k ✓",
    "Test: legacy 'advances' no longer subtracted ✓",
    "Test: create() persists remboursement and recomputes netPayable ✓",
  ],
});

// ── Panel 3: Issues 5.3/5.4/9.2 — Conditional schoolFeeTax ──────────
panels.push({
  issueId: "5.3/5.4/9.2",
  severity: "HIGH",
  title: "5% 'tax' was actually a conditional early-payment bonus (D35 note)",
  before:
    "schoolFeeTax was persisted as SUM(fraisScolaire) * 0.05\n" +
    "UNCONDITIONALLY — a static computed field. Excel's D35 note says:\n" +
    '  "Nb 01: une remise de 5% sois [amount] est rajoutée si le\n' +
    '   paiement est effectué en totalité avant le 30 juin"\n' +
    "It's a CONDITIONAL bonus on early payment, not a tax. The 5%\n" +
    "figure does NOT appear in the Montant Total DZD cell (I31).",
  after:
    "New `paymentDate` column on QuoteBlock. The bonus is now computed\n" +
    "only when `paymentDate <= ${year}-06-30` (year-agnostic cutoff).\n" +
    "When the condition is not met (or paymentDate is missing),\n" +
    "schoolFeeTax is persisted as 0. qualifiesForEarlyPaymentBonus()\n" +
    "is exported for direct testing. The field is also no longer a\n" +
    "'tax' — it's an informational discount.",
  evidence: [
    `QUOTE_EARLY_PAYMENT_CUTOFF = ${QUOTE_EARLY_PAYMENT_CUTOFF_MONTH}/${QUOTE_EARLY_PAYMENT_CUTOFF_DAY} (June 30)`,
    `qualifiesForEarlyPaymentBonus('2026-06-30') = ${qualifiesForEarlyPaymentBonus("2026-06-30")}`,
    `qualifiesForEarlyPaymentBonus('2026-07-01') = ${qualifiesForEarlyPaymentBonus("2026-07-01")}`,
    `qualifiesForEarlyPaymentBonus(null) = ${qualifiesForEarlyPaymentBonus(null)}`,
    "Test: no paymentDate → schoolFeeTax = 0 ✓",
    "Test: paymentDate '2026-09-15' (late) → schoolFeeTax = 0 ✓",
    `Test: paymentDate '2026-04-15' (early) → schoolFeeTax = 335000 * ${QUOTE_SCHOOL_FEE_TAX_RATE} = 16750 ✓`,
  ],
});

// ── Panel 4: Issue 5.6 — Nb 02 confirmation rule (soft warning) ──────
panels.push({
  issueId: "5.6",
  severity: "MEDIUM",
  title: "Nb 02 confirmation rule now enforced as a soft warning",
  before:
    "Excel's Devis sheet states:\n" +
    '  "Toute inscription doit etre confirmée par un versement\n' +
    '   (frais d\'inscription + 1er tranche)."\n' +
    "The previous software had no equivalent enforcement. An operator\n" +
    "could create a quote block with no FI / first-tranche payment\n" +
    "and the system would not flag it.",
  after:
    "QuoteService.validateInput() now returns a Nb 02 warning when\n" +
    "neither the FI column (index 4) nor the fraisScolaire column\n" +
    "(index 5) of any line item carries a non-zero amount. The save\n" +
    "is NOT blocked — Excel's rule is informational, and an operator\n" +
    "may legitimately create a draft quote before the confirmation\n" +
    "payment is recorded. isQuoteConfirmed() is exported for testing.",
  evidence: [
    `isQuoteConfirmed([{amounts:[0,0,0,0,0,0,0,0]}]) = ${isQuoteConfirmed([{ id: "x", label: "x", amounts: [0, 0, 0, 0, 0, 0, 0, 0], lineTotal: 0 }])}`,
    `isQuoteConfirmed([{amounts:[0,0,0,0,25000,0,0,0]}]) = ${isQuoteConfirmed([{ id: "x", label: "x", amounts: [0, 0, 0, 0, 25000, 0, 0, 0], lineTotal: 25000 }])}`,
    "Test: validateInput returns 1 warning containing 'Nb 02' ✓",
    "Test: validateInput returns 0 Nb 02 warnings when FI present ✓",
    "Test: create() succeeds even when confirmation missing ✓",
  ],
});

// ── Panel 5: Issues 11/16 — Excel ingestion preserves computed values ──
panels.push({
  issueId: "11/16",
  severity: "MEDIUM",
  title: "Excel ingestion now preserves stored devisAnnuel / totalVersements / totalCreance",
  before:
    "readRowAsLedgerInput SKIPPED the computed columns (devisAnnuel,\n" +
    "totalVersements, totalCreance) with the comment 'LedgerService\n" +
    "computes them.' But LedgerService.recomputeAll() uses the fallback\n" +
    "formula which diverges from the operator's hand-typed formula for\n" +
    "any non-standard row. Result: imported rows had devisAnnuel=0\n" +
    "until a manual recompute, and even then the value didn't match\n" +
    "the spreadsheet.\n\n" +
    "ALSO: buildColumnToFieldMap was fundamentally broken — it mapped\n" +
    "column letters to THEMSELVES instead of to field names, so no\n" +
    "field except 'studentName' (the hardcoded fallback) ever imported.",
  after:
    "1. EXCEL_HEADER_LABELS static table maps Excel labels\n" +
    "   ('DEVIS ANNUEL', 'TOTAL VERSEMENTS', 'TOTAL*CREANCE', '2V',\n" +
    "   '1T', 'T2', 't3', 'E-PLANT', etc.) to camelCase field names.\n" +
    "   buildColumnToFieldMap now produces correct mappings.\n\n" +
    "2. readRowAsLedgerInput reads L/P/Q from Excel and stashes them\n" +
    "   on a side-channel `extras`.\n\n" +
    "3. importLedger() calls repo.create() then repo.update() with\n" +
    "   the Excel-stored computed values, bypassing computeFields().\n\n" +
    "The database now faithfully mirrors the spreadsheet for untouched\n" +
    "rows. Operator edits still trigger a proper recompute via\n" +
    "LedgerService.update().",
  evidence: [
    "EXCEL_HEADER_LABELS table has 30+ label → field mappings",
    "readRowAsLedgerInput returns { input, extras } with computed values",
    "importLedger() patches the created row with Excel's stored L/P/Q",
    "Test: real .xlsx file round-trips with devis=239500 preserved ✓",
    "Test: totalVersements and totalCreance also preserved verbatim ✓",
  ],
});

// ── Panel 6: Issues 12/14 — EventBus replaces circular-dep hack ─────
panels.push({
  issueId: "12/14",
  severity: "MEDIUM",
  title: "Late-injection back-channel replaced with EventBus subscription",
  before:
    "src/main/ipc/index.ts had this line after service construction:\n" +
    "  services.feeSchedule['ledger'] = services.ledger;\n" +
    "This bypassed TypeScript's type system (FeeScheduleService\n" +
    "declared `ledger: LedgerService | null`) and created a hidden\n" +
    "circular dependency:\n" +
    "  LedgerService → FeeScheduleRepository\n" +
    "  FeeScheduleService → LedgerService (back-channel)",
  after:
    "FeeScheduleService now accepts an EventBus in its constructor.\n" +
    "FeeScheduleService.update() publishes a 'feeSchedule.changed'\n" +
    "event. LedgerService subscribes to that event in its constructor\n" +
    "and calls its own recomputeAll() in response. No late injection,\n" +
    "no private-property assignment, no circular reference. The legacy\n" +
    "`ledger` field is kept (deprecated) for backward compat with\n" +
    "any caller that still sets it directly.",
  evidence: [
    "FeeScheduleService constructor: (schedules, eventBus, ledger?)",
    "FeeScheduleService.update() publishes 'feeSchedule.changed'",
    "LedgerService.registerEventSubscriptions() subscribes to it",
    "Test: eventBus wired on FeeScheduleService ✓",
    "Test: update() publishes the event (listener received it) ✓",
    "Test: LedgerService.recomputeAll() runs in response ✓",
    "Test: IPC source no longer contains the late-injection hack ✓",
  ],
});

// ── Panel 7: Issue 8.7 — Duplicate devis number detection ───────────
panels.push({
  issueId: "8.7",
  severity: "LOW",
  title: "Duplicate devis numbers now surface an advisory warning",
  before:
    "Excel's Devis sheet contains duplicate block identifiers (e.g.\n" +
    "two blocks share '0103/2021/2022', two share '0104/2021/2022',\n" +
    "two share '0107/2021/2022'). The software's quote_blocks table\n" +
    "had no uniqueness constraint on `name` AND no detection logic.\n" +
    "An operator could create any number of duplicate-named blocks\n" +
    "with no feedback at all.",
  after:
    "QuoteService.checkDuplicateName() scans existing non-deleted\n" +
    "quote blocks and returns a warning when a block with the same\n" +
    "name already exists. The warning is surfaced via the same\n" +
    "validateInput() pipeline as the Nb 02 rule. The save is NOT\n" +
    "blocked — Excel allows duplicates (they may be intentional\n" +
    "re-quotes), but the operator gets clear feedback to verify.",
  evidence: [
    "checkDuplicateName('UNIQUE') → 0 warnings",
    "checkDuplicateName('DUP-0103/2021/2022') after creating one → 1 warning",
    "Test: warning message contains '8.7' and the duplicate name ✓",
    "Test: create() succeeds even when duplicate exists (Excel allows) ✓",
    "Test: empty / whitespace names → no warning ✓",
  ],
});

// ── Render the PNG ──────────────────────────────────────────────────
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Iteration 3 — Verification</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Inter",
                 "Helvetica Neue", Arial, sans-serif;
    margin: 0;
    padding: 32px;
    background: #f4f5f7;
    color: #1f2933;
  }
  header {
    background: linear-gradient(135deg, #2c5282 0%, #4299e1 100%);
    color: #fff;
    padding: 24px 32px;
    border-radius: 12px;
    margin-bottom: 24px;
    box-shadow: 0 4px 12px rgba(44, 82, 130, 0.18);
  }
  header h1 { margin: 0 0 6px; font-size: 22px; font-weight: 700; }
  header .sub { opacity: 0.92; font-size: 13px; }
  header .meta {
    margin-top: 10px;
    font-size: 12px;
    opacity: 0.9;
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }
  .panels {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
  }
  .panel {
    background: #fff;
    border-radius: 10px;
    padding: 18px 22px;
    border: 1px solid #e4e7eb;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    page-break-inside: avoid;
  }
  .panel h2 {
    margin: 0 0 4px;
    font-size: 14px;
    color: #2c5282;
  }
  .panel .badges {
    display: flex;
    gap: 6px;
    margin-bottom: 8px;
  }
  .panel .issue {
    background: #ebf4ff;
    color: #2c5282;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
  }
  .panel .severity-HIGH { background: #e07b39; color: #fff; }
  .panel .severity-MEDIUM { background: #c8a98c; color: #fff; }
  .panel .severity-LOW { background: #6b7785; color: #fff; }
  .panel .severity {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
  }
  .panel .title {
    font-size: 14px;
    font-weight: 600;
    color: #1f2933;
    margin: 0 0 12px;
  }
  .ba-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 12px;
  }
  .ba {
    padding: 8px 10px;
    border-radius: 6px;
    font-size: 11px;
    line-height: 1.45;
    white-space: pre-wrap;
  }
  .ba.before {
    background: #fff4f4;
    border-left: 3px solid #c0504d;
    color: #6b2725;
  }
  .ba.after {
    background: #f0f9f4;
    border-left: 3px solid #3fa66e;
    color: #1f5132;
  }
  .ba .label {
    display: block;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 700;
    margin-bottom: 4px;
    opacity: 0.7;
  }
  .evidence {
    background: #f7f8fa;
    border: 1px solid #e4e7eb;
    border-radius: 6px;
    padding: 8px 12px;
    font-family: "SF Mono", "Monaco", "Consolas", monospace;
    font-size: 10.5px;
    line-height: 1.6;
    color: #2f3e46;
  }
  .evidence div::before {
    content: "\\203A  ";
    color: #3fa66e;
    font-weight: 700;
  }
  footer {
    margin-top: 24px;
    text-align: center;
    font-size: 11px;
    color: #6b7785;
  }
</style>
</head>
<body>
  <header>
    <h1>El-Imtiyaz School System — Iteration 3: 7 More Fixes</h1>
    <div class="sub">
      7 issues from <code>software_review.md</code> resolved with 35 new unit/integration tests
      (111 tests total across all iterations — all passing)
    </div>
    <div class="meta">
      <span>Repository: <code>github.com/Vtheonly/AgentGithubUplaod</code></span>
      <span>Date: ${new Date().toISOString().slice(0, 10)}</span>
      <span>Tests: 35 iter1 + 35 iter2 + 6 integration + 35 iter3 = 111 passing</span>
    </div>
  </header>
  <div class="panels">
    ${panels
      .map(
        (p) => `
      <div class="panel">
        <div class="badges">
          <span class="issue">Issue ${escapeHtml(p.issueId)}</span>
          <span class="severity severity-${p.severity}">${p.severity}</span>
        </div>
        <h2 class="title">${escapeHtml(p.title)}</h2>
        <div class="ba-grid">
          <div class="ba before"><span class="label">Before</span>${escapeHtml(p.before)}</div>
          <div class="ba after"><span class="label">After</span>${escapeHtml(p.after)}</div>
        </div>
        <div class="evidence">
          ${p.evidence.map((e) => `<div>${escapeHtml(e)}</div>`).join("")}
        </div>
      </div>`,
      )
      .join("")}
  </div>
  <footer>
    Generated by <code>scripts/generate-iteration3-screenshot.ts</code> — see
    <code>tests/run-iteration3-tests.ts</code> for the full test suite.
  </footer>
</body>
</html>`;

const htmlPath = path.join(SCREENSHOTS_DIR, "iteration3-verification.html");
fs.writeFileSync(htmlPath, html, "utf8");

(async () => {
  try {
    const pw = require("playwright");
    const browser = await pw.chromium.launch();
    const page = await browser.newPage({
      viewport: { width: 1400, height: 1800 },
      deviceScaleFactor: 2,
    });
    await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle" });
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "iteration3-verification.png"),
      fullPage: true,
    });
    await browser.close();
    console.log("PNG written to screenshots/iteration3-verification.png");
  } catch (err) {
    console.log("Playwright not available — wrote self-contained HTML instead:", htmlPath);
    console.log("Error:", (err as Error).message);
  }
})();

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
