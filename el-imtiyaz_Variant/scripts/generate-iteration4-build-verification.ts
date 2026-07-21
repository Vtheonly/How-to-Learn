/**
 * Iteration 4 — build verification screenshot.
 *
 * Runs `tsc -p tsconfig.main.json --noEmit`, `tsc -p tsconfig.preload.json
 * --noEmit`, and `vite build` in sequence, captures their output, and
 * renders it as a PNG that documents the build chain now succeeds
 * cleanly (Fix #23 + Fix #24).
 *
 * Output: screenshots/iteration4-build-verification.png
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";

const SCREENSHOTS_DIR = path.join(__dirname, "..", "screenshots");
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const ROOT = path.join(__dirname, "..");

interface Step {
  name: string;
  command: string;
  expectedSuccess: boolean;
}

const steps: Step[] = [
  {
    name: "Step 1: TypeScript main process (tsc -p tsconfig.main.json --noEmit)",
    command: "npx tsc -p tsconfig.main.json --noEmit 2>&1",
    expectedSuccess: true,
  },
  {
    name: "Step 2: TypeScript preload (tsc -p tsconfig.preload.json --noEmit)",
    command: "npx tsc -p tsconfig.preload.json --noEmit 2>&1",
    expectedSuccess: true,
  },
  {
    name: "Step 3: Vite renderer build (vite build)",
    command: "npx vite build 2>&1",
    expectedSuccess: true,
  },
];

interface StepResult {
  step: Step;
  output: string;
  exitCode: number;
  passed: boolean;
}

const results: StepResult[] = [];
for (const step of steps) {
  try {
    const output = execSync(step.command, {
      cwd: ROOT,
      encoding: "utf8",
      timeout: 180000,
      maxBuffer: 10 * 1024 * 1024,
    });
    results.push({
      step,
      output: output || "(no output — clean compile)",
      exitCode: 0,
      passed: step.expectedSuccess,
    });
  } catch (err: any) {
    results.push({
      step,
      output: err.stdout || err.stderr || String(err),
      exitCode: err.status ?? 1,
      passed: !step.expectedSuccess,
    });
  }
}

const allPassed = results.every((r) => r.passed);

// Build the HTML report.
const stepBlocks = results.map((r, i) => {
  const status = r.passed ? "✓ PASS" : "✗ FAIL";
  const cls = r.passed ? "ok" : "fail";
  const trimmedOutput = (r.output || "").trim().split("\n").slice(-8).join("\n");
  return `
    <div class="step">
      <div class="step-header ${cls}">
        <span class="step-num">Step ${i + 1}</span>
        <span class="step-name">${escapeHtml(r.step.name)}</span>
        <span class="step-status ${cls}">${status}</span>
      </div>
      <pre class="step-output">${escapeHtml(trimmedOutput)}</pre>
    </div>
  `;
}).join("\n");

const summaryClass = allPassed ? "ok" : "fail";
const summaryText = allPassed
  ? "✓ Build chain succeeds — the application can boot cleanly (npm start will work)."
  : "✗ Build chain failed — see above for details.";

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Iteration 4 — Build Verification</title>
<style>
  body {
    font-family: "SF Mono", "Monaco", "Consolas", monospace;
    margin: 0;
    padding: 24px;
    background: #1e1e1e;
    color: #d4d4d4;
  }
  header {
    background: ${allPassed ? "#2e7d32" : "#c62828"};
    color: #fff;
    padding: 16px 20px;
    border-radius: 8px;
    margin-bottom: 16px;
  }
  header h1 { margin: 0; font-size: 16px; }
  header .meta { font-size: 11px; opacity: 0.85; margin-top: 4px; }
  .summary {
    background: ${allPassed ? "#1b3a1d" : "#3a1b1b"};
    border: 1px solid ${allPassed ? "#2e7d32" : "#c62828"};
    color: ${allPassed ? "#4ec9b0" : "#f48771"};
    padding: 12px 16px;
    border-radius: 6px;
    margin-bottom: 16px;
    font-weight: 600;
  }
  .step {
    border: 1px solid #3e3e42;
    border-radius: 6px;
    margin-bottom: 12px;
    overflow: hidden;
  }
  .step-header {
    background: #252526;
    padding: 10px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #3e3e42;
    font-size: 12px;
  }
  .step-header.ok { border-left: 4px solid #4ec9b0; }
  .step-header.fail { border-left: 4px solid #f48771; }
  .step-num { color: #569cd6; font-weight: 600; }
  .step-name { flex: 1; padding: 0 12px; color: #d4d4d4; }
  .step-status.ok { color: #4ec9b0; font-weight: 600; }
  .step-status.fail { color: #f48771; font-weight: 600; }
  .step-output {
    background: #1e1e1e;
    padding: 12px 14px;
    font-size: 11px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
    margin: 0;
  }
  .ok { color: #4ec9b0; }
  .fail { color: #f48771; }
</style>
</head>
<body>
  <header>
    <h1>Iteration 4 — Build Verification</h1>
    <div class="meta">Generated ${new Date().toISOString()} — verifying Fix #23 (TS errors) + Fix #24 (missing DataGrid)</div>
  </header>
  <div class="summary">${summaryText}</div>
  ${stepBlocks}
</body>
</html>`;

const htmlPath = path.join(SCREENSHOTS_DIR, "iteration4-build-verification.html");
fs.writeFileSync(htmlPath, html, "utf8");

(async () => {
  try {
    const pw = require("playwright");
    const browser = await pw.chromium.launch();
    const page = await browser.newPage({
      viewport: { width: 1400, height: 1600 },
      deviceScaleFactor: 2,
    });
    await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle" });
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "iteration4-build-verification.png"),
      fullPage: true,
    });
    await browser.close();
    console.log("PNG written to screenshots/iteration4-build-verification.png");
  } catch (err) {
    console.log("Playwright not available — wrote self-contained HTML instead:", htmlPath);
  }
})();

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
