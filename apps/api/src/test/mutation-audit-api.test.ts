import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import Fastify from "fastify";
import type { FixtureSessionVerificationPort } from "@maitre/adapter-persistence-memory";
import { buildApp } from "../app.js";
import { buildContainer } from "../composition/container.js";
import {
  mutationAuditPolicy,
  registerMutationAudit,
  SENSITIVE_MUTATION_POLICIES,
} from "../http/mutation-audit.js";
import { sanitizeAuditEvidence } from "@maitre/audit";
import { InMemoryTelemetry, TELEMETRY_SIGNALS } from "@maitre/telemetry";

const DEMO_TABLE_ID = "00000000-0000-0000-0000-000000000005";
const DEMO_PRODUCT_ID = "00000000-0000-0000-0000-00000000000b";
const DEMO_CASH_REGISTER_ID = "00000000-0000-0000-0000-00000000000e";

test("mutation audit policy covers Floor, Ordering, Kitchen and Cash routes", () => {
  assert.equal(
    mutationAuditPolicy("POST", "/v1/visits")?.actionCode,
    "VISIT_OPENED",
  );
  assert.equal(
    mutationAuditPolicy("POST", "/v1/orders/:id/submit")?.actionCode,
    "ORDER_SUBMITTED",
  );
  assert.equal(
    mutationAuditPolicy("POST", "/v1/kitchen/commands/:id/mark-ready")
      ?.actionCode,
    "KITCHEN_COMMAND_READY",
  );
  assert.equal(
    mutationAuditPolicy("POST", "/v1/cash-sessions/:id/movements")?.actionCode,
    "CASH_MOVEMENT_RECORDED",
  );
  assert.equal(
    new Set(SENSITIVE_MUTATION_POLICIES.map((entry) => entry.actionCode)).size,
    SENSITIVE_MUTATION_POLICIES.length,
  );
  assert.equal(mutationAuditPolicy("GET", "/v1/visits"), null);
  assert.equal(mutationAuditPolicy("POST", "/v1/fiscal-entities"), null);
});

test("audit coverage gate rejects an uncovered sensitive mutation route", async () => {
  const container = await buildContainer();
  const telemetry = new InMemoryTelemetry();
  const app = Fastify();
  registerMutationAudit(app, container, telemetry);

  assert.throws(
    () =>
      app.post("/v1/visits/:id/uncovered-command", async () => ({
        data: {},
      })),
    /sensitive-mutation-audit-policy-missing:POST \/v1\/visits\/:id\/uncovered-command/,
  );
  assert.equal(
    telemetry.metrics.some(
      (metric) =>
        metric.signal === TELEMETRY_SIGNALS.auditPolicyMissing &&
        metric.attributes["method"] === "POST" &&
        metric.attributes["route"] === "/v1/visits/:id/uncovered-command",
    ),
    true,
  );
  await app.close();
});

test("audit evidence removes secrets and bounds oversized payloads", () => {
  const evidence = sanitizeAuditEvidence({
    currency: "ARS",
    amountMinorUnits: 2500,
    authorization: "Bearer must-not-survive",
    cardNumber: "4111111111111111",
    nested: {
      password: "must-not-survive",
      values: Array.from({ length: 100 }, (_, index) => index),
    },
    oversized: "x".repeat(20_000),
  }) as Record<string, unknown>;
  const serialized = JSON.stringify(evidence);
  assert.equal(serialized.includes("must-not-survive"), false);
  assert.equal(serialized.includes("4111111111111111"), false);
  assert.ok(Buffer.byteLength(serialized, "utf8") <= 8_192);
});

test("a successful Floor mutation appends actor, branch and outcome evidence", async () => {
  const container = await buildContainer();
  const telemetry = new InMemoryTelemetry();
  const app = await buildApp(container, telemetry);
  const owner = await container.users.findByExternalIdentity(
    "fixture",
    "demo-owner",
  );
  const memberships = await container.memberships.listActiveByUser(owner!.id);
  const tenantId = memberships[0]!.tenantId;
  const branch = (await container.branches.listByTenant(tenantId))[0]!;
  const salon = (await container.salons.listByBranch(tenantId, branch.id))[0]!;
  const table = (await container.tables.listBySalon(tenantId, salon.id))[0]!;

  const response = await app.inject({
    method: "POST",
    url: "/v1/visits",
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
      "x-branch-id": branch.id,
      "x-correlation-id": "00000000-0000-4000-8000-000000000777",
    },
    payload: { branchId: branch.id, tableIds: [table.id], guestCount: 2 },
  });
  assert.equal(response.statusCode, 201);

  const page = await container.auditLogs.query({
    tenantId,
    actionCode: "VISIT_OPENED",
  });
  assert.equal(page.items.length, 1);
  assert.deepEqual(
    {
      actorId: page.items[0]?.actorId,
      branchId: page.items[0]?.branchId,
      outcome: page.items[0]?.outcome,
      reasonCode: page.items[0]?.reasonCode,
      correlationId: page.items[0]?.correlationId,
    },
    {
      actorId: owner!.id,
      branchId: branch.id,
      outcome: "SUCCEEDED",
      reasonCode: "COMMAND_ACCEPTED",
      correlationId: "00000000-0000-4000-8000-000000000777",
    },
  );
  assert.equal(
    telemetry.metrics.some(
      (metric) =>
        metric.signal === TELEMETRY_SIGNALS.auditAppend &&
        metric.attributes["action_code"] === "VISIT_OPENED" &&
        metric.attributes["outcome"] === "success",
    ),
    true,
  );
  assert.equal(
    telemetry.metrics.some(
      (metric) =>
        metric.signal === TELEMETRY_SIGNALS.auditEvidenceSize &&
        metric.attributes["action_code"] === "VISIT_OPENED",
    ),
    true,
  );
  await app.close();
});

test("Ordering, Kitchen and Cash mutations append their business action codes", async () => {
  const container = await buildContainer();
  const app = await buildApp(container);
  const owner = await container.users.findByExternalIdentity(
    "fixture",
    "demo-owner",
  );
  const memberships = await container.memberships.listActiveByUser(owner!.id);
  const tenantId = memberships[0]!.tenantId;
  const branch = (await container.branches.listByTenant(tenantId))[0]!;
  const headers = {
    authorization: `Bearer ${container.demoAccessToken}`,
    "x-tenant-id": tenantId,
    "x-branch-id": branch.id,
  };

  const visit = await app.inject({
    method: "POST",
    url: "/v1/visits",
    headers,
    payload: {
      branchId: branch.id,
      tableIds: [DEMO_TABLE_ID],
      guestCount: 2,
    },
  });
  assert.equal(visit.statusCode, 201);
  const visitId = visit.json().data.id as string;

  const orderResponse = await app.inject({
    method: "POST",
    url: `/v1/visits/${visitId}/orders`,
    headers,
    payload: {},
  });
  assert.equal(orderResponse.statusCode, 201);
  const orderId = orderResponse.json().data.id as string;
  await app.inject({
    method: "POST",
    url: `/v1/orders/${orderId}/items`,
    headers,
    payload: { productId: DEMO_PRODUCT_ID, quantity: 1 },
  });
  const submit = await app.inject({
    method: "POST",
    url: `/v1/orders/${orderId}/submit`,
    headers,
    payload: {},
  });
  assert.equal(submit.statusCode, 200);
  const commandId = submit.json().data.commands[0].id as string;

  const claim = await app.inject({
    method: "POST",
    url: `/v1/kitchen/commands/${commandId}/claim`,
    headers,
    payload: {},
  });
  assert.equal(claim.statusCode, 200);

  const openSession = await app.inject({
    method: "POST",
    url: `/v1/cash-registers/${DEMO_CASH_REGISTER_ID}/sessions`,
    headers,
    payload: {
      currency: "ARS",
      businessDate: "2026-07-30",
      timezone: "America/Argentina/Buenos_Aires",
      openingAmountMinorUnits: 100_000,
    },
  });
  assert.equal(openSession.statusCode, 201);

  for (const [actionCode, resourceId] of [
    ["ORDER_SUBMITTED", orderId],
    ["KITCHEN_COMMAND_CLAIMED", commandId],
    ["CASH_SESSION_OPENED", openSession.json().data.id as string],
  ] as const) {
    const page = await container.auditLogs.query({ tenantId, actionCode });
    assert.equal(page.items.length, 1, actionCode);
    assert.equal(page.items[0]?.resourceId, resourceId, actionCode);
    assert.equal(page.items[0]?.branchId, branch.id, actionCode);
    assert.equal(page.items[0]?.outcome, "SUCCEEDED", actionCode);
  }
  await app.close();
});

test("a denied sensitive mutation is recorded after the Problem response", async () => {
  const container = await buildContainer();
  const app = await buildApp(container);
  const owner = await container.users.findByExternalIdentity(
    "fixture",
    "demo-owner",
  );
  const memberships = await container.memberships.listActiveByUser(owner!.id);
  const tenantId = memberships[0]!.tenantId;
  const branch = (await container.branches.listByTenant(tenantId))[0]!;
  const now = new Date();
  const employeeId = randomUUID();
  const subject = "audit-policy-employee";
  await container.users.save({
    id: employeeId,
    identityProvider: "fixture",
    externalIdentityId: subject,
    displayName: "Audit Policy Employee",
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
  });
  await container.memberships.save({
    id: randomUUID(),
    tenantId,
    userId: employeeId,
    status: "ACTIVE",
    branchScopeType: "ALL_BRANCHES",
    roleIds: ["role_employee"],
    branchIds: [],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  const token = "audit-policy-employee-token";
  (container.sessions as FixtureSessionVerificationPort).registerToken(token, {
    provider: "fixture",
    subject,
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });

  const response = await app.inject({
    method: "POST",
    url: "/v1/visits",
    headers: {
      authorization: `Bearer ${token}`,
      "x-tenant-id": tenantId,
      "x-branch-id": branch.id,
    },
    payload: {
      branchId: branch.id,
      tableIds: [DEMO_TABLE_ID],
      guestCount: 2,
    },
  });
  assert.equal(response.statusCode, 403);
  assert.equal(
    response.headers["content-type"]?.startsWith("application/problem+json"),
    true,
  );

  const page = await container.auditLogs.query({
    tenantId,
    actionCode: "VISIT_OPENED",
    outcome: "DENIED",
  });
  assert.equal(page.items.length, 1);
  assert.equal(page.items[0]?.actorId, employeeId);
  assert.equal(page.items[0]?.branchId, branch.id);
  assert.equal(page.items[0]?.reasonCode, "AUTHORIZATION_DENIED");
  await app.close();
});

test("a successful mutation is not reported as success when audit append fails", async () => {
  const container = await buildContainer();
  const originalAuditLogs = container.auditLogs;
  container.auditLogs = {
    append: async () => {
      throw new Error("audit-store-unavailable");
    },
    query: (params) => originalAuditLogs.query(params),
  };
  const telemetry = new InMemoryTelemetry();
  const app = await buildApp(container, telemetry);
  const owner = await container.users.findByExternalIdentity(
    "fixture",
    "demo-owner",
  );
  const memberships = await container.memberships.listActiveByUser(owner!.id);
  const tenantId = memberships[0]!.tenantId;
  const branch = (await container.branches.listByTenant(tenantId))[0]!;
  const salon = (await container.salons.listByBranch(tenantId, branch.id))[0]!;
  const table = (await container.tables.listBySalon(tenantId, salon.id))[0]!;

  const response = await app.inject({
    method: "POST",
    url: "/v1/visits",
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
      "x-branch-id": branch.id,
    },
    payload: { branchId: branch.id, tableIds: [table.id], guestCount: 2 },
  });

  assert.equal(response.statusCode, 500);
  assert.equal(
    telemetry.metrics.some(
      (metric) =>
        metric.signal === TELEMETRY_SIGNALS.auditAppend &&
        metric.attributes["action_code"] === "VISIT_OPENED" &&
        metric.attributes["outcome"] === "failure",
    ),
    true,
  );
  await app.close();
});
