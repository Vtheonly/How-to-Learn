#!/usr/bin/env node
/**
 * Rebuild better-sqlite3 — diagnostic + auto-fix script for the
 * NODE_MODULE_VERSION mismatch error.
 *
 * ── Iteration 6 / Fix #51 (build blocker) ────────────────────────
 * Background (user's terminal output on first `npm start`):
 *   app.boot.failure {"service":"el-imtiyaz","error":"Failed to
 *   open database: The module '.../better_sqlite3.node' was
 *   compiled against a different Node.js version using
 *   NODE_MODULE_VERSION 127. This version of Node.js requires
 *   NODE_MODULE_VERSION 128. Please try re-compiling or
 *   re-installing the module (for instance, using `npm rebuild`
 *   or `npm install`)."}
 *
 *   This happens when:
 *     1. `npm install` was run under one Node.js version (e.g.
 *        Node 20 → NODE_MODULE_VERSION 115, Node 21 → 120,
 *        Node 22 → 127, Node 23 → 131).
 *     2. The user later runs `npm start` under a different Node
 *        version (or under Electron, which carries its own V8).
 *
 *   The fix is straightforward: `npm rebuild better-sqlite3` (or
 *   `npm rebuild` to recompile every native module). But the
 *   error message at runtime is buried inside Electron's boot
 *   log, which is not obviously actionable for an operator.
 *
 *   This script:
 *     1. Detects whether better-sqlite3's native binary is loadable
 *        from the current Node.js runtime.
 *     2. If NOT, runs `npm rebuild better-sqlite3` automatically.
 *     3. Verifies the rebuild succeeded by re-attempting the load.
 *     4. Exits with code 0 on success, non-zero on failure.
 *
 *   Wire it into package.json as a `postinstall` hook so it runs
 *   automatically after every `npm install`:
 *
 *     "scripts": {
 *       "postinstall": "node scripts/rebuild-better-sqlite3.js",
 *       ...
 *     }
 *
 *   The script is idempotent: if better-sqlite3 already loads
 *   cleanly, it exits 0 without invoking `npm rebuild`.
 */

"use strict";

const { execSync } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");

const ROOT = path.resolve(__dirname, "..");
const MODULE_DIR = path.join(ROOT, "node_modules", "better-sqlite3");
const NATIVE_BINARY = path.join(
  MODULE_DIR,
  "build",
  "Release",
  "better_sqlite3.node",
);

function log(msg) {
  // eslint-disable-next-line no-console
  console.log(`[rebuild-better-sqlite3] ${msg}`);
}

function tryLoadNative() {
  if (!fs.existsSync(NATIVE_BINARY)) {
    return { ok: false, reason: `native binary not found at ${NATIVE_BINARY}` };
  }
  try {
    // eslint-disable-next-line global-require
    require(MODULE_DIR);
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: String(err && err.message ? err.message : err) };
  }
}

function runRebuild() {
  log("running `npm rebuild better-sqlite3` ...");
  try {
    execSync("npm rebuild better-sqlite3", {
      cwd: ROOT,
      stdio: "inherit",
    });
    return true;
  } catch (err) {
    log(`npm rebuild failed: ${err && err.message ? err.message : err}`);
    return false;
  }
}

function main() {
  log(`node ${process.version} (NODE_MODULE_VERSION ${process.versions.modules})`);
  log(`checking ${NATIVE_BINARY} ...`);

  if (!fs.existsSync(MODULE_DIR)) {
    log(`better-sqlite3 is not installed at ${MODULE_DIR} — nothing to rebuild.`);
    log(`(this is normal during the very first 'npm install' before dependencies are fetched)`);
    process.exit(0);
  }

  const firstCheck = tryLoadNative();
  if (firstCheck.ok) {
    log("better-sqlite3 native binary loads cleanly — no rebuild needed.");
    process.exit(0);
  }

  log(`native binary failed to load: ${firstCheck.reason}`);
  const rebuilt = runRebuild();
  if (!rebuilt) {
    log("FAILED to rebuild better-sqlite3. The application will not boot.");
    log("Manual fix: run `npm rebuild better-sqlite3` or `npm install` from the project root.");
    process.exit(1);
  }

  const secondCheck = tryLoadNative();
  if (secondCheck.ok) {
    log("better-sqlite3 native binary now loads cleanly after rebuild.");
    process.exit(0);
  }

  log(`native binary STILL fails to load after rebuild: ${secondCheck.reason}`);
  log("This usually means the running Node.js version is incompatible with");
  log("the version of better-sqlite3 declared in package.json. Try:");
  log("  1. Update Node.js to a version compatible with better-sqlite3@^11.x");
  log("     (Node 18, 20, or 22 are known to work).");
  log("  2. Or upgrade better-sqlite3 to a version that supports your Node.");
  log("  3. Or run `npm rebuild` (recompiles ALL native modules, not just better-sqlite3).");
  process.exit(2);
}

main();
