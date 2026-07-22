/**
 * Native Module Rebuilder for better-sqlite3 on Electron
 *
 * Forces rebuilding better-sqlite3 specifically for Electron (NODE_MODULE_VERSION 128)
 * instead of checking system Node.js (NODE_MODULE_VERSION 127).
 */

const path = require("path");
const { execSync } = require("child_process");

async function rebuild() {
  const projectRoot = path.resolve(__dirname, "..");
  console.log(
    "[rebuild-better-sqlite3] Starting force rebuild of better-sqlite3 for Electron...",
  );

  let electronVersion;
  try {
    const electronPkg = require(
      path.join(projectRoot, "node_modules", "electron", "package.json"),
    );
    electronVersion = electronPkg.version;
    console.log(
      `[rebuild-better-sqlite3] Target Electron Version: v${electronVersion}`,
    );
  } catch (e) {
    console.error(
      "[rebuild-better-sqlite3] Could not find installed Electron in node_modules.",
    );
    process.exit(1);
  }

  // Attempt 1: Programmatic rebuild via @electron/rebuild
  try {
    const electronRebuild = require("@electron/rebuild");
    console.log(
      "[rebuild-better-sqlite3] Rebuilding with @electron/rebuild module...",
    );
    await electronRebuild.rebuild({
      buildPath: projectRoot,
      electronVersion: electronVersion,
      onlyModules: ["better-sqlite3"],
      force: true,
    });
    console.log(
      "[rebuild-better-sqlite3] Successfully rebuilt better-sqlite3 for Electron!",
    );
    return;
  } catch (err) {
    console.warn(
      "[rebuild-better-sqlite3] @electron/rebuild API notice:",
      err.message,
    );
  }

  // Attempt 2: CLI fallback via electron-builder
  try {
    console.log(
      "[rebuild-better-sqlite3] Running electron-builder install-app-deps fallback...",
    );
    execSync("npx electron-builder install-app-deps", {
      cwd: projectRoot,
      stdio: "inherit",
    });
    console.log(
      "[rebuild-better-sqlite3] Successfully rebuilt better-sqlite3 via electron-builder!",
    );
    return;
  } catch (err) {
    console.warn(
      "[rebuild-better-sqlite3] electron-builder fallback notice:",
      err.message,
    );
  }

  // Attempt 3: CLI fallback via @electron/rebuild
  try {
    console.log(
      "[rebuild-better-sqlite3] Running @electron/rebuild CLI fallback...",
    );
    execSync(
      `npx @electron/rebuild -f -w better-sqlite3 -v ${electronVersion}`,
      {
        cwd: projectRoot,
        stdio: "inherit",
      },
    );
    console.log(
      "[rebuild-better-sqlite3] Successfully rebuilt better-sqlite3 via @electron/rebuild CLI!",
    );
    return;
  } catch (err) {
    console.error(
      "[rebuild-better-sqlite3] All rebuild attempts failed:",
      err.message,
    );
    process.exit(1);
  }
}

rebuild();
