import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { buildApp } from "../app.js";
import { buildContainer, type Container } from "../composition/container.js";
import type { FixtureSessionVerificationPort } from "@maitre/adapter-persistence-memory";

// SPEC-055/056/058/059/065 §5 — Fastify inject() coverage for the Floor API.

function sessionsOf(container: Container): FixtureSessionVerificationPort {
  return container.sessions as FixtureSessionVerificationPort;
}

async function getContext(container: Container) {
  const owner = await container.users.findByExternalIdentity("fixture", "demo-owner");
  const memberships = await container.memberships.listActiveByUser(owner!.id);
  const tenantId = memberships[0]!.tenantId;
  const branches = await container.branches.listByTenant(tenantId);
  const branchId = branches[0]!.id;
  return { tenantId, branchId };
}

function ownerHeaders(container: Container, tenantId: string) {
  return { authorization: `Bearer ${container.demoAccessToken}`, "x-tenant-id": tenantId };
}

test("Visit lifecycle: create, close happy path", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const tableId = randomUUID();

  const create = await app.inject({
    method: "POST",
    url: "/v1/visits",
    headers: ownerHeaders(container, tenantId),
    payload: { branchId, tableIds: [tableId], guestCount: 2 },
  });
  assert.equal(create.statusCode, 201);
  const visit = create.json().data;
  assert.equal(visit.status, "OPEN");

  const requestClose = await app.inject({
    method: "POST",
    url: `/v1/visits/${visit.id}/request-close`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(requestClose.statusCode, 200);
  assert.equal(requestClose.json().data.status, "CLOSING");

  const close = await app.inject({
    method: "POST",
    url: `/v1/visits/${visit.id}/close`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(close.statusCode, 200);
  assert.equal(close.json().data.status, "CLOSED");
  await app.close();
});

test("Check + Payment: add line, capture payment, settle", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const tableId = randomUUID();

  const create = await app.inject({
    method: "POST",
    url: "/v1/visits",
    headers: ownerHeaders(container, tenantId),
    payload: { branchId, tableIds: [tableId], guestCount: 2 },
  });
  const visit = create.json().data;

  const createCheck = await app.inject({
    method: "POST",
    url: `/v1/visits/${visit.id}/check`,
    headers: ownerHeaders(container, tenantId),
    payload: { currency: "ARS" },
  });
  assert.equal(createCheck.statusCode, 201);
  const check = createCheck.json().data;
  assert.equal(check.paymentsSummary.count, 0);

  const addLine = await app.inject({
    method: "POST",
    url: `/v1/checks/${check.id}/add-line`,
    headers: ownerHeaders(container, tenantId),
    payload: { description: "Empanadas", amountMinorUnits: 1000 },
  });
  assert.equal(addLine.statusCode, 200);
  assert.equal(addLine.json().data.totals.netDue, 1000);

  const createPayment = await app.inject({
    method: "POST",
    url: `/v1/checks/${check.id}/payments`,
    headers: { ...ownerHeaders(container, tenantId), "x-branch-id": branchId },
    payload: { amountMinorUnits: 1000, currency: "ARS", method: "CASH", idempotencyKey: "idem-test-1" },
  });
  assert.equal(createPayment.statusCode, 201);
  const payment = createPayment.json().data;

  const capture = await app.inject({
    method: "POST",
    url: `/v1/payments/${payment.id}/capture`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(capture.statusCode, 200);
  assert.equal(capture.json().data.status, "CAPTURED");

  const byVisit = await app.inject({
    method: "GET",
    url: `/v1/visits/${visit.id}/check`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(byVisit.statusCode, 200);
  assert.equal(byVisit.json().data.id, check.id);
  assert.equal(byVisit.json().data.paymentsSummary.count, 1);
  assert.equal(byVisit.json().data.paymentsSummary.capturedCount, 1);
  assert.equal(byVisit.json().data.paymentsSummary.paidMinorUnits, 1000);

  const requestPayment = await app.inject({
    method: "POST",
    url: `/v1/checks/${check.id}/request-payment`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(requestPayment.statusCode, 200);

  const settle = await app.inject({
    method: "POST",
    url: `/v1/checks/${check.id}/settle`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(settle.statusCode, 200);
  assert.equal(settle.json().data.status, "SETTLED");
  assert.equal(settle.json().data.totals.balance, 0);
  assert.equal(settle.json().data.paymentsSummary.paidMinorUnits, 1000);
  await app.close();
});

test("403 without permission, 404 for unknown ids", async () => {
  const container = await buildContainer();
  const { tenantId } = await getContext(container);
  const app = await buildApp(container);
  const now = new Date();

  const cook = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "demo-cook",
    displayName: "Demo Cook",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.users.save(cook);
  await container.memberships.save({
    id: randomUUID(),
    tenantId,
    userId: cook.id,
    status: "ACTIVE",
    branchScopeType: "ALL_BRANCHES",
    roleIds: ["role_cook"],
    branchIds: [],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  const token = "cook-token-floor";
  sessionsOf(container).registerToken(token, {
    provider: "fixture",
    subject: "demo-cook",
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });

  const forbidden = await app.inject({
    method: "POST",
    url: "/v1/visits",
    headers: { authorization: `Bearer ${token}`, "x-tenant-id": tenantId },
    payload: { branchId: randomUUID(), tableIds: [randomUUID()], guestCount: 2 },
  });
  assert.equal(forbidden.statusCode, 403);

  const notFound = await app.inject({
    method: "GET",
    url: `/v1/visits/${randomUUID()}`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(notFound.statusCode, 404);
  await app.close();
});

test("ServicePeriod force-close endpoint closes a closing period and requires reason", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);

  const create = await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/service-periods`,
    headers: ownerHeaders(container, tenantId),
    payload: { businessDate: "2026-07-25", name: "Dinner", type: "DINNER" },
  });
  assert.equal(create.statusCode, 201);
  const period = create.json().data;

  const open = await app.inject({
    method: "POST",
    url: `/v1/service-periods/${period.id}/open`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(open.statusCode, 200);

  const beginClose = await app.inject({
    method: "POST",
    url: `/v1/service-periods/${period.id}/begin-close`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(beginClose.statusCode, 200);

  const missingReason = await app.inject({
    method: "POST",
    url: `/v1/service-periods/${period.id}/force-close`,
    headers: ownerHeaders(container, tenantId),
    payload: {},
  });
  assert.equal(missingReason.statusCode, 400);

  const forceClose = await app.inject({
    method: "POST",
    url: `/v1/service-periods/${period.id}/force-close`,
    headers: ownerHeaders(container, tenantId),
    payload: { reason: "manual override" },
  });
  assert.equal(forceClose.statusCode, 200);
  assert.equal(forceClose.json().data.status, "CLOSED");
  assert.ok(forceClose.json().data.actualClose);
  await app.close();
});
