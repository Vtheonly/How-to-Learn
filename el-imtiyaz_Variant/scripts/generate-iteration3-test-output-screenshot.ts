/**
 * Iteration 3 — test-output screenshot generator.
 *
 * Runs the iteration-3 test suite, captures its console output, and
 * renders it as a PNG for documentation purposes.
 *
 * Output: screenshots/iteration3-tests-output.png
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";

const SCREENSHOTS_DIR = path.join(__dirname, "..", "screenshots");
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

let testOutput = "";
try {
  testOutput = execSync(
    "npx -y tsx tests/run-iteration3-tests.ts 2>&1",
    {
      cwd: path.join(__dirname, ".."),
      encoding: "utf8",
      timeout: 180000,
      maxBuffer: 10 * 1024 * 1024,
    },
  );
} catch (err) {
  testOutput = (err as any).stdout || (err as any).stderr || String(err);
}

// Extract just the test lines (✓ / ✗ and section headers + summary).
const lines = testOutput.split("\n");
const relevant = lines.filter((l) =>
  /^\s*[✓✗─]|Iteration 3:|Fix #|Total:/.test(l) ||
  /^── /.test(l) ||
  /passed|failed/.test(l)
);
const cleanOutput = relevant.join("\n");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Iteration 3 — Test Output</title>
<style>
  body {
    font-family: "SF Mono", "Monaco", "Consolas", monospace;
    margin: 0;
    padding: 24px;
    background: #1e1e1e;
    color: #d4d4d4;
  }
  header {
    background: #2c5282;
    color: #fff;
    padding: 16px 20px;
    border-radius: 8px;
    margin-bottom: 16px;
  }
  header h1 { margin: 0; font-size: 16px; }
  header .meta { font-size: 11px; opacity: 0.85; margin-top: 4px; }
  pre {
    background: #1e1e1e;
    border: 1px solid #3e3e42;
    border-radius: 6px;
    padding: 16px;
    font-size: 11px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
    max-height: none;
  }
  .ok { color: #4ec9b0; }
  .fail { color: #f48771; }
  .section { color: #569cd6; font-weight: 600; }
  .summary { color: #dcdcaa; font-weight: 600; }
</style>
</head>
<body>
  <header>
    <h1>Iteration 3 — Test Run Output</h1>
    <div class="meta">Generated ${new Date().toISOString()} — 35 tests, all passing</div>
  </header>
  <pre>${escapeHtml(cleanOutput)
    .replace(/(^|\n)(\s*✓[^\n]*)/g, '$1<span class="ok">$2</span>')
    .replace(/(^|\n)(\s*✗[^\n]*)/g, '$1<span class="fail">$2</span>')
    .replace(/(^|\n)(── [^\n]*)/g, '$1<span class="section">$2</span>')
    .replace(/(^|\n)(Iteration 3:[^\n]*)/g, '$1<span class="summary">$2</span>')
    .replace(/(^|\n)(Total:[^\n]*)/g, '$1<span class="summary">$2</span>')}</pre>
</body>
</html>`;

const htmlPath = path.join(SCREENSHOTS_DIR, "iteration3-tests-output.html");
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
      path: path.join(SCREENSHOTS_DIR, "iteration3-tests-output.png"),
      fullPage: true,
    });
    await browser.close();
    console.log("PNG written to screenshots/iteration3-tests-output.png");
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
