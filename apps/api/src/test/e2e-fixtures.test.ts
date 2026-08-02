import assert from "node:assert/strict";
import { test } from "node:test";
import { FixtureSessionVerificationPort } from "@maitre/adapter-persistence-memory";
import { buildContainer } from "../composition/container.js";
import {
  assertIsolatedE2EEnvironment,
  registerE2EFixtures,
} from "../composition/e2e-fixtures.js";

const isolatedEnvironment = {
  APP_ENV: "e2e",
  E2E_FIXTURES_ENABLED: "1",
  E2E_RUN_ID: "run-20260730-a",
  E2E_BUSINESS_CLOCK: "2026-07-30T18:00:00.000Z",
  E2E_BOOTSTRAP_SECRET: "run-20260730-a.0123456789abcdef0123456789abcdef",
  E2E_WAITER_TOKEN: "waiter-token",
  E2E_COOK_TOKEN: "cook-token",
  E2E_CASHIER_TOKEN: "cashier-token",
  E2E_AUDITOR_TOKEN: "auditor-token",
  E2E_TENANT_B_TOKEN: "tenant-b-token",
};

test("E2E fixture guard fails closed in shared environments", () => {
  assert.throws(
    () =>
      assertIsolatedE2EEnvironment({
        ...isolatedEnvironment,
        VERCEL_ENV: "preview",
      }),
    /forbidden outside/,
  );
});

test("E2E fixtures register scoped operational and auditor principals", async () => {
  const container = await buildContainer();
  const owner = await container.users.findByExternalIdentity(
    "fixture",
    "demo-owner",
  );
  const tenantId = (await container.memberships.listActiveByUser(owner!.id))[0]!
    .tenantId;
  const branchId = (await container.branches.listByTenant(tenantId))[0]!.id;
  const sessions = new FixtureSessionVerificationPort();

  await registerE2EFixtures(
    container,
    sessions,
    tenantId,
    branchId,
    isolatedEnvironment,
  );
  const persistedWaiter = await container.users.findByExternalIdentity(
    "fixture",
    "e2e-run-20260730-a-waiter",
  );
  await container.users.save({ ...persistedWaiter!, email: null });
  await registerE2EFixtures(
    container,
    sessions,
    tenantId,
    branchId,
    isolatedEnvironment,
  );

  for (const [token, roleId] of [
    ["waiter-token", "role_waiter"],
    ["cook-token", "role_cook"],
    ["cashier-token", "role_cashier"],
    ["auditor-token", "role_admin"],
  ] as const) {
    const principal = await sessions.verifyAccessToken(token);
    const user = await container.users.findByExternalIdentity(
      principal.provider,
      principal.subject,
    );
    const membership = await container.memberships.findActiveByUserAndTenant(
      user!.id,
      tenantId,
    );
    assert.deepEqual(membership?.roleIds, [roleId]);
    assert.deepEqual(membership?.branchIds, [branchId]);
    assert.equal(
      user?.email,
      `e2e-run-20260730-a-${principal.subject.split("-").at(-1)}@example.test`,
    );
  }
});
