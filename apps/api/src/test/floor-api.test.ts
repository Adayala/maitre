import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { buildApp } from "../app.js";
import { buildContainer, type Container } from "../composition/container.js";
import type { FixtureSessionVerificationPort } from "@maitre/adapter-persistence-memory";

// SPEC-055/056/058/059/065 §5 — Fastify inject() coverage for the Floor API.

function serialTest(name: string, fn: () => Promise<void> | void) {
  return test(name, { concurrency: false }, fn);
}

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

async function seedForeignServicePeriod(container: Container) {
  const now = new Date();
  const tenantId = randomUUID();
  const branchId = randomUUID();
  const servicePeriodId = randomUUID();

  await container.tenants.save({
    id: tenantId,
    name: "Foreign Tenant Floor",
    status: "ACTIVE",
    defaultLocale: "es-AR",
    defaultCurrency: "ARS",
    defaultTimezone: "America/Argentina/Buenos_Aires",
    createdAt: now,
    updatedAt: now,
  });

  await container.branches.save({
    id: branchId,
    tenantId,
    brandId: randomUUID(),
    code: "FOREIGN",
    name: "Foreign Branch Floor",
    timezone: "America/Argentina/Buenos_Aires",
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
  });

  await container.servicePeriods.save({
    id: servicePeriodId,
    tenantId,
    branchId,
    businessDate: "2026-07-25",
    name: "Foreign Dinner",
    type: "DINNER",
    status: "PLANNED",
    revision: 1,
    createdAt: now,
    updatedAt: now,
  });

  return { tenantId, branchId, servicePeriodId };
}

serialTest("Visit lifecycle: create, close happy path", async () => {
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
  assert.deepEqual(Object.keys(create.json()).sort(), ["data"]);
  const visit = create.json().data;
  assert.deepEqual(
    new Set(Object.keys(visit as Record<string, unknown>)),
    new Set(["id", "tenantId", "branchId", "tableIds", "guestCount", "status", "revision", "createdAt", "updatedAt"]),
  );
  assert.equal(visit.status, "OPEN");
  assert.equal(visit.revision, 1);
  assert.ok(!Number.isNaN(Date.parse(visit.createdAt as string)));
  assert.ok(!Number.isNaN(Date.parse(visit.updatedAt as string)));

  const requestClose = await app.inject({
    method: "POST",
    url: `/v1/visits/${visit.id}/request-close`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(requestClose.statusCode, 200);
  assert.deepEqual(Object.keys(requestClose.json()).sort(), ["data"]);
  assert.deepEqual(
    new Set(Object.keys(requestClose.json().data as Record<string, unknown>)),
    new Set(["id", "tenantId", "branchId", "tableIds", "guestCount", "status", "revision", "createdAt", "updatedAt"]),
  );
  assert.equal(requestClose.json().data.status, "CLOSING");
  assert.equal(requestClose.json().data.revision, 2);
  assert.equal(requestClose.json().data.createdAt, visit.createdAt);
  assert.notEqual(requestClose.json().data.updatedAt, visit.updatedAt);

  const close = await app.inject({
    method: "POST",
    url: `/v1/visits/${visit.id}/close`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(close.statusCode, 200);
  assert.deepEqual(Object.keys(close.json()).sort(), ["data"]);
  assert.deepEqual(
    new Set(Object.keys(close.json().data as Record<string, unknown>)),
    new Set(["id", "tenantId", "branchId", "tableIds", "guestCount", "status", "revision", "createdAt", "updatedAt", "closedAt"]),
  );
  assert.equal(close.json().data.status, "CLOSED");
  assert.equal(close.json().data.revision, 3);
  assert.equal(close.json().data.createdAt, visit.createdAt);
  assert.ok(!Number.isNaN(Date.parse(close.json().data.closedAt as string)));
  assert.equal(close.json().data.updatedAt, close.json().data.closedAt);
  await app.close();
});

serialTest("Visit reopen returns CLOSING to OPEN and visit list is query-scoped by branchId", async () => {
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
  assert.deepEqual(Object.keys(create.json()).sort(), ["data"]);
  const visit = create.json().data;
  assert.equal(visit.revision, 1);

  const list = await app.inject({
    method: "GET",
    url: `/v1/visits?branchId=${branchId}`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(list.statusCode, 200);
  assert.deepEqual(Object.keys(list.json()).sort(), ["data"]);
  const listed = list.json().data.find((row: { id: string }) => row.id === visit.id);
  assert.ok(listed);
  assert.deepEqual(
    new Set(Object.keys(listed as Record<string, unknown>)),
    new Set(["id", "tenantId", "branchId", "tableIds", "guestCount", "status", "revision", "createdAt", "updatedAt"]),
  );
  assert.equal(listed.revision, 1);
  assert.equal(listed.createdAt, visit.createdAt);
  assert.equal(listed.updatedAt, visit.updatedAt);

  const requestClose = await app.inject({
    method: "POST",
    url: `/v1/visits/${visit.id}/request-close`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(requestClose.statusCode, 200);
  assert.deepEqual(Object.keys(requestClose.json()).sort(), ["data"]);
  assert.equal(requestClose.json().data.status, "CLOSING");
  assert.equal(requestClose.json().data.revision, 2);

  const reopen = await app.inject({
    method: "POST",
    url: `/v1/visits/${visit.id}/reopen`,
    headers: ownerHeaders(container, tenantId),
    payload: { reason: "manager correction" },
  });
  assert.equal(reopen.statusCode, 200);
  assert.deepEqual(Object.keys(reopen.json()).sort(), ["data"]);
  assert.deepEqual(
    new Set(Object.keys(reopen.json().data as Record<string, unknown>)),
    new Set(["id", "tenantId", "branchId", "tableIds", "guestCount", "status", "revision", "createdAt", "updatedAt"]),
  );
  assert.equal(reopen.json().data.status, "OPEN");
  assert.equal(reopen.json().data.revision, 3);
  assert.equal(reopen.json().data.createdAt, visit.createdAt);
  assert.notEqual(reopen.json().data.updatedAt, requestClose.json().data.updatedAt);
  await app.close();
});

serialTest("Visit move and cancel commands update the visit and enforce branch-scoped list query contract", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const originalTableId = randomUUID();
  const movedTableId = randomUUID();

  const create = await app.inject({
    method: "POST",
    url: "/v1/visits",
    headers: ownerHeaders(container, tenantId),
    payload: { branchId, tableIds: [originalTableId], guestCount: 2 },
  });
  assert.equal(create.statusCode, 201);
  const visit = create.json().data;
  assert.equal(visit.revision, 1);

  const missingBranchQuery = await app.inject({
    method: "GET",
    url: "/v1/visits",
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(missingBranchQuery.statusCode, 400);
  assert.deepEqual(
    new Set(Object.keys(missingBranchQuery.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(missingBranchQuery.json().type, "bad-request");
  assert.equal(missingBranchQuery.json().title, "branchId is required");
  assert.equal(missingBranchQuery.json().status, 400);

  const move = await app.inject({
    method: "POST",
    url: `/v1/visits/${visit.id}/move`,
    headers: ownerHeaders(container, tenantId),
    payload: { tableIds: [movedTableId] },
  });
  assert.equal(move.statusCode, 200);
  assert.deepEqual(
    new Set(Object.keys(move.json().data as Record<string, unknown>)),
    new Set(["id", "tenantId", "branchId", "tableIds", "guestCount", "status", "revision", "createdAt", "updatedAt"]),
  );
  assert.deepEqual(move.json().data.tableIds, [movedTableId]);
  assert.equal(move.json().data.revision, 2);
  assert.equal(move.json().data.createdAt, visit.createdAt);
  assert.notEqual(move.json().data.updatedAt, visit.updatedAt);

  const cancel = await app.inject({
    method: "POST",
    url: `/v1/visits/${visit.id}/cancel`,
    headers: ownerHeaders(container, tenantId),
    payload: { reason: "guest no-show after seating correction" },
  });
  assert.equal(cancel.statusCode, 200);
  assert.deepEqual(
    new Set(Object.keys(cancel.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "branchId",
      "tableIds",
      "guestCount",
      "status",
      "revision",
      "createdAt",
      "updatedAt",
      "cancelledAt",
      "cancelReason",
    ]),
  );
  assert.equal(cancel.json().data.status, "CANCELLED");
  assert.equal(cancel.json().data.revision, 3);
  assert.equal(cancel.json().data.cancelReason, "guest no-show after seating correction");
  assert.ok(!Number.isNaN(Date.parse(cancel.json().data.cancelledAt as string)));
  assert.equal(cancel.json().data.updatedAt, cancel.json().data.cancelledAt);

  await app.close();
});

serialTest("Visit commands reject occupied moves, close with unsettled check, and invalid transitions", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);
  const firstTableId = randomUUID();
  const secondTableId = randomUUID();
  const occupiedTableId = randomUUID();

  const firstVisit = await app.inject({
    method: "POST",
    url: "/v1/visits",
    headers,
    payload: { branchId, tableIds: [firstTableId], guestCount: 2 },
  });
  assert.equal(firstVisit.statusCode, 201);
  const visitId = firstVisit.json().data.id as string;

  const occupiedVisit = await app.inject({
    method: "POST",
    url: "/v1/visits",
    headers,
    payload: { branchId, tableIds: [occupiedTableId], guestCount: 2 },
  });
  assert.equal(occupiedVisit.statusCode, 201);

  const moveConflict = await app.inject({
    method: "POST",
    url: `/v1/visits/${visitId}/move`,
    headers,
    payload: { tableIds: [occupiedTableId] },
  });
  assert.equal(moveConflict.statusCode, 409);
  assert.deepEqual(
    new Set(Object.keys(moveConflict.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(moveConflict.json().type, "conflict");
  assert.equal(moveConflict.json().status, 409);

  const moveOk = await app.inject({
    method: "POST",
    url: `/v1/visits/${visitId}/move`,
    headers,
    payload: { tableIds: [secondTableId] },
  });
  assert.equal(moveOk.statusCode, 200);
  assert.deepEqual(moveOk.json().data.tableIds, [secondTableId]);

  const createCheck = await app.inject({
    method: "POST",
    url: `/v1/visits/${visitId}/check`,
    headers,
    payload: { currency: "ARS" },
  });
  assert.equal(createCheck.statusCode, 201);

  const requestClose = await app.inject({
    method: "POST",
    url: `/v1/visits/${visitId}/request-close`,
    headers,
  });
  assert.equal(requestClose.statusCode, 200);

  const closeBlocked = await app.inject({
    method: "POST",
    url: `/v1/visits/${visitId}/close`,
    headers,
  });
  assert.equal(closeBlocked.statusCode, 400);
  assert.deepEqual(
    new Set(Object.keys(closeBlocked.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(closeBlocked.json().type, "bad-request");
  assert.equal(closeBlocked.json().status, 400);

  const requestCloseAgain = await app.inject({
    method: "POST",
    url: `/v1/visits/${visitId}/request-close`,
    headers,
  });
  assert.equal(requestCloseAgain.statusCode, 409);
  assert.deepEqual(
    new Set(Object.keys(requestCloseAgain.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(requestCloseAgain.json().type, "conflict");
  assert.equal(requestCloseAgain.json().status, 409);

  const cancelAfterCheck = await app.inject({
    method: "POST",
    url: `/v1/visits/${visitId}/cancel`,
    headers,
    payload: { reason: "too late" },
  });
  assert.equal(cancelAfterCheck.statusCode, 409);
  assert.deepEqual(
    new Set(Object.keys(cancelAfterCheck.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(cancelAfterCheck.json().type, "conflict");
  assert.equal(cancelAfterCheck.json().status, 409);

  const reopenWithoutReason = await app.inject({
    method: "POST",
    url: `/v1/visits/${visitId}/reopen`,
    headers,
    payload: {},
  });
  assert.equal(reopenWithoutReason.statusCode, 400);
  assert.deepEqual(
    new Set(Object.keys(reopenWithoutReason.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(reopenWithoutReason.json().type, "bad-request");
  assert.equal(reopenWithoutReason.json().status, 400);
  assert.match(String(reopenWithoutReason.json().title), /reason/i);

  const reopen = await app.inject({
    method: "POST",
    url: `/v1/visits/${visitId}/reopen`,
    headers,
    payload: { reason: "manager correction" },
  });
  assert.equal(reopen.statusCode, 200);
  assert.equal(reopen.json().data.status, "OPEN");

  await app.close();
});

serialTest("Check + Payment: add line, capture payment, settle", async () => {
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
  assert.deepEqual(
    new Set(Object.keys(check as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "branchId",
      "visitId",
      "currency",
      "lines",
      "adjustments",
      "status",
      "revision",
      "createdAt",
      "updatedAt",
      "totals",
      "paymentsSummary",
    ]),
  );
  assert.equal(check.paymentsSummary.count, 0);
  assert.deepEqual(
    new Set(Object.keys(check.totals as Record<string, unknown>)),
    new Set(["gross", "discounts", "estimatedTax", "serviceCharges", "netDue", "paid", "balance"]),
  );
  assert.deepEqual(
    new Set(Object.keys(check.paymentsSummary as Record<string, unknown>)),
    new Set(["count", "capturedCount", "refundCount", "paidMinorUnits"]),
  );

  const addLine = await app.inject({
    method: "POST",
    url: `/v1/checks/${check.id}/add-line`,
    headers: ownerHeaders(container, tenantId),
    payload: { description: "Empanadas", amountMinorUnits: 1000 },
  });
  assert.equal(addLine.statusCode, 200);
  assert.equal(addLine.json().data.lines.length, 1);
  assert.deepEqual(
    new Set(Object.keys(addLine.json().data.lines[0] as Record<string, unknown>)),
    new Set(["id", "description", "amountMinorUnits"]),
  );
  assert.equal(addLine.json().data.totals.netDue, 1000);

  const createPayment = await app.inject({
    method: "POST",
    url: `/v1/checks/${check.id}/payments`,
    headers: { ...ownerHeaders(container, tenantId), "x-branch-id": branchId },
    payload: { amountMinorUnits: 1000, currency: "ARS", method: "CASH", idempotencyKey: "idem-test-1" },
  });
  assert.equal(createPayment.statusCode, 201);
  assert.deepEqual(Object.keys(createPayment.json()).sort(), ["data"]);
  const payment = createPayment.json().data;
  assert.deepEqual(
    new Set(Object.keys(payment as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "branchId",
      "checkId",
      "amountMinorUnits",
      "currency",
      "method",
      "status",
      "idempotencyKey",
      "revision",
      "createdAt",
      "updatedAt",
    ]),
  );
  assert.ok(!Number.isNaN(Date.parse(payment.createdAt as string)));
  assert.ok(!Number.isNaN(Date.parse(payment.updatedAt as string)));

  const capture = await app.inject({
    method: "POST",
    url: `/v1/payments/${payment.id}/capture`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(capture.statusCode, 200);
  assert.equal(capture.json().data.revision, 2);
  assert.equal(capture.json().data.status, "CAPTURED");

  const byVisit = await app.inject({
    method: "GET",
    url: `/v1/visits/${visit.id}/check`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(byVisit.statusCode, 200);
  assert.deepEqual(
    new Set(Object.keys(byVisit.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "branchId",
      "visitId",
      "currency",
      "lines",
      "adjustments",
      "status",
      "revision",
      "createdAt",
      "updatedAt",
      "totals",
      "paymentsSummary",
    ]),
  );
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

serialTest("Payments API: create is idempotent, list/get work, fail and void transitions are exposed", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const tableId = randomUUID();

  const visit = (
    await app.inject({
      method: "POST",
      url: "/v1/visits",
      headers: ownerHeaders(container, tenantId),
      payload: { branchId, tableIds: [tableId], guestCount: 2 },
    })
  ).json().data;

  const check = (
    await app.inject({
      method: "POST",
      url: `/v1/visits/${visit.id}/check`,
      headers: ownerHeaders(container, tenantId),
      payload: { currency: "ARS" },
    })
  ).json().data;

  await app.inject({
    method: "POST",
    url: `/v1/checks/${check.id}/add-line`,
    headers: ownerHeaders(container, tenantId),
    payload: { description: "Soda", amountMinorUnits: 1000 },
  });

  const first = await app.inject({
    method: "POST",
    url: `/v1/checks/${check.id}/payments`,
    headers: { ...ownerHeaders(container, tenantId), "x-branch-id": branchId },
    payload: { amountMinorUnits: 500, currency: "ARS", method: "CARD", idempotencyKey: "idem-floor-1" },
  });
  assert.equal(first.statusCode, 201);
  assert.deepEqual(Object.keys(first.json()).sort(), ["data"]);
  const payment = first.json().data;
  assert.deepEqual(
    new Set(Object.keys(payment as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "branchId",
      "checkId",
      "amountMinorUnits",
      "currency",
      "method",
      "status",
      "idempotencyKey",
      "revision",
      "createdAt",
      "updatedAt",
    ]),
  );

  const second = await app.inject({
    method: "POST",
    url: `/v1/checks/${check.id}/payments`,
    headers: { ...ownerHeaders(container, tenantId), "x-branch-id": branchId },
    payload: { amountMinorUnits: 500, currency: "ARS", method: "CARD", idempotencyKey: "idem-floor-1" },
  });
  assert.equal(second.statusCode, 201);
  assert.deepEqual(Object.keys(second.json()).sort(), ["data"]);
  assert.equal(second.json().data.id, payment.id);

  const list = await app.inject({
    method: "GET",
    url: `/v1/checks/${check.id}/payments`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(list.statusCode, 200);
  assert.deepEqual(Object.keys(list.json()).sort(), ["data"]);
  assert.equal(list.json().data.length, 1);
  assert.deepEqual(
    new Set(Object.keys(list.json().data[0] as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "branchId",
      "checkId",
      "amountMinorUnits",
      "currency",
      "method",
      "status",
      "idempotencyKey",
      "revision",
      "createdAt",
      "updatedAt",
    ]),
  );
  assert.equal(list.json().data[0].id, payment.id);

  const get = await app.inject({
    method: "GET",
    url: `/v1/payments/${payment.id}`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(get.statusCode, 200);
  assert.deepEqual(Object.keys(get.json()).sort(), ["data"]);
  assert.deepEqual(
    new Set(Object.keys(get.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "branchId",
      "checkId",
      "amountMinorUnits",
      "currency",
      "method",
      "status",
      "idempotencyKey",
      "revision",
      "createdAt",
      "updatedAt",
    ]),
  );
  assert.equal(get.json().data.status, "PENDING");

  const fail = await app.inject({
    method: "POST",
    url: `/v1/payments/${payment.id}/fail`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(fail.statusCode, 200);
  assert.deepEqual(Object.keys(fail.json()).sort(), ["data"]);
  assert.equal(fail.json().data.status, "FAILED");

  const voidPending = await app.inject({
    method: "POST",
    url: `/v1/checks/${check.id}/payments`,
    headers: { ...ownerHeaders(container, tenantId), "x-branch-id": branchId },
    payload: { amountMinorUnits: 300, currency: "ARS", method: "OTHER", idempotencyKey: "idem-floor-void" },
  });
  assert.equal(voidPending.statusCode, 201);
  assert.deepEqual(Object.keys(voidPending.json()).sort(), ["data"]);
  const pendingPayment = voidPending.json().data;

  const voidRes = await app.inject({
    method: "POST",
    url: `/v1/payments/${pendingPayment.id}/void`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(voidRes.statusCode, 200);
  assert.deepEqual(Object.keys(voidRes.json()).sort(), ["data"]);
  assert.equal(voidRes.json().data.status, "VOID");

  await app.close();
});

serialTest("Payments API: refund and over-capture validation", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const tableId = randomUUID();

  const visit = (
    await app.inject({
      method: "POST",
      url: "/v1/visits",
      headers: ownerHeaders(container, tenantId),
      payload: { branchId, tableIds: [tableId], guestCount: 2 },
    })
  ).json().data;

  const check = (
    await app.inject({
      method: "POST",
      url: `/v1/visits/${visit.id}/check`,
      headers: ownerHeaders(container, tenantId),
      payload: { currency: "ARS" },
    })
  ).json().data;

  await app.inject({
    method: "POST",
    url: `/v1/checks/${check.id}/add-line`,
    headers: ownerHeaders(container, tenantId),
    payload: { description: "Milanesa", amountMinorUnits: 1000 },
  });

  const createPayment = await app.inject({
    method: "POST",
    url: `/v1/checks/${check.id}/payments`,
    headers: { ...ownerHeaders(container, tenantId), "x-branch-id": branchId },
    payload: { amountMinorUnits: 1000, currency: "ARS", method: "CASH", idempotencyKey: "idem-floor-refund" },
  });
  assert.equal(createPayment.statusCode, 201);
  const payment = createPayment.json().data;

  const capture = await app.inject({
    method: "POST",
    url: `/v1/payments/${payment.id}/capture`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(capture.statusCode, 200);
  assert.deepEqual(Object.keys(capture.json()).sort(), ["data"]);

  const refund = await app.inject({
    method: "POST",
    url: `/v1/payments/${payment.id}/refund`,
    headers: ownerHeaders(container, tenantId),
    payload: { amountMinorUnits: 500 },
  });
  assert.equal(refund.statusCode, 200);
  assert.deepEqual(Object.keys(refund.json()).sort(), ["data"]);
  assert.deepEqual(
    new Set(Object.keys(refund.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "branchId",
      "checkId",
      "amountMinorUnits",
      "currency",
      "method",
      "status",
      "idempotencyKey",
      "revision",
      "createdAt",
      "updatedAt",
      "refund",
    ]),
  );
  assert.deepEqual(
    new Set(Object.keys(refund.json().data.refund as Record<string, unknown>)),
    new Set(["amountMinorUnits", "status"]),
  );
  assert.equal(refund.json().data.refund.amountMinorUnits, 500);
  assert.equal(refund.json().data.refund.status, "SUCCEEDED");

  const hugePayment = await app.inject({
    method: "POST",
    url: `/v1/checks/${check.id}/payments`,
    headers: { ...ownerHeaders(container, tenantId), "x-branch-id": branchId },
    payload: { amountMinorUnits: 999999, currency: "ARS", method: "CARD", idempotencyKey: "idem-floor-too-big" },
  });
  assert.equal(hugePayment.statusCode, 201);

  const overCapture = await app.inject({
    method: "POST",
    url: `/v1/payments/${hugePayment.json().data.id}/capture`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(overCapture.statusCode, 400);
  assert.deepEqual(
    new Set(Object.keys(overCapture.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(overCapture.json().type, "bad-request");
  assert.equal(overCapture.json().status, 400);

  await app.close();
});

serialTest("403 without permission, 404 for unknown ids", async () => {
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
  assert.deepEqual(
    new Set(Object.keys(forbidden.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(forbidden.json().type, "insufficient-scope");
  assert.equal(forbidden.json().title, "Insufficient scope");
  assert.equal(forbidden.json().status, 403);

  const notFound = await app.inject({
    method: "GET",
    url: `/v1/visits/${randomUUID()}`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(notFound.statusCode, 404);
  assert.deepEqual(
    new Set(Object.keys(notFound.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(notFound.json().type, "not-found");
  assert.equal(notFound.json().title, "Visit not found");
  assert.equal(notFound.json().status, 404);

  const reopenForbidden = await app.inject({
    method: "POST",
    url: `/v1/visits/${randomUUID()}/reopen`,
    headers: { authorization: `Bearer ${token}`, "x-tenant-id": tenantId },
    payload: { reason: "not allowed" },
  });
  assert.equal(reopenForbidden.statusCode, 403);
  assert.deepEqual(
    new Set(Object.keys(reopenForbidden.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(reopenForbidden.json().type, "insufficient-scope");
  assert.equal(reopenForbidden.json().title, "Insufficient scope");
  assert.equal(reopenForbidden.json().status, 403);
  await app.close();
});

serialTest("ServicePeriod force-close endpoint closes a closing period and requires reason", async () => {
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
  assert.deepEqual(
    new Set(Object.keys(period as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "branchId",
      "businessDate",
      "name",
      "type",
      "status",
      "revision",
      "createdAt",
      "updatedAt",
    ]),
  );
  assert.equal(period.revision, 1);
  assert.ok(!Number.isNaN(Date.parse(period.createdAt as string)));
  assert.ok(!Number.isNaN(Date.parse(period.updatedAt as string)));

  const open = await app.inject({
    method: "POST",
    url: `/v1/service-periods/${period.id}/open`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(open.statusCode, 200);
  assert.deepEqual(
    new Set(Object.keys(open.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "branchId",
      "businessDate",
      "name",
      "type",
      "status",
      "revision",
      "createdAt",
      "updatedAt",
      "actualOpen",
    ]),
  );
  assert.equal(open.json().data.revision, 2);
  assert.equal(open.json().data.createdAt, period.createdAt);
  assert.ok(!Number.isNaN(Date.parse(open.json().data.actualOpen as string)));
  assert.equal(open.json().data.updatedAt, open.json().data.actualOpen);

  const beginClose = await app.inject({
    method: "POST",
    url: `/v1/service-periods/${period.id}/begin-close`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(beginClose.statusCode, 200);
  assert.deepEqual(
    new Set(Object.keys(beginClose.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "branchId",
      "businessDate",
      "name",
      "type",
      "status",
      "revision",
      "createdAt",
      "updatedAt",
      "actualOpen",
    ]),
  );
  assert.equal(beginClose.json().data.revision, 3);
  assert.equal(beginClose.json().data.actualOpen, open.json().data.actualOpen);

  const missingReason = await app.inject({
    method: "POST",
    url: `/v1/service-periods/${period.id}/force-close`,
    headers: ownerHeaders(container, tenantId),
    payload: {},
  });
  assert.equal(missingReason.statusCode, 400);
  assert.deepEqual(
    new Set(Object.keys(missingReason.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(missingReason.json().type, "bad-request");
  assert.equal(missingReason.json().status, 400);
  assert.match(String(missingReason.json().title), /reason/i);

  const forceClose = await app.inject({
    method: "POST",
    url: `/v1/service-periods/${period.id}/force-close`,
    headers: ownerHeaders(container, tenantId),
    payload: { reason: "manual override" },
  });
  assert.equal(forceClose.statusCode, 200);
  assert.deepEqual(
    new Set(Object.keys(forceClose.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "branchId",
      "businessDate",
      "name",
      "type",
      "status",
      "revision",
      "createdAt",
      "updatedAt",
      "actualOpen",
      "actualClose",
    ]),
  );
  assert.equal(forceClose.json().data.status, "CLOSED");
  assert.equal(forceClose.json().data.revision, 4);
  assert.equal(forceClose.json().data.actualOpen, open.json().data.actualOpen);
  assert.ok(!Number.isNaN(Date.parse(forceClose.json().data.actualClose as string)));
  assert.equal(forceClose.json().data.updatedAt, forceClose.json().data.actualClose);
  await app.close();
});

serialTest("ServicePeriod create preserves planned window and happy-path close increments revision", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);

  const create = await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/service-periods`,
    headers,
    payload: {
      businessDate: "2026-07-25",
      name: "Lunch",
      type: "LUNCH",
      plannedOpen: "2026-07-25T12:00:00.000Z",
      plannedClose: "2026-07-25T15:00:00.000Z",
    },
  });
  assert.equal(create.statusCode, 201);
  const created = create.json().data;
  assert.deepEqual(
    new Set(Object.keys(created as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "branchId",
      "businessDate",
      "name",
      "type",
      "status",
      "revision",
      "createdAt",
      "updatedAt",
      "plannedOpen",
      "plannedClose",
    ]),
  );
  assert.equal(created.status, "PLANNED");
  assert.equal(created.revision, 1);
  assert.equal(created.plannedOpen, "2026-07-25T12:00:00.000Z");
  assert.equal(created.plannedClose, "2026-07-25T15:00:00.000Z");

  const open = await app.inject({
    method: "POST",
    url: `/v1/service-periods/${created.id}/open`,
    headers,
  });
  assert.equal(open.statusCode, 200);
  assert.equal(open.json().data.createdAt, created.createdAt);
  assert.equal(open.json().data.status, "OPEN");
  assert.equal(open.json().data.revision, 2);
  assert.ok(!Number.isNaN(Date.parse(open.json().data.actualOpen as string)));
  assert.equal(open.json().data.updatedAt, open.json().data.actualOpen);

  const beginClose = await app.inject({
    method: "POST",
    url: `/v1/service-periods/${created.id}/begin-close`,
    headers,
  });
  assert.equal(beginClose.statusCode, 200);
  assert.equal(beginClose.json().data.status, "CLOSING");
  assert.equal(beginClose.json().data.revision, 3);
  assert.equal(beginClose.json().data.actualOpen, open.json().data.actualOpen);

  const close = await app.inject({
    method: "POST",
    url: `/v1/service-periods/${created.id}/close`,
    headers,
    payload: {},
  });
  assert.equal(close.statusCode, 200);
  assert.equal(close.json().data.status, "CLOSED");
  assert.equal(close.json().data.revision, 4);
  assert.equal(close.json().data.actualOpen, open.json().data.actualOpen);
  assert.ok(!Number.isNaN(Date.parse(close.json().data.actualClose as string)));
  assert.equal(close.json().data.updatedAt, close.json().data.actualClose);

  const detail = await app.inject({
    method: "GET",
    url: `/v1/service-periods/${created.id}`,
    headers,
  });
  assert.equal(detail.statusCode, 200);
  assert.deepEqual(
    new Set(Object.keys(detail.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "branchId",
      "businessDate",
      "name",
      "type",
      "status",
      "revision",
      "createdAt",
      "updatedAt",
      "plannedOpen",
      "plannedClose",
      "actualOpen",
      "actualClose",
    ]),
  );
  assert.equal(detail.json().data.status, "CLOSED");
  assert.equal(detail.json().data.revision, 4);
  assert.equal(detail.json().data.plannedOpen, "2026-07-25T12:00:00.000Z");
  assert.equal(detail.json().data.plannedClose, "2026-07-25T15:00:00.000Z");
  assert.equal(detail.json().data.actualOpen, open.json().data.actualOpen);
  assert.equal(detail.json().data.actualClose, close.json().data.actualClose);

  await app.close();
});

serialTest("ServicePeriod list/detail and transition guards enforce conflict and invalid-state contracts", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);

  const breakfast = await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/service-periods`,
    headers,
    payload: { businessDate: "2026-07-25", name: "Breakfast", type: "BREAKFAST" },
  });
  assert.equal(breakfast.statusCode, 201);
  const breakfastId = breakfast.json().data.id as string;

  const dinner = await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/service-periods`,
    headers,
    payload: { businessDate: "2026-07-25", name: "Dinner", type: "DINNER" },
  });
  assert.equal(dinner.statusCode, 201);
  const dinnerId = dinner.json().data.id as string;

  const list = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/service-periods`,
    headers,
  });
  assert.equal(list.statusCode, 200);
  assert.deepEqual(Object.keys(list.json()).sort(), ["data"]);
  assert.equal(list.json().data.length, 2);
  for (const row of list.json().data as Array<Record<string, unknown>>) {
    assert.deepEqual(
      new Set(Object.keys(row)),
      new Set([
        "id",
        "tenantId",
        "branchId",
        "businessDate",
        "name",
        "type",
        "status",
        "revision",
        "createdAt",
        "updatedAt",
      ]),
    );
  }

  const detail = await app.inject({
    method: "GET",
    url: `/v1/service-periods/${breakfastId}`,
    headers,
  });
  assert.equal(detail.statusCode, 200);
  assert.deepEqual(Object.keys(detail.json()).sort(), ["data"]);
  assert.deepEqual(
    new Set(Object.keys(detail.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "branchId",
      "businessDate",
      "name",
      "type",
      "status",
      "revision",
      "createdAt",
      "updatedAt",
    ]),
  );
  assert.equal(detail.json().data.id, breakfastId);
  assert.equal(detail.json().data.status, "PLANNED");

  const openBreakfast = await app.inject({
    method: "POST",
    url: `/v1/service-periods/${breakfastId}/open`,
    headers,
  });
  assert.equal(openBreakfast.statusCode, 200);
  assert.deepEqual(Object.keys(openBreakfast.json()).sort(), ["data"]);
  assert.equal(openBreakfast.json().data.status, "OPEN");

  const conflictingOpen = await app.inject({
    method: "POST",
    url: `/v1/service-periods/${dinnerId}/open`,
    headers,
  });
  assert.equal(conflictingOpen.statusCode, 409);
  assert.deepEqual(
    new Set(Object.keys(conflictingOpen.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(conflictingOpen.json().type, "conflict");
  assert.equal(conflictingOpen.json().status, 409);

  const closeWithoutBegin = await app.inject({
    method: "POST",
    url: `/v1/service-periods/${breakfastId}/close`,
    headers,
    payload: {},
  });
  assert.equal(closeWithoutBegin.statusCode, 409);
  assert.deepEqual(
    new Set(Object.keys(closeWithoutBegin.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(closeWithoutBegin.json().type, "conflict");
  assert.equal(closeWithoutBegin.json().status, 409);

  const cancelPlannedDinner = await app.inject({
    method: "POST",
    url: `/v1/service-periods/${dinnerId}/cancel-planned`,
    headers,
  });
  assert.equal(cancelPlannedDinner.statusCode, 200);
  assert.deepEqual(
    new Set(Object.keys(cancelPlannedDinner.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "branchId",
      "businessDate",
      "name",
      "type",
      "status",
      "revision",
      "createdAt",
      "updatedAt",
    ]),
  );
  assert.equal(cancelPlannedDinner.json().data.status, "CANCELLED");
  assert.equal(cancelPlannedDinner.json().data.revision, 2);

  const reopenCancelledDinner = await app.inject({
    method: "POST",
    url: `/v1/service-periods/${dinnerId}/open`,
    headers,
  });
  assert.equal(reopenCancelledDinner.statusCode, 409);
  assert.deepEqual(
    new Set(Object.keys(reopenCancelledDinner.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(reopenCancelledDinner.json().type, "conflict");
  assert.equal(reopenCancelledDinner.json().status, 409);

  const unknownDetail = await app.inject({
    method: "GET",
    url: `/v1/service-periods/${randomUUID()}`,
    headers,
  });
  assert.equal(unknownDetail.statusCode, 404);
  assert.deepEqual(
    new Set(Object.keys(unknownDetail.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(unknownDetail.json().type, "not-found");
  assert.equal(unknownDetail.json().title, "ServicePeriod not found");
  assert.equal(unknownDetail.json().status, 404);

  const unknownOpen = await app.inject({
    method: "POST",
    url: `/v1/service-periods/${randomUUID()}/open`,
    headers,
  });
  assert.equal(unknownOpen.statusCode, 404);
  assert.deepEqual(
    new Set(Object.keys(unknownOpen.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(unknownOpen.json().type, "not-found");
  assert.equal(unknownOpen.json().title, "ServicePeriod not found");
  assert.equal(unknownOpen.json().status, 404);

  const unknownForceClose = await app.inject({
    method: "POST",
    url: `/v1/service-periods/${randomUUID()}/force-close`,
    headers,
    payload: { reason: "unknown target" },
  });
  assert.equal(unknownForceClose.statusCode, 404);
  assert.deepEqual(
    new Set(Object.keys(unknownForceClose.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(unknownForceClose.json().type, "not-found");
  assert.equal(unknownForceClose.json().title, "ServicePeriod not found");
  assert.equal(unknownForceClose.json().status, 404);

  await app.close();
});

serialTest("ServicePeriod routes enforce create schema and manage permission", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);
  const now = new Date();
  const cook = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "demo-cook-service-periods",
    displayName: "Demo Cook Service Periods",
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
  const token = "cook-token-service-periods";
  sessionsOf(container).registerToken(token, {
    provider: "fixture",
    subject: "demo-cook-service-periods",
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });

  const invalidCreate = await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/service-periods`,
    headers,
    payload: { businessDate: "2026-07-25", name: "", type: "DINNER" },
  });
  assert.equal(invalidCreate.statusCode, 400);
  assert.deepEqual(
    new Set(Object.keys(invalidCreate.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(invalidCreate.json().type, "bad-request");
  assert.equal(invalidCreate.json().status, 400);
  assert.match(String(invalidCreate.json().title), /name/i);

  const create = await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/service-periods`,
    headers,
      payload: { businessDate: "2026-07-25", name: "Dinner", type: "DINNER" },
  });
  assert.equal(create.statusCode, 201);
  assert.deepEqual(Object.keys(create.json()).sort(), ["data"]);
  assert.deepEqual(
    new Set(Object.keys(create.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "branchId",
      "businessDate",
      "name",
      "type",
      "status",
      "revision",
      "createdAt",
      "updatedAt",
    ]),
  );
  const periodId = create.json().data.id as string;

  const forbiddenList = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/service-periods`,
    headers: { authorization: `Bearer ${token}`, "x-tenant-id": tenantId },
  });
  assert.equal(forbiddenList.statusCode, 403);
  assert.deepEqual(
    new Set(Object.keys(forbiddenList.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(forbiddenList.json().type, "insufficient-scope");
  assert.equal(forbiddenList.json().title, "Insufficient scope");
  assert.equal(forbiddenList.json().status, 403);

  const forbiddenOpen = await app.inject({
    method: "POST",
    url: `/v1/service-periods/${periodId}/open`,
    headers: { authorization: `Bearer ${token}`, "x-tenant-id": tenantId },
  });
  assert.equal(forbiddenOpen.statusCode, 403);
  assert.deepEqual(
    new Set(Object.keys(forbiddenOpen.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(forbiddenOpen.json().type, "insufficient-scope");
  assert.equal(forbiddenOpen.json().title, "Insufficient scope");
  assert.equal(forbiddenOpen.json().status, 403);

  await app.close();
});

serialTest("ServicePeriod detail and commands hide cross-tenant resources as 404", async () => {
  const container = await buildContainer();
  const { tenantId } = await getContext(container);
  const app = await buildApp(container);
  const foreign = await seedForeignServicePeriod(container);
  const headers = ownerHeaders(container, tenantId);

  const detail = await app.inject({
    method: "GET",
    url: `/v1/service-periods/${foreign.servicePeriodId}`,
    headers,
  });
  assert.equal(detail.statusCode, 404);
  assert.deepEqual(
    new Set(Object.keys(detail.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(detail.json().type, "not-found");
  assert.equal(detail.json().title, "ServicePeriod not found");
  assert.equal(detail.json().status, 404);

  const open = await app.inject({
    method: "POST",
    url: `/v1/service-periods/${foreign.servicePeriodId}/open`,
    headers,
  });
  assert.equal(open.statusCode, 404);
  assert.deepEqual(
    new Set(Object.keys(open.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(open.json().type, "not-found");
  assert.equal(open.json().title, "ServicePeriod not found");
  assert.equal(open.json().status, 404);

  const beginClose = await app.inject({
    method: "POST",
    url: `/v1/service-periods/${foreign.servicePeriodId}/begin-close`,
    headers,
  });
  assert.equal(beginClose.statusCode, 404);
  assert.deepEqual(
    new Set(Object.keys(beginClose.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(beginClose.json().type, "not-found");
  assert.equal(beginClose.json().title, "ServicePeriod not found");
  assert.equal(beginClose.json().status, 404);

  const cancelPlanned = await app.inject({
    method: "POST",
    url: `/v1/service-periods/${foreign.servicePeriodId}/cancel-planned`,
    headers,
  });
  assert.equal(cancelPlanned.statusCode, 404);
  assert.deepEqual(
    new Set(Object.keys(cancelPlanned.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(cancelPlanned.json().type, "not-found");
  assert.equal(cancelPlanned.json().title, "ServicePeriod not found");
  assert.equal(cancelPlanned.json().status, 404);

  const close = await app.inject({
    method: "POST",
    url: `/v1/service-periods/${foreign.servicePeriodId}/close`,
    headers,
    payload: {},
  });
  assert.equal(close.statusCode, 404);
  assert.deepEqual(
    new Set(Object.keys(close.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(close.json().type, "not-found");
  assert.equal(close.json().title, "ServicePeriod not found");
  assert.equal(close.json().status, 404);

  const forceClose = await app.inject({
    method: "POST",
    url: `/v1/service-periods/${foreign.servicePeriodId}/force-close`,
    headers,
    payload: { reason: "cross-tenant" },
  });
  assert.equal(forceClose.statusCode, 404);
  assert.deepEqual(
    new Set(Object.keys(forceClose.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(forceClose.json().type, "not-found");
  assert.equal(forceClose.json().title, "ServicePeriod not found");
  assert.equal(forceClose.json().status, 404);

  await app.close();
});

serialTest("ServicePeriod list/detail expose the expected I0 shape including nullable actual window fields", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);

  const createBreakfast = await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/service-periods`,
    headers,
    payload: {
      businessDate: "2026-07-25",
      name: "Breakfast",
      type: "BREAKFAST",
      plannedOpen: "2026-07-25T08:00:00.000Z",
      plannedClose: "2026-07-25T10:00:00.000Z",
    },
  });
  assert.equal(createBreakfast.statusCode, 201);
  const breakfast = createBreakfast.json().data;

  const createDinner = await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/service-periods`,
    headers,
    payload: {
      businessDate: "2026-07-25",
      name: "Dinner",
      type: "DINNER",
    },
  });
  assert.equal(createDinner.statusCode, 201);
  const dinner = createDinner.json().data;

  const list = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/service-periods`,
    headers,
  });
  assert.equal(list.statusCode, 200);

  const rows = list.json().data as Array<Record<string, unknown>>;
  assert.equal(rows.length, 2);
  assert.deepEqual(
    new Set(rows.map((row) => row.id)),
    new Set([breakfast.id, dinner.id]),
  );

  const breakfastRow = rows.find((row) => row.id === breakfast.id)!;
  assert.equal(breakfastRow.branchId, branchId);
  assert.equal(breakfastRow.businessDate, "2026-07-25");
  assert.equal(breakfastRow.name, "Breakfast");
  assert.equal(breakfastRow.type, "BREAKFAST");
  assert.equal(breakfastRow.status, "PLANNED");
  assert.equal(breakfastRow.revision, 1);
  assert.equal(breakfastRow.plannedOpen, "2026-07-25T08:00:00.000Z");
  assert.equal(breakfastRow.plannedClose, "2026-07-25T10:00:00.000Z");
  assert.equal(breakfastRow.actualOpen, undefined);
  assert.equal(breakfastRow.actualClose, undefined);
  assert.ok(breakfastRow.createdAt);
  assert.ok(breakfastRow.updatedAt);

  const dinnerDetail = await app.inject({
    method: "GET",
    url: `/v1/service-periods/${dinner.id}`,
    headers,
  });
  assert.equal(dinnerDetail.statusCode, 200);
  const detail = dinnerDetail.json().data as Record<string, unknown>;
  assert.equal(detail.id, dinner.id);
  assert.equal(detail.branchId, branchId);
  assert.equal(detail.businessDate, "2026-07-25");
  assert.equal(detail.name, "Dinner");
  assert.equal(detail.type, "DINNER");
  assert.equal(detail.status, "PLANNED");
  assert.equal(detail.revision, 1);
  assert.equal(detail.plannedOpen, undefined);
  assert.equal(detail.plannedClose, undefined);
  assert.equal(detail.actualOpen, undefined);
  assert.equal(detail.actualClose, undefined);
  assert.ok(detail.createdAt);
  assert.ok(detail.updatedAt);

  await app.close();
});

serialTest("Table statuses list returns OCCUPIED and PAYING projections for active visit tables", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);
  const occupiedTableId = randomUUID();
  const payingTableId = randomUUID();

  const occupiedVisit = await app.inject({
    method: "POST",
    url: "/v1/visits",
    headers,
    payload: { branchId, tableIds: [occupiedTableId], guestCount: 2 },
  });
  assert.equal(occupiedVisit.statusCode, 201);

  const payingVisit = await app.inject({
    method: "POST",
    url: "/v1/visits",
    headers,
    payload: { branchId, tableIds: [payingTableId], guestCount: 2 },
  });
  assert.equal(payingVisit.statusCode, 201);
  const payingVisitId = payingVisit.json().data.id;

  const createCheck = await app.inject({
    method: "POST",
    url: `/v1/visits/${payingVisitId}/check`,
    headers,
    payload: { currency: "ARS" },
  });
  assert.equal(createCheck.statusCode, 201);
  const checkId = createCheck.json().data.id;

  const requestPayment = await app.inject({
    method: "POST",
    url: `/v1/checks/${checkId}/request-payment`,
    headers,
  });
  assert.equal(requestPayment.statusCode, 200);

  const statuses = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/table-statuses`,
    headers,
  });
  assert.equal(statuses.statusCode, 200);
  assert.deepEqual(Object.keys(statuses.json()).sort(), ["data"]);
  const rows = statuses.json().data as Array<{ tableId: string; status: string; relatedVisitId?: string; asOf: string }>;

  const occupied = rows.find((row) => row.tableId === occupiedTableId);
  assert.ok(occupied);
  assert.deepEqual(new Set(Object.keys(occupied!)), new Set(["tableId", "status", "relatedVisitId", "asOf"]));
  assert.equal(occupied!.status, "OCCUPIED");
  assert.equal(occupied!.relatedVisitId, occupiedVisit.json().data.id);
  assert.ok(!Number.isNaN(Date.parse(occupied!.asOf)));

  const paying = rows.find((row) => row.tableId === payingTableId);
  assert.ok(paying);
  assert.deepEqual(new Set(Object.keys(paying!)), new Set(["tableId", "status", "relatedVisitId", "asOf"]));
  assert.equal(paying!.status, "PAYING");
  assert.equal(paying!.relatedVisitId, payingVisitId);
  assert.ok(!Number.isNaN(Date.parse(paying!.asOf)));
  await app.close();
});

serialTest("Occupancy endpoints list visit occupancies, release an occupancy, and return 404 for unknown ids", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);
  const tableId = randomUUID();

  const visitCreate = await app.inject({
    method: "POST",
    url: "/v1/visits",
    headers,
    payload: { branchId, tableIds: [tableId], guestCount: 2 },
  });
  assert.equal(visitCreate.statusCode, 201);
  const visitId = visitCreate.json().data.id as string;

  const list = await app.inject({
    method: "GET",
    url: `/v1/visits/${visitId}/occupancies`,
    headers,
  });
  assert.equal(list.statusCode, 200);
  assert.deepEqual(Object.keys(list.json()).sort(), ["data"]);
  assert.equal(list.json().data.length, 1);
  assert.deepEqual(
    new Set(Object.keys(list.json().data[0] as Record<string, unknown>)),
    new Set(["id", "tenantId", "branchId", "tableId", "visitId", "guestCount", "status", "startedAt", "revision"]),
  );
  assert.equal(list.json().data[0].branchId, branchId);
  assert.equal(list.json().data[0].tableId, tableId);
  assert.equal(list.json().data[0].visitId, visitId);
  assert.equal(list.json().data[0].guestCount, 2);
  assert.equal(list.json().data[0].status, "ACTIVE");
  assert.equal(list.json().data[0].revision, 1);
  assert.ok(!Number.isNaN(Date.parse(list.json().data[0].startedAt as string)));

  const occupancyId = list.json().data[0].id as string;
  const release = await app.inject({
    method: "POST",
    url: `/v1/occupancies/${occupancyId}/release`,
    headers,
  });
  assert.equal(release.statusCode, 200);
  assert.deepEqual(Object.keys(release.json()).sort(), ["data"]);
  assert.deepEqual(
    new Set(Object.keys(release.json().data as Record<string, unknown>)),
    new Set(["id", "tenantId", "branchId", "tableId", "visitId", "guestCount", "status", "startedAt", "endedAt", "revision"]),
  );
  assert.equal(release.json().data.status, "CLOSED");
  assert.equal(release.json().data.branchId, branchId);
  assert.equal(release.json().data.tableId, tableId);
  assert.equal(release.json().data.visitId, visitId);
  assert.equal(release.json().data.guestCount, 2);
  assert.equal(release.json().data.revision, 2);
  assert.ok(!Number.isNaN(Date.parse(release.json().data.startedAt as string)));
  assert.ok(!Number.isNaN(Date.parse(release.json().data.endedAt as string)));

  const relisted = await app.inject({
    method: "GET",
    url: `/v1/visits/${visitId}/occupancies`,
    headers,
  });
  assert.equal(relisted.statusCode, 200);
  assert.deepEqual(Object.keys(relisted.json()).sort(), ["data"]);
  assert.equal(relisted.json().data[0].revision, 2);
  assert.equal(relisted.json().data[0].status, "CLOSED");
  assert.ok(!Number.isNaN(Date.parse(relisted.json().data[0].endedAt as string)));

  const unknownRelease = await app.inject({
    method: "POST",
    url: `/v1/occupancies/${randomUUID()}/release`,
    headers,
  });
  assert.equal(unknownRelease.statusCode, 404);
  assert.deepEqual(
    new Set(Object.keys(unknownRelease.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(unknownRelease.json().type, "not-found");
  assert.equal(unknownRelease.json().title, "Occupancy not found");
  assert.equal(unknownRelease.json().status, 404);

  await app.close();
});

serialTest("Checks API rejects duplicate checks, invalid mutations, and invalid terminal transitions", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);
  const tableId = randomUUID();

  const visitCreate = await app.inject({
    method: "POST",
    url: "/v1/visits",
    headers,
    payload: { branchId, tableIds: [tableId], guestCount: 2 },
  });
  assert.equal(visitCreate.statusCode, 201);
  const visitId = visitCreate.json().data.id as string;

  const createCheck = await app.inject({
    method: "POST",
    url: `/v1/visits/${visitId}/check`,
    headers,
    payload: { currency: "ARS" },
  });
  assert.equal(createCheck.statusCode, 201);
  assert.deepEqual(Object.keys(createCheck.json()).sort(), ["data"]);
  const checkId = createCheck.json().data.id as string;

  const duplicateCheck = await app.inject({
    method: "POST",
    url: `/v1/visits/${visitId}/check`,
    headers,
    payload: { currency: "ARS" },
  });
  assert.equal(duplicateCheck.statusCode, 409);
  assert.deepEqual(
    new Set(Object.keys(duplicateCheck.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(duplicateCheck.json().type, "conflict");
  assert.equal(duplicateCheck.json().status, 409);

  const invalidLine = await app.inject({
    method: "POST",
    url: `/v1/checks/${checkId}/add-line`,
    headers,
    payload: { description: "Broken", amountMinorUnits: -1 },
  });
  assert.equal(invalidLine.statusCode, 400);
  assert.deepEqual(
    new Set(Object.keys(invalidLine.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(invalidLine.json().type, "bad-request");
  assert.equal(invalidLine.json().status, 400);
  assert.match(String(invalidLine.json().title), /amountMinorUnits/i);

  const validLine = await app.inject({
    method: "POST",
    url: `/v1/checks/${checkId}/add-line`,
    headers,
    payload: { description: "Valid item", amountMinorUnits: 500 },
  });
  assert.equal(validLine.statusCode, 200);
  assert.deepEqual(Object.keys(validLine.json()).sort(), ["data"]);

  const invalidVoidBody = await app.inject({
    method: "POST",
    url: `/v1/checks/${checkId}/void`,
    headers,
    payload: {},
  });
  assert.equal(invalidVoidBody.statusCode, 400);
  assert.deepEqual(
    new Set(Object.keys(invalidVoidBody.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(invalidVoidBody.json().type, "bad-request");
  assert.equal(invalidVoidBody.json().status, 400);
  assert.match(String(invalidVoidBody.json().title), /reason/i);

  const requestPayment = await app.inject({
    method: "POST",
    url: `/v1/checks/${checkId}/request-payment`,
    headers,
  });
  assert.equal(requestPayment.statusCode, 200);
  assert.deepEqual(Object.keys(requestPayment.json()).sort(), ["data"]);
  assert.equal(requestPayment.json().data.status, "PAYMENT_PENDING");

  const addLineAfterPaymentRequested = await app.inject({
    method: "POST",
    url: `/v1/checks/${checkId}/add-line`,
    headers,
    payload: { description: "Late line", amountMinorUnits: 100 },
  });
  assert.equal(addLineAfterPaymentRequested.statusCode, 400);
  assert.deepEqual(
    new Set(Object.keys(addLineAfterPaymentRequested.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(addLineAfterPaymentRequested.json().type, "bad-request");
  assert.equal(addLineAfterPaymentRequested.json().status, 400);

  const settleUnbalanced = await app.inject({
    method: "POST",
    url: `/v1/checks/${checkId}/settle`,
    headers,
  });
  assert.equal(settleUnbalanced.statusCode, 400);
  assert.deepEqual(
    new Set(Object.keys(settleUnbalanced.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(settleUnbalanced.json().type, "bad-request");
  assert.equal(settleUnbalanced.json().status, 400);

  const voidCheck = await app.inject({
    method: "POST",
    url: `/v1/checks/${checkId}/void`,
    headers,
    payload: { reason: "operator cancelled" },
  });
  assert.equal(voidCheck.statusCode, 200);
  assert.deepEqual(Object.keys(voidCheck.json()).sort(), ["data"]);
  assert.equal(voidCheck.json().data.status, "VOID");

  const settleVoid = await app.inject({
    method: "POST",
    url: `/v1/checks/${checkId}/settle`,
    headers,
  });
  assert.equal(settleVoid.statusCode, 409);
  assert.deepEqual(
    new Set(Object.keys(settleVoid.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(settleVoid.json().type, "conflict");
  assert.equal(settleVoid.json().status, 409);

  const requestPaymentAgain = await app.inject({
    method: "POST",
    url: `/v1/checks/${checkId}/request-payment`,
    headers,
  });
  assert.equal(requestPaymentAgain.statusCode, 409);
  assert.deepEqual(
    new Set(Object.keys(requestPaymentAgain.json() as Record<string, unknown>)),
    new Set(["type", "title", "status", "correlationId"]),
  );
  assert.equal(requestPaymentAgain.json().type, "conflict");
  assert.equal(requestPaymentAgain.json().status, 409);

  await app.close();
});
