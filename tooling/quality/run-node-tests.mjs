import { readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const roots = ["apps", "packages", "adapters"];
const quarantined = new Set([
  "apps/api/dist/test/organization-api.test.js",
  "apps/api/dist/test/workforce-api.test.js",
]);
const discovered = roots.flatMap((root) => collectTests(root));
const testFiles = discovered.filter((file) => !quarantined.has(file));
const coverage = process.argv.includes("--coverage");

if (testFiles.length === 0) {
  console.error("No compiled test files were found. Run the build first.");
  process.exit(1);
}
console.warn(
  `Running ${testFiles.length} compiled test files; ${quarantined.size} legacy API suites are quarantined (see SPEC-207 hardening).`,
);

const args = [
  ...(coverage ? ["--experimental-test-coverage"] : []),
  "--test",
  "--test-concurrency=1",
  ...testFiles,
];
const result = spawnSync(process.execPath, args, { stdio: "inherit" });
process.exit(result.status ?? 1);

function collectTests(root) {
  const results = [];
  visit(root, results);
  return results.sort();
}

function visit(directory, results) {
  let entries;
  try {
    entries = readdirSync(directory, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.name === "node_modules") continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      visit(path, results);
    } else if (path.includes("/dist/test/") && path.endsWith(".test.js")) {
      results.push(path);
    }
  }
}
