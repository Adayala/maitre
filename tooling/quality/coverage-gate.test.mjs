import assert from "node:assert/strict";
import test from "node:test";

import { coverageFailures, parseCoverageSummary } from "./coverage-gate.mjs";

test("parses the three metrics emitted by the Node coverage reporter", () => {
  const summary = parseCoverageSummary(
    "ℹ all files | 78.14 | 82.61 | 81.22 |\nℹ end of coverage report",
  );

  assert.deepEqual(summary, {
    lines: 78.14,
    branches: 82.61,
    functions: 81.22,
  });
});

test("accepts a summary at or above every threshold", () => {
  assert.deepEqual(
    coverageFailures(
      { lines: 78, branches: 82.5, functions: 81 },
      { lines: 78, branches: 82, functions: 81 },
    ),
    [],
  );
});

test("reports every regressed or unknown metric", () => {
  assert.deepEqual(
    coverageFailures(
      { lines: 77.99, branches: 81.5, functions: undefined },
      { lines: 78, branches: 82, functions: 81 },
    ),
    [
      "lines coverage 77.99% is below 78.00%",
      "branches coverage 81.50% is below 82.00%",
      "Unknown coverage metric: functions",
    ],
  );
});

test("rejects output without a global coverage summary", () => {
  assert.throws(
    () => parseCoverageSummary("tests passed without coverage"),
    /coverage summary was not found/,
  );
});
