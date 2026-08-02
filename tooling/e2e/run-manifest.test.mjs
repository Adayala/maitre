import assert from "node:assert/strict";
import { test } from "node:test";
import { createRunManifest } from "./run-manifest.mjs";

const validEnvironment = {
  APP_ENV: "e2e",
  E2E_FIXTURES_ENABLED: "1",
  E2E_RUN_ID: "run-20260730-a",
  E2E_PROFILE: "local-memory",
  E2E_SEED: "20260730",
  E2E_BUSINESS_CLOCK: "2026-07-30T18:00:00.000Z",
  E2E_BOOTSTRAP_SECRET: "run-20260730-a.0123456789abcdef0123456789abcdef",
  E2E_WAITER_TOKEN: "waiter-token",
  E2E_COOK_TOKEN: "cook-token",
  E2E_CASHIER_TOKEN: "cashier-token",
  E2E_AUDITOR_TOKEN: "auditor-token",
  E2E_TENANT_B_TOKEN: "tenant-b-token",
};

test("run manifest records replay inputs without serializing credentials", () => {
  const manifest = createRunManifest(validEnvironment);
  assert.equal(manifest.seed, 20260730);
  assert.equal(manifest.releaseEvidence, false);
  assert.equal(
    manifest.principals.cashier.tokenEnvironmentVariable,
    "E2E_CASHIER_TOKEN",
  );
  assert.equal(manifest.applications.host, "http://127.0.0.1:5278");
  assert.equal(manifest.applications.guest, "http://127.0.0.1:5279");
  assert.equal(
    createRunManifest({
      ...validEnvironment,
      E2E_HOST_URL: "https://host.e2e.test",
    }).applications.host,
    "https://host.e2e.test",
  );
  assert.equal(
    createRunManifest({
      ...validEnvironment,
      E2E_GUEST_URL: "https://guest.e2e.test",
    }).applications.guest,
    "https://guest.e2e.test",
  );
  assert.equal(JSON.stringify(manifest).includes("cashier-token"), false);
});

test("run manifest fails closed outside isolated e2e", () => {
  assert.throws(
    () => createRunManifest({ ...validEnvironment, APP_ENV: "production" }),
    /APP_ENV=e2e/,
  );
  assert.throws(
    () => createRunManifest({ ...validEnvironment, VERCEL_ENV: "preview" }),
    /shared environments/,
  );
  assert.throws(
    () =>
      createRunManifest({
        ...validEnvironment,
        E2E_BOOTSTRAP_SECRET: "not-run-scoped",
      }),
    /strong and run-scoped/,
  );
});
