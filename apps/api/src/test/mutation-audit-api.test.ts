import assert from "node:assert/strict";
import { test } from "node:test";
import { buildApp } from "../app.js";
import { buildContainer } from "../composition/container.js";
import { mutationAuditPolicy } from "../http/mutation-audit.js";

test("mutation audit policy covers Floor, Ordering, Kitchen and Cash routes", () => {
  assert.equal(
    mutationAuditPolicy("POST", "/v1/visits")?.actionCode,
    "FLOOR_POST_VISITS",
  );
  assert.equal(
    mutationAuditPolicy("POST", "/v1/orders/:id/submit")?.actionCode,
    "ORDERING_POST_ORDERS_SUBMIT",
  );
  assert.equal(
    mutationAuditPolicy("POST", "/v1/kitchen/commands/:id/mark-ready")?.actionCode,
    "KITCHEN_POST_KITCHEN_COMMANDS_MARK_READY",
  );
  assert.equal(
    mutationAuditPolicy("POST", "/v1/cash-sessions/:id/movements")?.actionCode,
    "CASH_POST_CASH_SESSIONS_MOVEMENTS",
  );
  assert.equal(mutationAuditPolicy("GET", "/v1/visits"), null);
  assert.equal(mutationAuditPolicy("POST", "/v1/fiscal-entities"), null);
});

test("a successful Floor mutation appends actor, branch and outcome evidence", async () => {
  const container = await buildContainer();
  const app = await buildApp(container);
  const owner = await container.users.findByExternalIdentity("fixture", "demo-owner");
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
    actionCode: "FLOOR_POST_VISITS",
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
      reasonCode: "HTTP_SUCCESS",
      correlationId: "00000000-0000-4000-8000-000000000777",
    },
  );
  await app.close();
});
