import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  forbiddenRootOutputs,
  forbiddenTrackedPaths,
  requiredIgnoreRules,
  rootLayoutViolations,
} from "./root-layout.mjs";

const repositoryRoot = dirname(
  dirname(dirname(fileURLToPath(import.meta.url))),
);

test("rootLayoutViolations accepts the repository policy", () => {
  assert.deepEqual(
    rootLayoutViolations({
      rootEntries: [".artifacts", "apps", "docs"],
      ignoreRules: requiredIgnoreRules,
      trackedFiles: [".claude/settings.json", "apps/api/package.json"],
    }),
    [],
  );
});

test("rootLayoutViolations reports generated outputs, missing ignores and local tracked paths", () => {
  const violations = rootLayoutViolations({
    rootEntries: forbiddenRootOutputs,
    ignoreRules: requiredIgnoreRules.slice(1),
    trackedFiles: forbiddenTrackedPaths.flatMap((path) => [
      path,
      `${path}/nested.txt`,
    ]),
  });

  assert.deepEqual(violations, [
    ...forbiddenRootOutputs.map((path) => `forbidden root output: ${path}`),
    `missing .gitignore rule: ${requiredIgnoreRules[0]}`,
    ...forbiddenTrackedPaths.map((path) => `local path is tracked: ${path}`),
  ]);
});

test("el root real cumple la política de outputs y paths locales", () => {
  const ignoreRules = readFileSync(join(repositoryRoot, ".gitignore"), "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
  const trackedFiles = execFileSync("git", ["ls-files", "-z"], {
    cwd: repositoryRoot,
    encoding: "utf8",
    env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" },
  })
    .split("\0")
    .filter(Boolean);

  assert.deepEqual(
    rootLayoutViolations({
      rootEntries: readdirSync(repositoryRoot),
      ignoreRules,
      trackedFiles,
    }),
    [],
  );
});
