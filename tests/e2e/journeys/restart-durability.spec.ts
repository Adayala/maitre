import { readFile } from "node:fs/promises";
import { expect, type TestInfo } from "@playwright/test";
import type { ApiEvidence } from "./api-client.js";
import { test } from "./fixtures.js";

const BRANCH_ID = "00000000-0000-0000-0000-000000000003";

interface ApiData<T> {
  data: T;
}

interface Checkpoint {
  schemaVersion: 1;
  visitId: string;
  tableId: string;
  orderId: string;
  commandId: string;
  checkId: string;
  cashSessionId: string;
}

interface CashMovement {
  type: string;
  sourceReference?: string;
}

test("@release-journey MVP-J-001 remains durable after an API restart", async ({
  api,
}, testInfo) => {
  const checkpoint = await readCheckpoint();
  const evidence: Record<string, unknown> = { checkpoint };

  const visit = await api.get<ApiData<{ status: string }>>(
    "waiter",
    `/v1/visits/${checkpoint.visitId}`,
  );
  assertEvidence(visit);
  expect(visit.status).toBe(200);
  expect(visit.body.data.status).toBe("CLOSED");

  const order = await api.get<ApiData<{ status: string }>>(
    "waiter",
    `/v1/orders/${checkpoint.orderId}`,
  );
  assertEvidence(order);
  expect(order.body.data.status).toBe("DELIVERED");

  const command = await api.get<ApiData<{ status: string }>>(
    "cook",
    `/v1/kitchen/commands/${checkpoint.commandId}`,
  );
  assertEvidence(command);
  expect(command.body.data.status).toBe("COMPLETED");

  const check = await api.get<
    ApiData<{
      status: string;
      totals: { netDue: number; paid: number; balance: number };
      paymentsSummary: { capturedCount: number };
    }>
  >("cashier", `/v1/checks/${checkpoint.checkId}`);
  assertEvidence(check);
  expect(check.body.data).toMatchObject({
    status: "SETTLED",
    totals: {
      paid: check.body.data.totals.netDue,
      balance: 0,
    },
    paymentsSummary: { capturedCount: 1 },
  });

  const payments = await api.get<
    ApiData<Array<{ id: string; status: string; amountMinorUnits: number }>>
  >("cashier", `/v1/checks/${checkpoint.checkId}/payments`);
  assertEvidence(payments);
  expect(payments.body.data).toEqual([
    expect.objectContaining({
      status: "CAPTURED",
      amountMinorUnits: check.body.data.totals.netDue,
    }),
  ]);

  const movements = await api.get<ApiData<CashMovement[]>>(
    "cashier",
    `/v1/cash-sessions/${checkpoint.cashSessionId}/movements`,
  );
  assertEvidence(movements);
  expect(
    movements.body.data.filter(
      (movement) =>
        movement.sourceReference ===
        `FLOOR_PAYMENT:${payments.body.data[0]!.id}`,
    ),
  ).toEqual([expect.objectContaining({ type: "CASH_SALE" })]);

  const statuses = await api.get<
    ApiData<Array<{ tableId: string; status: string }>>
  >("waiter", `/v1/branches/${BRANCH_ID}/table-statuses`);
  assertEvidence(statuses);
  expect(
    statuses.body.data.find(({ tableId }) => tableId === checkpoint.tableId),
  ).toMatchObject({ status: "AVAILABLE" });

  const forbiddenRead = await api.get(
    "tenantB",
    `/v1/visits/${checkpoint.visitId}`,
  );
  assertEvidence(forbiddenRead);
  expect(forbiddenRead.status).toBe(403);

  const audit = await api.get<
    ApiData<
      Array<{
        actionCode?: string;
        outcome?: string;
        resourceId: string;
        correlationId?: string;
      }>
    >
  >(
    "auditor",
    `/v1/audit-logs?branch_id=${BRANCH_ID}&action_code=VISIT_CLOSED`,
  );
  assertEvidence(audit);
  expect(audit.body.data).toContainEqual(
    expect.objectContaining({
      actionCode: "VISIT_CLOSED",
      outcome: "SUCCEEDED",
      resourceId: checkpoint.visitId,
      correlationId: expect.stringMatching(/^[0-9a-f-]{36}$/i),
    }),
  );

  evidence.persisted = {
    visit: visit.body.data,
    order: order.body.data,
    command: command.body.data,
    check: check.body.data,
    payment: payments.body.data[0],
    paymentMovement: movements.body.data.find(
      (movement) =>
        movement.sourceReference ===
        `FLOOR_PAYMENT:${payments.body.data[0]!.id}`,
    ),
    audit: audit.body.data.find(
      (entry) => entry.resourceId === checkpoint.visitId,
    ),
  };
  evidence.tenantIsolation = { read: forbiddenRead };
  await attachEvidence(testInfo, evidence);
});

async function readCheckpoint(): Promise<Checkpoint> {
  const checkpointPath = process.env["E2E_DURABILITY_CHECKPOINT"];
  if (!checkpointPath) {
    throw new Error("Missing E2E_DURABILITY_CHECKPOINT");
  }
  const checkpoint = JSON.parse(
    await readFile(checkpointPath, "utf8"),
  ) as Partial<Checkpoint>;
  expect(checkpoint).toMatchObject({ schemaVersion: 1 });
  for (const key of [
    "visitId",
    "tableId",
    "orderId",
    "commandId",
    "checkId",
    "cashSessionId",
  ] as const) {
    expect(checkpoint[key]).toMatch(/^[0-9a-f-]{36}$/i);
  }
  return checkpoint as Checkpoint;
}

function assertEvidence(evidence: ApiEvidence<unknown>) {
  expect(evidence.correlationId).toMatch(/^[0-9a-f-]{36}$/i);
}

async function attachEvidence(
  testInfo: TestInfo,
  evidence: Record<string, unknown>,
) {
  await testInfo.attach("mvp-j-001-restart-evidence", {
    body: JSON.stringify(evidence, null, 2),
    contentType: "application/json",
  });
}
