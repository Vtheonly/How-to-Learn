/**
 * Iteration 2 — render the iteration-2 test output as a PNG.
 *
 * Output: screenshots/iteration2-tests-output.png
 */

import * as cp from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

const SCREENSHOTS_DIR = path.join(__dirname, "..", "screenshots");
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

console.log("Running iteration-2 tests...");
const result = cp.spawnSync(
  "npx",
  ["--yes", "tsx", "tests/run-iteration2-tests.ts"],
  {
    cwd: path.join(__dirname, ".."),
    encoding: "utf8",
    timeout: 120000,
  },
);

const clean = (result.stdout ?? "").replace(/\u001b\[[0-9;]*m/g, "");
const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Iteration 2 Test Output</title>
<style>
  body { margin: 0; padding: 24px; background: #0e1116; font-family: "SF Mono", "Monaco", "Menlo", "Consolas", monospace; }
  .term { background: #161a21; color: #c9d1d9; border-radius: 8px; padding: 20px 24px; border: 1px solid #2a2f37; font-size: 12px; line-height: 1.55; white-space: pre-wrap; word-break: break-word; }
  .titlebar { background: #1f242c; color: #c9d1d9; padding: 8px 16px; border-radius: 8px 8px 0 0; border: 1px solid #2a2f37; border-bottom: none; font-family: -apple-system, system-ui, sans-serif; font-size: 13px; display: flex; align-items: center; gap: 8px; }
  .dot { width: 11px; height: 11px; border-radius: 50%; }
  .red { background: #ff5f56; } .yellow { background: #ffbd2e; } .green { background: #27c93f; }
  .title-text { margin-left: 8px; opacity: 0.85; }
</style></head><body>
  <div class="titlebar">
    <span class="dot red"></span>
    <span class="dot yellow"></span>
    <span class="dot green"></span>
    <span class="title-text">Iteration 2 Tests — tests/run-iteration2-tests.ts</span>
  </div>
  <div class="term">$ npx tsx tests/run-iteration2-tests.ts\n\n${clean}</div>
</body></html>`;

const htmlPath = path.join(SCREENSHOTS_DIR, "iteration2-tests-output.html");
fs.writeFileSync(htmlPath, html, "utf8");

(async () => {
  try {
    const pw = require("playwright");
    const browser = await pw.chromium.launch();
    const page = await browser.newPage({
      viewport: { width: 1400, height: 1000 },
      deviceScaleFactor: 2,
    });
    await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle" });
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "iteration2-tests-output.png"),
      fullPage: true,
    });
    await browser.close();
    console.log("PNG written to screenshots/iteration2-tests-output.png");
  } catch {
    console.log("Playwright not available — wrote HTML:", htmlPath);
  }
})();
