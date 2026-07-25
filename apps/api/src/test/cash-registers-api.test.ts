import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { buildApp } from "../app.js";
import { buildContainer, type Container } from "../composition/container.js";
import type {
  InMemoryOutboxRepository,
  FixtureSessionVerificationPort,
} from "@maitre/adapter-persistence-memory";

const DEMO_CASH_REGISTER_ID = "00000000-0000-0000-0000-00000000000e";

function serialTest(name: string, fn: () => Promise<void> | void) {
  return test(name, { concurrency: false }, fn);
}

async function getContext(container: Container) {
  const owner = await container.users.findByExternalIdentity("fixture", "demo-owner");
  const memberships = await container.memberships.listActiveByUser(owner!.id);
  const tenantId = memberships[0]!.tenantId;
  const branches = await container.branches.listByTenant(tenantId);
  return { tenantId, branchId: branches[0]!.id };
}

function ownerHeaders(container: Container, tenantId: string) {
  return { authorization: `Bearer ${container.demoAccessToken}`, "x-tenant-id": tenantId };
}

function outboxOf(container: Container): InMemoryOutboxRepository {
  return container.outbox as InMemoryOutboxRepository;
}

function sessionsOf(container: Container): FixtureSessionVerificationPort {
  return container.sessions as FixtureSessionVerificationPort;
}

// Registers a fresh fixture user with the given role and returns its bearer headers.
async function roleHeaders(container: Container, tenantId: string, roleId: string, subject: string) {
  const now = new Date();
  await container.users.save({
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: subject,
    displayName: subject,
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
  });
  await container.memberships.save({
    id: randomUUID(),
    tenantId,
    userId: (await container.users.findByExternalIdentity("fixture", subject))!.id,
    status: "ACTIVE",
    branchScopeType: "ALL_BRANCHES",
    roleIds: [roleId],
    branchIds: [],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  const token = `${subject}-token`;
  sessionsOf(container).registerToken(token, {
    provider: "fixture",
    subject,
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });
  return { authorization: `Bearer ${token}`, "x-tenant-id": tenantId };
}

type OutboxEventWithPayload = {
  aggregateId: string;
  payload: Record<string, unknown>;
};

serialTest("Cash API: list registers, open session, begin close and close create reconciliation", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);

  const registers = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/cash-registers`,
    headers,
  });
  assert.equal(registers.statusCode, 200);
  assert.equal(registers.json().data.length >= 1, true);
  const register = registers.json().data[0];

  const open = await app.inject({
    method: "POST",
    url: `/v1/cash-registers/${register.id}/sessions`,
    headers,
    payload: {
      currency: "ARS",
      businessDate: "2026-07-25",
      timezone: "America/Argentina/Buenos_Aires",
      openingAmountMinorUnits: 100000,
    },
  });
  assert.equal(open.statusCode, 201);
  assert.equal(open.json().data.status, "OPEN");
  const session = open.json().data;

  const listedSessions = await app.inject({
    method: "GET",
    url: `/v1/cash-registers/${register.id}/sessions`,
    headers,
  });
  assert.equal(listedSessions.statusCode, 200);
  assert.equal(listedSessions.json().data.length, 1);
  assert.equal(listedSessions.json().data[0].id, session.id);

  const beginClose = await app.inject({
    method: "POST",
    url: `/v1/cash-sessions/${session.id}/begin-close`,
    headers,
  });
  assert.equal(beginClose.statusCode, 200);
  assert.equal(beginClose.json().data.status, "CLOSING");

  const close = await app.inject({
    method: "POST",
    url: `/v1/cash-sessions/${session.id}/close`,
    headers,
  });
  assert.equal(close.statusCode, 200);
  assert.equal(close.json().data.session.status, "CLOSED");
  assert.equal(close.json().data.reconciliation.status, "DRAFT");
  assert.equal(close.json().data.reconciliation.cashSessionId, session.id);

  const getSession = await app.inject({
    method: "GET",
    url: `/v1/cash-sessions/${session.id}`,
    headers,
  });
  assert.equal(getSession.statusCode, 200);
  assert.equal(getSession.json().data.status, "CLOSED");

  await app.close();
});

serialTest("Cash API: opening a second live session for same register/currency returns 409", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);

  const register = (
    await app.inject({
      method: "GET",
      url: `/v1/branches/${branchId}/cash-registers`,
      headers,
    })
  ).json().data[0];

  const first = await app.inject({
    method: "POST",
    url: `/v1/cash-registers/${register.id}/sessions`,
    headers,
    payload: {
      currency: "ARS",
      businessDate: "2026-07-25",
      timezone: "America/Argentina/Buenos_Aires",
      openingAmountMinorUnits: 50000,
    },
  });
  assert.equal(first.statusCode, 201);

  const second = await app.inject({
    method: "POST",
    url: `/v1/cash-registers/${register.id}/sessions`,
    headers,
    payload: {
      currency: "ARS",
      businessDate: "2026-07-25",
      timezone: "America/Argentina/Buenos_Aires",
      openingAmountMinorUnits: 0,
    },
  });
  assert.equal(second.statusCode, 409);

  await app.close();
});

serialTest("Cash API: reconciliation summary, record counts, submit, reject and approve flow", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);

  const register = (
    await app.inject({
      method: "GET",
      url: `/v1/branches/${branchId}/cash-registers`,
      headers,
    })
  ).json().data[0];

  const open = await app.inject({
    method: "POST",
    url: `/v1/cash-registers/${register.id}/sessions`,
    headers,
    payload: {
      currency: "ARS",
      businessDate: "2026-07-25",
      timezone: "America/Argentina/Buenos_Aires",
      openingAmountMinorUnits: 100000,
    },
  });
  assert.equal(open.statusCode, 201);
  const session = open.json().data;

  await app.inject({
    method: "POST",
    url: `/v1/cash-sessions/${session.id}/begin-close`,
    headers,
  });

  const close = await app.inject({
    method: "POST",
    url: `/v1/cash-sessions/${session.id}/close`,
    headers,
  });
  assert.equal(close.statusCode, 200);
  const reconciliation = close.json().data.reconciliation;

  const summary = await app.inject({
    method: "GET",
    url: `/v1/cash-reconciliations/${reconciliation.id}/summary`,
    headers,
  });
  assert.equal(summary.statusCode, 200);
  assert.equal(summary.json().data.expectedMinorUnits, 100000);
  assert.equal(summary.json().data.status, "DRAFT");

  const recordCounts = await app.inject({
    method: "POST",
    url: `/v1/cash-reconciliations/${reconciliation.id}/record-counts`,
    headers,
    payload: { countedMinorUnits: 99000 },
  });
  assert.equal(recordCounts.statusCode, 200);
  assert.equal(recordCounts.json().data.differenceMinorUnits, -1000);

  const submit = await app.inject({
    method: "POST",
    url: `/v1/cash-reconciliations/${reconciliation.id}/submit`,
    headers,
  });
  assert.equal(submit.statusCode, 200);
  assert.equal(submit.json().data.status, "SUBMITTED");

  const reject = await app.inject({
    method: "POST",
    url: `/v1/cash-reconciliations/${reconciliation.id}/reject`,
    headers,
    payload: { reason: "recount" },
  });
  assert.equal(reject.statusCode, 200);
  assert.equal(reject.json().data.status, "REJECTED");
  assert.equal(reject.json().data.rejectionReason, "recount");

  const redrive = await app.inject({
    method: "POST",
    url: `/v1/cash-reconciliations/${reconciliation.id}/record-counts`,
    headers,
    payload: { countedMinorUnits: 100000 },
  });
  assert.equal(redrive.statusCode, 200);
  assert.equal(redrive.json().data.status, "DRAFT");
  assert.equal(redrive.json().data.attempt, 2);

  await app.inject({
    method: "POST",
    url: `/v1/cash-reconciliations/${reconciliation.id}/submit`,
    headers,
  });

  const approve = await app.inject({
    method: "POST",
    url: `/v1/cash-reconciliations/${reconciliation.id}/approve`,
    headers,
    payload: {},
  });
  assert.equal(approve.statusCode, 200);
  assert.equal(approve.json().data.status, "APPROVED");

  const getSession = await app.inject({
    method: "GET",
    url: `/v1/cash-sessions/${session.id}`,
    headers,
  });
  assert.equal(getSession.statusCode, 200);
  assert.equal(getSession.json().data.status, "RECONCILED");

  const getReconciliation = await app.inject({
    method: "GET",
    url: `/v1/cash-reconciliations/${reconciliation.id}`,
    headers,
  });
  assert.equal(getReconciliation.statusCode, 200);
  assert.equal(getReconciliation.json().data.status, "APPROVED");

  await app.close();
});

serialTest("Cash API: record/list/get/compensate movements", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);

  const register = (
    await app.inject({
      method: "GET",
      url: `/v1/branches/${branchId}/cash-registers`,
      headers,
    })
  ).json().data[0];

  const open = await app.inject({
    method: "POST",
    url: `/v1/cash-registers/${register.id}/sessions`,
    headers,
    payload: {
      currency: "ARS",
      businessDate: "2026-07-25",
      timezone: "America/Argentina/Buenos_Aires",
      openingAmountMinorUnits: 100000,
    },
  });
  const session = open.json().data;

  const movement = await app.inject({
    method: "POST",
    url: `/v1/cash-sessions/${session.id}/movements`,
    headers,
    payload: {
      type: "CASH_SALE",
      amountMinorUnits: 25000,
      currency: "ARS",
      sourceType: "PAYMENT",
      sourceReference: "pay-001",
      reason: "manual cash sale",
    },
  });
  assert.equal(movement.statusCode, 201);
  assert.equal(movement.json().data.direction, "IN");
  assert.equal(movement.json().data.ledgerRevision, 1);
  const movementId = movement.json().data.id as string;

  const list = await app.inject({
    method: "GET",
    url: `/v1/cash-sessions/${session.id}/movements`,
    headers,
  });
  assert.equal(list.statusCode, 200);
  assert.equal(list.json().data.length, 1);
  assert.equal(list.json().data[0].id, movementId);

  const get = await app.inject({
    method: "GET",
    url: `/v1/cash-movements/${movementId}`,
    headers,
  });
  assert.equal(get.statusCode, 200);
  assert.equal(get.json().data.sourceReference, "pay-001");

  const duplicate = await app.inject({
    method: "POST",
    url: `/v1/cash-sessions/${session.id}/movements`,
    headers,
    payload: {
      type: "CASH_SALE",
      amountMinorUnits: 1000,
      currency: "ARS",
      sourceReference: "pay-001",
    },
  });
  assert.equal(duplicate.statusCode, 409);

  const compensate = await app.inject({
    method: "POST",
    url: `/v1/cash-movements/${movementId}/compensate`,
    headers,
    payload: { reason: "void" },
  });
  assert.equal(compensate.statusCode, 200);
  assert.equal(compensate.json().data.type, "ADJUSTMENT");
  assert.equal(compensate.json().data.direction, "OUT");
  assert.equal(compensate.json().data.compensatesMovementId, movementId);

  await app.close();
});

serialTest("Cash API: create/publish/evaluate/apply/deactivate discount", async () => {
  const container = await buildContainer();
  const { tenantId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);

  const create = await app.inject({
    method: "POST",
    url: "/v1/discounts",
    headers,
    payload: {
      name: "Promo 10%",
      type: "PERCENTAGE",
      value: 1000,
      scope: "CHECK_TOTAL",
    },
  });
  assert.equal(create.statusCode, 201);
  assert.equal(create.json().data.status, "DRAFT");
  const discountId = create.json().data.id as string;

  const list = await app.inject({ method: "GET", url: "/v1/discounts", headers });
  assert.equal(list.statusCode, 200);
  assert.equal(list.json().data.some((item: { id: string }) => item.id === discountId), true);

  const evaluateDraft = await app.inject({
    method: "GET",
    url: `/v1/discounts/${discountId}/evaluate?eligibleBaseMinorUnits=100000&currency=ARS`,
    headers,
  });
  assert.equal(evaluateDraft.statusCode, 200);
  assert.equal(evaluateDraft.json().data.appliedAmountMinorUnits, 10000);

  const applyDraft = await app.inject({
    method: "POST",
    url: `/v1/discounts/${discountId}/apply`,
    headers,
    payload: {
      checkId: "chk-001",
      eligibleBaseMinorUnits: 100000,
      currency: "ARS",
    },
  });
  assert.equal(applyDraft.statusCode, 409);

  const publish = await app.inject({
    method: "POST",
    url: `/v1/discounts/${discountId}/publish`,
    headers,
  });
  assert.equal(publish.statusCode, 200);
  assert.equal(publish.json().data.status, "PUBLISHED");
  assert.equal(publish.json().data.revision, 2);

  const apply = await app.inject({
    method: "POST",
    url: `/v1/discounts/${discountId}/apply`,
    headers,
    payload: {
      checkId: "chk-001",
      eligibleBaseMinorUnits: 100000,
      currency: "ARS",
      reasonCode: "LOYALTY",
    },
  });
  assert.equal(apply.statusCode, 201);
  assert.equal(apply.json().data.discountVersion, 2);
  assert.equal(apply.json().data.appliedAmountMinorUnits, 10000);
  const applicationId = apply.json().data.id as string;

  const getApplication = await app.inject({
    method: "GET",
    url: `/v1/discount-applications/${applicationId}`,
    headers,
  });
  assert.equal(getApplication.statusCode, 200);
  assert.equal(getApplication.json().data.checkId, "chk-001");

  const deactivate = await app.inject({
    method: "POST",
    url: `/v1/discounts/${discountId}/deactivate`,
    headers,
  });
  assert.equal(deactivate.statusCode, 200);
  assert.equal(deactivate.json().data.status, "DEACTIVATED");

  await app.close();
});

serialTest("Cash API: daily settlement aggregates sessions, movements and counted differences", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);

  const registersRes = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/cash-registers`,
    headers,
  });
  assert.equal(registersRes.statusCode, 200);
  const registerA = registersRes.json().data[0];

  const createRegisterB = await app.inject({
    method: "POST",
    url: "/v1/cash-registers",
    headers,
    payload: {
      branchId,
      code: "AUX-01",
      displayName: "Aux Register",
      allowedCurrencies: ["ARS"],
    },
  });
  assert.equal(createRegisterB.statusCode, 201);
  const registerB = createRegisterB.json().data;

  const openA = await app.inject({
    method: "POST",
    url: `/v1/cash-registers/${registerA.id}/sessions`,
    headers,
    payload: {
      currency: "ARS",
      businessDate: "2026-07-25",
      timezone: "America/Argentina/Buenos_Aires",
      openingAmountMinorUnits: 100000,
    },
  });
  assert.equal(openA.statusCode, 201);
  const sessionA = openA.json().data;

  const openB = await app.inject({
    method: "POST",
    url: `/v1/cash-registers/${registerB.id}/sessions`,
    headers,
    payload: {
      currency: "ARS",
      businessDate: "2026-07-25",
      timezone: "America/Argentina/Buenos_Aires",
      openingAmountMinorUnits: 0,
    },
  });
  assert.equal(openB.statusCode, 201);
  const sessionB = openB.json().data;

  const saleA = await app.inject({
    method: "POST",
    url: `/v1/cash-sessions/${sessionA.id}/movements`,
    headers,
    payload: {
      type: "CASH_SALE",
      amountMinorUnits: 50000,
      currency: "ARS",
      sourceReference: "sale-a-1",
    },
  });
  assert.equal(saleA.statusCode, 201);

  const depositB = await app.inject({
    method: "POST",
    url: `/v1/cash-sessions/${sessionB.id}/movements`,
    headers,
    payload: {
      type: "DEPOSIT",
      amountMinorUnits: 20000,
      currency: "ARS",
      sourceReference: "dep-b-1",
    },
  });
  assert.equal(depositB.statusCode, 201);

  await app.inject({ method: "POST", url: `/v1/cash-sessions/${sessionA.id}/begin-close`, headers });
  const closeA = await app.inject({ method: "POST", url: `/v1/cash-sessions/${sessionA.id}/close`, headers });
  assert.equal(closeA.statusCode, 200);
  const reconciliationA = closeA.json().data.reconciliation;

  const countA = await app.inject({
    method: "POST",
    url: `/v1/cash-reconciliations/${reconciliationA.id}/record-counts`,
    headers,
    payload: { countedMinorUnits: 150000 },
  });
  assert.equal(countA.statusCode, 200);

  const settlement = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/daily-settlement?businessDate=2026-07-25&currency=ARS`,
    headers,
  });
  assert.equal(settlement.statusCode, 200);
  assert.equal(settlement.json().data.sessionCount, 2);
  assert.equal(settlement.json().data.openingsMinorUnits, 100000);
  assert.equal(settlement.json().data.expectedMinorUnits, 130000);
  assert.equal(settlement.json().data.countedMinorUnits, 150000);
  assert.equal(settlement.json().data.differenceMinorUnits, 0);
  assert.equal(settlement.json().data.movementsByType.CASH_SALE, 50000);
  assert.equal(settlement.json().data.movementsByType.DEPOSIT, -20000);
  assert.equal(settlement.json().data.sessions.length, 2);

  await app.close();
});

serialTest("Cash API: daily settlement requires businessDate and currency", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);

  const missingBusinessDate = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/daily-settlement?currency=ARS`,
    headers,
  });
  assert.equal(missingBusinessDate.statusCode, 400);

  const missingCurrency = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/daily-settlement?businessDate=2026-07-25`,
    headers,
  });
  assert.equal(missingCurrency.statusCode, 400);

  await app.close();
});

serialTest("Cash API: recording and compensating movements append cash movement outbox events", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);

  const register = (
    await app.inject({
      method: "GET",
      url: `/v1/branches/${branchId}/cash-registers`,
      headers,
    })
  ).json().data[0];

  const open = await app.inject({
    method: "POST",
    url: `/v1/cash-registers/${register.id}/sessions`,
    headers,
    payload: {
      currency: "ARS",
      businessDate: "2026-07-25",
      timezone: "America/Argentina/Buenos_Aires",
      openingAmountMinorUnits: 100000,
    },
  });
  assert.equal(open.statusCode, 201);
  const session = open.json().data;

  const movement = await app.inject({
    method: "POST",
    url: `/v1/cash-sessions/${session.id}/movements`,
    headers,
    payload: {
      type: "CASH_SALE",
      amountMinorUnits: 25000,
      currency: "ARS",
      sourceType: "PAYMENT",
      sourceReference: "pay-outbox-1",
    },
  });
  assert.equal(movement.statusCode, 201);
  const movementId = movement.json().data.id as string;

  const compensate = await app.inject({
    method: "POST",
    url: `/v1/cash-movements/${movementId}/compensate`,
    headers,
    payload: { reason: "void" },
  });
  assert.equal(compensate.statusCode, 200);

  const records = outboxOf(container).all();
  const movementEvents = records.filter((r) => r.eventName === "cash.cash-movement.recorded.v1") as OutboxEventWithPayload[];
  assert.equal(movementEvents.length, 2);
  assert.equal(movementEvents[0]?.aggregateId, session.id);
  assert.equal(movementEvents[0]?.payload.cashMovementId, movementId);
  assert.equal(movementEvents[0]?.payload.amountMinorUnits, 25000);
  assert.equal(movementEvents[1]?.payload.direction, "OUT");
  assert.equal(movementEvents[1]?.payload.cashSessionId, session.id);

  await app.close();
});

serialTest("Cash API: approving reconciliation appends cash session reconciled outbox event", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);

  const register = (
    await app.inject({
      method: "GET",
      url: `/v1/branches/${branchId}/cash-registers`,
      headers,
    })
  ).json().data[0];

  const open = await app.inject({
    method: "POST",
    url: `/v1/cash-registers/${register.id}/sessions`,
    headers,
    payload: {
      currency: "ARS",
      businessDate: "2026-07-25",
      timezone: "America/Argentina/Buenos_Aires",
      openingAmountMinorUnits: 100000,
    },
  });
  assert.equal(open.statusCode, 201);
  const session = open.json().data;

  const sale = await app.inject({
    method: "POST",
    url: `/v1/cash-sessions/${session.id}/movements`,
    headers,
    payload: {
      type: "CASH_SALE",
      amountMinorUnits: 50000,
      currency: "ARS",
      sourceReference: "sale-reconciled-1",
    },
  });
  assert.equal(sale.statusCode, 201);

  await app.inject({ method: "POST", url: `/v1/cash-sessions/${session.id}/begin-close`, headers });
  const close = await app.inject({ method: "POST", url: `/v1/cash-sessions/${session.id}/close`, headers });
  assert.equal(close.statusCode, 200);
  const reconciliationId = close.json().data.reconciliation.id as string;

  await app.inject({
    method: "POST",
    url: `/v1/cash-reconciliations/${reconciliationId}/record-counts`,
    headers,
    payload: { countedMinorUnits: 150000 },
  });
  await app.inject({ method: "POST", url: `/v1/cash-reconciliations/${reconciliationId}/submit`, headers });
  const approve = await app.inject({
    method: "POST",
    url: `/v1/cash-reconciliations/${reconciliationId}/approve`,
    headers,
    payload: {},
  });
  assert.equal(approve.statusCode, 200);

  const records = outboxOf(container).all();
  const reconciledEvents = records.filter((r) => r.eventName === "cash.cash-session.reconciled.v1") as OutboxEventWithPayload[];
  assert.equal(reconciledEvents.length, 1);
  assert.equal(reconciledEvents[0]?.aggregateId, session.id);
  assert.equal(reconciledEvents[0]?.payload.cashReconciliationId, reconciliationId);
  assert.equal(reconciledEvents[0]?.payload.expectedMinorUnits, 150000);
  assert.equal(reconciledEvents[0]?.payload.countedMinorUnits, 150000);
  assert.equal(reconciledEvents[0]?.payload.differenceMinorUnits, 0);

  await app.close();
});

serialTest("Cash RBAC: WAITER has no cash permissions (403), unknown session id is 404", async () => {
  const container = await buildContainer();
  const { tenantId } = await getContext(container);
  const app = await buildApp(container);
  const headers = await roleHeaders(container, tenantId, "role_waiter", "demo-waiter-cash");

  // WAITER cannot open a cash session (no cash:session_open).
  const forbidden = await app.inject({
    method: "POST",
    url: `/v1/cash-registers/${DEMO_CASH_REGISTER_ID}/sessions`,
    headers,
    payload: { currency: "ARS", businessDate: "2026-07-25", timezone: "TZ", openingAmountMinorUnits: 0 },
  });
  assert.equal(forbidden.statusCode, 403);

  // Unknown session id -> 404 (owner has access).
  const missing = await app.inject({
    method: "GET",
    url: `/v1/cash-sessions/${randomUUID()}`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(missing.statusCode, 404);
  await app.close();
});

serialTest("Cash RBAC: CASHIER opens/records but cannot compensate (movement_compensate is manager-tier)", async () => {
  const container = await buildContainer();
  const { tenantId } = await getContext(container);
  const app = await buildApp(container);
  const headers = await roleHeaders(container, tenantId, "role_cashier", "demo-cashier-cash");

  const opened = await app.inject({
    method: "POST",
    url: `/v1/cash-registers/${DEMO_CASH_REGISTER_ID}/sessions`,
    headers,
    payload: { currency: "ARS", businessDate: "2026-07-25", timezone: "TZ", openingAmountMinorUnits: 0 },
  });
  assert.equal(opened.statusCode, 201);
  const session = opened.json().data;

  const sale = await app.inject({
    method: "POST",
    url: `/v1/cash-sessions/${session.id}/movements`,
    headers,
    payload: { type: "CASH_SALE", amountMinorUnits: 10000, currency: "ARS" },
  });
  assert.equal(sale.statusCode, 201);

  // CASHIER lacks cash:movement_compensate.
  const comp = await app.inject({
    method: "POST",
    url: `/v1/cash-movements/${sale.json().data.id}/compensate`,
    headers,
    payload: {},
  });
  assert.equal(comp.statusCode, 403);
  await app.close();
});
