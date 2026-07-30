import { writeFile } from "node:fs/promises";
import { expect, type Page, type TestInfo } from "@playwright/test";
import type { ApiEvidence } from "./api-client.js";
import { test } from "./fixtures.js";

const BRANCH_ID = "00000000-0000-0000-0000-000000000003";
const CASH_REGISTER_ID = "00000000-0000-0000-0000-00000000000e";

interface ApiData<T> {
  data: T;
}

interface Visit {
  id: string;
  status: "OPEN" | "CLOSING" | "CLOSED" | "CANCELLED";
  tableIds: string[];
}

interface OrderItem {
  id: string;
  name: string;
  status: "QUEUED" | "IN_PREP" | "READY" | "DELIVERED" | "CANCELLED";
}

interface Order {
  id: string;
  status:
    | "DRAFT"
    | "SUBMITTED"
    | "IN_PREP"
    | "READY"
    | "PARTIALLY_DELIVERED"
    | "DELIVERED"
    | "CANCELLED";
  items: OrderItem[];
}

interface KitchenCommand {
  id: string;
  status:
    | "RECEIVED"
    | "CLAIMED"
    | "IN_PROGRESS"
    | "ON_HOLD"
    | "READY"
    | "COMPLETED"
    | "CANCELLED";
  payload: { displayName: string };
}

interface Check {
  id: string;
  status: "OPEN" | "PAYMENT_PENDING" | "SETTLED" | "VOID";
  totals: { netDue: number; paid: number; balance: number };
  paymentsSummary: { capturedCount: number };
}

interface Payment {
  id: string;
  status: "PENDING" | "AUTHORIZED" | "CAPTURED" | "FAILED" | "VOID";
  amountMinorUnits: number;
}

interface CashSession {
  id: string;
  status: "OPEN" | "CLOSING" | "CLOSED" | "RECONCILED";
}

interface CashMovement {
  type: string;
  amountMinorUnits: number;
  sourceReference?: string;
}

interface TableStatus {
  tableId: string;
  status:
    "BLOCKED" | "OCCUPIED" | "PAYING" | "CLEANING" | "RESERVED" | "AVAILABLE";
}

interface AuditLog {
  actionCode?: string;
  outcome?: string;
  resourceId: string;
  correlationId?: string;
}

test("@release-journey MVP-J-001 completes table to close through the real product", async ({
  api,
  apps,
}, testInfo) => {
  const evidence: Record<string, unknown> = {};
  let visit!: Visit;
  let order!: Order;
  let command!: KitchenCommand;
  let check!: Check;
  let cashSession!: CashSession;
  let payment!: Payment;
  let tableNumber!: string;

  await test.step("all deployable applications share one ready API", async () => {
    const readiness = await api.get<{ status: string }>(
      "waiter",
      "/health/ready",
    );
    assertEvidence(readiness);
    expect(readiness.status).toBe(200);
    expect(readiness.body.status).toBe("ready");
    await expect(
      apps.floor.getByRole("heading", { name: "Salón", exact: true }),
    ).toBeVisible();
    await expect(
      apps.kitchen.getByRole("heading", { name: "Cocina Principal" }),
    ).toBeVisible();
    await expect(
      apps.cash.getByRole("heading", { name: "Caja Principal" }),
    ).toBeVisible();
    evidence.readiness = readiness;
  });

  await test.step("Floor seats a real table and submits a real menu item", async () => {
    const availableTable = apps.floor
      .locator(".table-card")
      .filter({ hasText: "Libre" })
      .first();
    tableNumber = (
      await availableTable.locator(".table-card-num").innerText()
    ).trim();
    await availableTable.click();
    const seatDialog = apps.floor.getByRole("dialog", {
      name: "Sentar comensales",
    });
    await expect(seatDialog).toBeVisible();
    const [seatResponse] = await Promise.all([
      apps.floor.waitForResponse(
        (response) =>
          response.request().method() === "POST" &&
          new URL(response.url()).pathname === "/v1/visits",
      ),
      seatDialog.getByRole("button", { name: /^Sentar \d+/ }).click(),
    ]);
    expect(seatResponse.status()).toBe(201);
    const seatedVisit = (await seatResponse.json()) as ApiData<Visit>;

    await expect(
      apps.floor.getByRole("button", { name: /Nuevo pedido/ }),
    ).toBeVisible();
    const openedVisit = await api.poll<ApiData<Visit>>(
      "open visit",
      () => api.get("waiter", `/v1/visits/${seatedVisit.data.id}`),
      (body) => body.data.status === "OPEN",
    );
    assertEvidence(openedVisit);
    visit = openedVisit.body.data;
    expect(visit.id).toBe(seatedVisit.data.id);

    await apps.floor.getByRole("button", { name: /Nuevo pedido/ }).click();
    await expect(
      apps.floor.getByRole("heading", { name: "Nuevo pedido" }),
    ).toBeVisible();
    const addProduct = apps.floor
      .getByRole("button", { name: /^Agregar / })
      .first();
    await expect(addProduct).toBeVisible();
    await addProduct.click();
    const productDialog = apps.floor.getByRole("dialog", { name: /^Agregar / });
    await productDialog.getByRole("button", { name: /^Agregar ·/ }).click();
    await expect(
      apps.floor.getByRole("button", { name: "Enviar a cocina" }),
    ).toBeEnabled();
    await apps.floor.getByRole("button", { name: "Enviar a cocina" }).click();

    const orders = await api.poll<ApiData<Order[]>>(
      "submitted order",
      () => api.get("waiter", `/v1/visits/${visit.id}/orders`),
      (body) => body.data.some((candidate) => candidate.status === "SUBMITTED"),
    );
    assertEvidence(orders);
    order = orders.body.data.find(
      (candidate) => candidate.status === "SUBMITTED",
    )!;
    expect(order.items).toHaveLength(1);

    const commands = await api.poll<ApiData<KitchenCommand[]>>(
      "kitchen command",
      () => api.get("cook", `/v1/orders/${order.id}/kitchen/commands`),
      (body) => body.data.length === 1,
    );
    assertEvidence(commands);
    command = commands.body.data[0]!;
    expect(command.status).toBe("RECEIVED");
    evidence.floor = {
      visit,
      order,
      command,
      correlationId: orders.correlationId,
    };
  });

  await test.step("Kitchen prepares and hands off that same command", async () => {
    const commandName = command.payload.displayName;
    await kitchenAction(apps.kitchen, commandName, "Nueva", "Tomar");
    await kitchenAction(apps.kitchen, commandName, "Tomada", "Empezar");
    await kitchenAction(
      apps.kitchen,
      commandName,
      "En preparación",
      "Marcar lista",
    );
    await kitchenAction(apps.kitchen, commandName, "Lista", "Entregar");

    const completed = await api.poll<ApiData<KitchenCommand>>(
      "completed kitchen handoff",
      () => api.get("cook", `/v1/kitchen/commands/${command.id}`),
      (body) => body.data.status === "COMPLETED",
    );
    assertEvidence(completed);
    const deliveredOrder = await api.poll<ApiData<Order>>(
      "delivered order",
      () => api.get("waiter", `/v1/orders/${order.id}`),
      (body) => body.data.status === "DELIVERED",
    );
    assertEvidence(deliveredOrder);
    expect(
      deliveredOrder.body.data.items.every(
        (item) => item.status === "DELIVERED",
      ),
    ).toBe(true);
    evidence.kitchen = {
      command: completed.body.data,
      order: deliveredOrder.body.data,
      correlationId: completed.correlationId,
    };
  });

  await test.step("Floor requests payment and Cash settles the exact balance", async () => {
    await expect(
      apps.floor.getByRole("button", { name: /Pedir la cuenta/ }),
    ).toBeEnabled();
    await apps.floor.getByRole("button", { name: /Pedir la cuenta/ }).click();

    const pendingCheck = await api.poll<ApiData<Check>>(
      "payment-pending check",
      () => api.get("waiter", `/v1/visits/${visit.id}/check`),
      (body) => body.data.status === "PAYMENT_PENDING",
    );
    assertEvidence(pendingCheck);
    check = pendingCheck.body.data;
    expect(check.totals.balance).toBeGreaterThan(0);

    await apps.cash
      .getByRole("button", { name: "Abrir sesión", exact: true })
      .click();
    const sessions = await api.poll<ApiData<CashSession[]>>(
      "open cash session",
      () =>
        api.get("cashier", `/v1/cash-registers/${CASH_REGISTER_ID}/sessions`),
      (body) => body.data.some((candidate) => candidate.status === "OPEN"),
    );
    assertEvidence(sessions);
    cashSession = sessions.body.data.find(
      (candidate) => candidate.status === "OPEN",
    )!;

    const pendingRegion = apps.cash.getByRole("region", {
      name: "Cobros pendientes",
    });
    const collect = pendingRegion.getByRole("button", { name: /^Cobrar / });
    await expect(collect).toBeEnabled();
    await collect.click();
    await expect(
      pendingRegion.getByText(/Cuenta de .* cobrada y liquidada\./),
    ).toBeVisible();

    const settled = await api.poll<ApiData<Check>>(
      "settled check",
      () => api.get("waiter", `/v1/checks/${check.id}`),
      (body) => body.data.status === "SETTLED",
    );
    assertEvidence(settled);
    check = settled.body.data;
    expect(check.totals.balance).toBe(0);
    expect(check.totals.paid).toBe(check.totals.netDue);
    expect(check.paymentsSummary.capturedCount).toBe(1);

    const payments = await api.get<ApiData<Payment[]>>(
      "cashier",
      `/v1/checks/${check.id}/payments`,
    );
    assertEvidence(payments);
    expect(payments.body.data).toHaveLength(1);
    payment = payments.body.data[0]!;
    expect(payment).toMatchObject({
      status: "CAPTURED",
      amountMinorUnits: check.totals.netDue,
    });

    const movements = await api.get<ApiData<CashMovement[]>>(
      "cashier",
      `/v1/cash-sessions/${cashSession.id}/movements`,
    );
    assertEvidence(movements);
    const paymentMovements = movements.body.data.filter(
      (movement) => movement.sourceReference === `FLOOR_PAYMENT:${payment.id}`,
    );
    expect(paymentMovements).toEqual([
      expect.objectContaining({
        type: "CASH_SALE",
        amountMinorUnits: check.totals.netDue,
      }),
    ]);
    evidence.cash = {
      check,
      payment,
      paymentMovement: paymentMovements[0],
      correlationId: settled.correlationId,
    };
  });

  await test.step("Floor closes the visit and releases the table", async () => {
    await apps.floor.reload();
    const servedTable = apps.floor
      .locator(".table-card")
      .filter({
        has: apps.floor.locator(".table-card-num", {
          hasText: new RegExp(`^${tableNumber}$`),
        }),
      })
      .filter({ hasText: "Ocupada" });
    await expect(servedTable).toBeVisible();
    await servedTable.click();
    const closeTable = apps.floor.getByRole("button", { name: "Cerrar mesa" });
    await expect(closeTable).toBeEnabled();
    await closeTable.click();
    await expect(
      apps.floor.getByRole("heading", { name: "Salón", exact: true }),
    ).toBeVisible();

    const closedVisit = await api.poll<ApiData<Visit>>(
      "closed visit",
      () => api.get("waiter", `/v1/visits/${visit.id}`),
      (body) => body.data.status === "CLOSED",
    );
    assertEvidence(closedVisit);
    const statuses = await api.get<ApiData<TableStatus[]>>(
      "waiter",
      `/v1/branches/${BRANCH_ID}/table-statuses`,
    );
    assertEvidence(statuses);
    const tableStatus = statuses.body.data.find(
      (status) => status.tableId === visit.tableIds[0],
    );
    expect(tableStatus).toMatchObject({ status: "AVAILABLE" });
    evidence.close = {
      visit: closedVisit.body.data,
      tableStatus,
      correlationId: closedVisit.correlationId,
    };
  });

  await test.step("Tenant B cannot read or mutate tenant A journey state", async () => {
    const forbiddenRead = await api.get("tenantB", `/v1/visits/${visit.id}`);
    assertEvidence(forbiddenRead);
    expect(forbiddenRead.status).toBe(403);
    const forbiddenWrite = await api.mutate("tenantB", "POST", "/v1/visits", {
      branchId: BRANCH_ID,
      tableIds: visit.tableIds,
      guestCount: 1,
    });
    assertEvidence(forbiddenWrite);
    expect(forbiddenWrite.status).toBe(403);
    evidence.tenantIsolation = { read: forbiddenRead, write: forbiddenWrite };
  });

  await test.step("critical mutations have correlated audit evidence", async () => {
    const expected = [
      ["VISIT_OPENED", visit.id],
      ["ORDER_SUBMITTED", order.id],
      ["KITCHEN_COMMAND_SERVED", command.id],
      ["PAYMENT_CAPTURED", payment.id],
      ["CHECK_SETTLED", check.id],
      ["VISIT_CLOSED", visit.id],
    ] as const;
    const entries: AuditLog[] = [];
    for (const [actionCode, resourceId] of expected) {
      const page = await api.poll<ApiData<AuditLog[]>>(
        `audit ${actionCode}`,
        () =>
          api.get(
            "auditor",
            `/v1/audit-logs?branch_id=${BRANCH_ID}&action_code=${actionCode}`,
          ),
        (body) =>
          body.data.some(
            (entry) =>
              entry.resourceId === resourceId &&
              entry.outcome === "SUCCEEDED" &&
              Boolean(entry.correlationId),
          ),
      );
      assertEvidence(page);
      entries.push(
        page.body.data.find((entry) => entry.resourceId === resourceId)!,
      );
    }
    expect(new Set(entries.map(({ actionCode }) => actionCode))).toEqual(
      new Set(expected.map(([actionCode]) => actionCode)),
    );
    evidence.audit = entries;
  });

  await attachEvidence(testInfo, evidence);
  const checkpointPath = process.env["E2E_DURABILITY_CHECKPOINT"];
  if (checkpointPath) {
    await writeFile(
      checkpointPath,
      JSON.stringify(
        {
          schemaVersion: 1,
          visitId: visit.id,
          tableId: visit.tableIds[0],
          orderId: order.id,
          commandId: command.id,
          checkId: check.id,
          cashSessionId: cashSession.id,
        },
        null,
        2,
      ),
      { encoding: "utf8", mode: 0o600 },
    );
  }
});

async function kitchenAction(
  page: Page,
  commandName: string,
  statusLabel: string,
  actionLabel: string,
) {
  const card = page.getByRole("article", {
    name: `${commandName}, ${statusLabel}`,
    exact: true,
  });
  await expect(card).toBeVisible();
  await card.getByRole("button", { name: actionLabel, exact: true }).click();
}

function assertEvidence(evidence: ApiEvidence<unknown>) {
  expect(evidence.correlationId).toMatch(/^[0-9a-f-]{36}$/i);
}

async function attachEvidence(
  testInfo: TestInfo,
  evidence: Record<string, unknown>,
) {
  await testInfo.attach("mvp-j-001-evidence", {
    body: JSON.stringify(evidence, null, 2),
    contentType: "application/json",
  });
}
