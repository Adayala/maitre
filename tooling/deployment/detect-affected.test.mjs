import assert from "node:assert/strict";
import test from "node:test";

import { detectAffected } from "./detect-affected.mjs";

const names = (entries) => entries.map(({ name }) => name);
const e2eApps = (entries) => entries.map(({ app }) => app);

test("a frontend change selects only its E2E project and deployment", () => {
  const result = detectAffected(["apps/host/src/app.tsx"]);

  assert.deepEqual(names(result.deploy), ["host"]);
  assert.deepEqual(e2eApps(result.e2e), ["host"]);
});

test("an API change deploys the API and exercises every client", () => {
  const result = detectAffected(["apps/api/src/server.ts"]);

  assert.deepEqual(names(result.deploy), ["api"]);
  assert.deepEqual(e2eApps(result.e2e), [
    "dash",
    "kitchen",
    "floor",
    "cash",
    "host",
    "guest",
  ]);
});

test("shared dependency changes select every application", () => {
  const result = detectAffected(["packages/contracts/src/index.ts"]);

  assert.equal(result.deploy.length, 7);
  assert.equal(result.e2e.length, 6);
});

test("E2E-only changes run tests without producing deployments", () => {
  const result = detectAffected(["tests/e2e/host.spec.ts"]);

  assert.equal(result.deploy.length, 0);
  assert.equal(result.e2e.length, 6);
  assert.equal(result.has_deploy, false);
});

test("documentation-only changes select neither tests nor deployments", () => {
  const result = detectAffected(["docs/operations/runbook.md", "README.md"]);

  assert.deepEqual(result.deploy, []);
  assert.deepEqual(result.e2e, []);
  assert.equal(result.has_e2e, false);
});

test("unknown runtime files fall back to every application", () => {
  const result = detectAffected(["infrastructure/runtime-config.json"]);

  assert.equal(result.deploy.length, 7);
  assert.equal(result.e2e.length, 6);
});

test("manual all mode selects every application even without changed files", () => {
  const result = detectAffected([], { forceAll: true });

  assert.equal(result.deploy.length, 7);
  assert.equal(result.e2e.length, 6);
});
