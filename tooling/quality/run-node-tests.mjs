import { mkdirSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { coverageFailures, parseCoverageSummary } from "./coverage-gate.mjs";

const roots = ["apps", "packages", "adapters"];
const quarantined = new Set(["apps/api/dist/test/organization-api.test.js"]);
const discovered = roots.flatMap((root) => collectTests(root));
const testFiles = discovered.filter((file) => !quarantined.has(file));
const coverage = process.argv.includes("--coverage");
const artifactRoot = process.env["ARTIFACTS_DIR"] ?? ".artifacts";
const coverageDirectory = join(artifactRoot, "coverage");
const coverageReportPath = join(coverageDirectory, "node-test-coverage.txt");

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
  ...(coverage
    ? [
        "--test-reporter=spec",
        `--test-reporter-destination=${coverageReportPath}`,
      ]
    : []),
  ...testFiles,
];
if (coverage) mkdirSync(coverageDirectory, { recursive: true });
const result = spawnSync(process.execPath, args, { stdio: "inherit" });
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
if (!coverage) process.exit(0);

const thresholds = JSON.parse(
  readFileSync(new URL("./coverage-thresholds.json", import.meta.url), "utf8"),
);
const summary = parseCoverageSummary(readFileSync(coverageReportPath, "utf8"));
const failures = coverageFailures(summary, thresholds);
if (failures.length) {
  console.error(`Coverage gate failed:\n${failures.join("\n")}`);
  process.exit(1);
}
console.log(
  `Coverage gate passed: lines ${summary.lines}%, branches ${summary.branches}%, functions ${summary.functions}%.`,
);

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
