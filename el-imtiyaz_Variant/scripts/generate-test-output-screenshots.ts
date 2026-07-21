/**
 * Renders the actual test-runner output (from tests/run-all-tests.ts and
 * tests/integration/ledger-service.test.ts) as a high-resolution PNG.
 *
 * Output:
 *   screenshots/unit-tests-output.png
 *   screenshots/integration-tests-output.png
 *
 * Run with:
 *   npx tsx scripts/generate-test-output-screenshots.ts
 */

import * as cp from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

const SCREENSHOTS_DIR = path.join(__dirname, "..", "screenshots");
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

function runCapture(cmd: string): { stdout: string; stderr: string; code: number } {
  const result = cp.spawnSync("npx", ["--yes", "tsx", ...cmd.split(" ")], {
    cwd: path.join(__dirname, ".."),
    encoding: "utf8",
    timeout: 120000,
  });
  return {
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    code: result.status ?? -1,
  };
}

function renderTerminal(title: string, body: string, outFile: string): void {
  // Strip ANSI colour codes — the logger uses them.
  const clean = body.replace(/\u001b\[[0-9;]*m/g, "");
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>${title}</title>
<style>
  body {
    margin: 0;
    padding: 24px;
    background: #0e1116;
    font-family: "SF Mono", "Monaco", "Menlo", "Consolas", monospace;
  }
  .term {
    background: #161a21;
    color: #c9d1d9;
    border-radius: 8px;
    padding: 20px 24px;
    border: 1px solid #2a2f37;
    font-size: 12px;
    line-height: 1.55;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .titlebar {
    background: #1f242c;
    color: #c9d1d9;
    padding: 8px 16px;
    border-radius: 8px 8px 0 0;
    border: 1px solid #2a2f37;
    border-bottom: none;
    font-family: -apple-system, system-ui, sans-serif;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .dot { width: 11px; height: 11px; border-radius: 50%; }
  .red { background: #ff5f56; }
  .yellow { background: #ffbd2e; }
  .green { background: #27c93f; }
  .title-text { margin-left: 8px; opacity: 0.85; }
</style></head><body>
  <div class="titlebar">
    <span class="dot red"></span>
    <span class="dot yellow"></span>
    <span class="dot green"></span>
    <span class="title-text">${title}</span>
  </div>
  <div class="term">${clean.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
</body></html>`;
  const htmlPath = outFile.replace(/\.png$/, ".html");
  fs.writeFileSync(htmlPath, html, "utf8");

  try {
    const pw = require("playwright");
    pw.chromium.launch().then(async (browser: any) => {
      const page = await browser.newPage({
        viewport: { width: 1400, height: 1000 },
        deviceScaleFactor: 2,
      });
      await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle" });
      await page.screenshot({ path: outFile, fullPage: true });
      await browser.close();
      console.log(`PNG written to ${path.relative(process.cwd(), outFile)}`);
    });
  } catch {
    console.log(`Playwright not available — wrote HTML: ${htmlPath}`);
  }
}

// Unit tests
console.log("Running unit tests...");
const unit = runCapture("tests/run-all-tests.ts");
renderTerminal(
  "Unit Tests — tests/run-all-tests.ts",
  `$ npx tsx tests/run-all-tests.ts\n\n${unit.stdout}\n${unit.stderr}`,
  path.join(SCREENSHOTS_DIR, "unit-tests-output.png"),
);

// Integration tests
console.log("Running integration tests...");
const integ = runCapture("tests/integration/ledger-service.test.ts");
renderTerminal(
  "Integration Tests — tests/integration/ledger-service.test.ts",
  `$ npx tsx tests/integration/ledger-service.test.ts\n\n${integ.stdout}\n${integ.stderr}`,
  path.join(SCREENSHOTS_DIR, "integration-tests-output.png"),
);
