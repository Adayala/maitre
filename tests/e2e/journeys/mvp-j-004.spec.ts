import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, type TestInfo } from "@playwright/test";
import type { ApiEvidence } from "./api-client.js";
import { JourneyApiClient } from "./api-client.js";
import { test } from "./fixtures.js";

const BRANCH_ID = "00000000-0000-0000-0000-000000000003";
const DEMO_CATEGORY_ID = "00000000-0000-0000-0000-00000000000a";
const APP_TIME_ZONE = "America/Argentina/Buenos_Aires";

interface ApiData<T> {
  data: T;
}

interface Salon {
  id: string;
}

interface TableRecord {
  id: string;
  number: string;
  name?: string;
}

interface Reservation {
  id: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "NO_SHOW";
  startAt: string;
  notes?: string;
  tableIds?: string[];
}

interface Visit {
  id: string;
  status: "OPEN" | "CLOSING" | "CLOSED" | "CANCELLED";
}

interface TableStatus {
  tableId: string;
  status: string;
}

interface Product {
  id: string;
  name: string;
  priceMinorUnits: number;
}

interface OrderItem {
  id: string;
  name: string;
  status: "QUEUED" | "IN_PREP" | "READY" | "DELIVERED" | "CANCELLED";
}

interface Order {
  id: string;
  status: string;
  items: OrderItem[];
}

interface KitchenCommand {
  id: string;
  stationId: string;
  status: string;
  cancelReason?: string;
}

interface Check {
  id: string;
  status: "OPEN" | "PAYMENT_PENDING" | "SETTLED" | "VOID";
  totals: { netDue: number; paid: number; balance: number };
  paymentsSummary: { count: number; capturedCount: number };
}

interface Payment {
  id: string;
  status: "PENDING" | "AUTHORIZED" | "CAPTURED" | "FAILED" | "VOID";
}

test("@release-journey MVP-J-004 keeps a customer reservation consistent across Guest, Host, and Floor", async ({
  api,
  apps,
  manifest,
}, testInfo) => {
  test.setTimeout(Number(process.env["E2E_JOURNEY_TIMEOUT_MS"] ?? 180_000));
  const suffix = `${manifest.runId.slice(-6)}-${Date.now()}`;
  const note = `Cumpleaños sin gluten ${suffix}`;
  const cancelledNote = `Cancelación cliente ${suffix}`;
  const table = await createRealTable(
    api,
    `G${suffix.slice(-7)}`,
    `Guest ${suffix}`,
    20,
  );
  const evidence: Record<string, unknown> = { table };
  let assignedTableId = table.id;

  await test.step("Guest checks availability and creates a reservation", async () => {
    await apps.guest.reload();
    await apps.guest
      .getByRole("button", { name: "Reservar", exact: true })
      .click();
    await apps.guest.getByLabel("Comensales").fill("20");
    await apps.guest.getByLabel("Fecha y hora").fill(futureDateTimeLocal(1));
    await apps.guest.getByLabel("Duración (min)").fill("90");
    await apps.guest.getByLabel("Notas").fill(note);
    await expect(apps.guest.getByText("Hay disponibilidad.")).toBeVisible({
      timeout: 60_000,
    });
    const [response] = await Promise.all([
      apps.guest.waitForResponse(
        (candidate) =>
          candidate.request().method() === "POST" &&
          new URL(candidate.url()).pathname === "/v1/my/reservations",
      ),
      apps.guest
        .locator("form")
        .getByRole("button", { name: "Reservar", exact: true })
        .click(),
    ]);
    expect(response.status()).toBe(201);
    const reservation = ((await response.json()) as ApiData<Reservation>).data;
    expect(reservation).toMatchObject({ status: "PENDING", notes: note });
    evidence.createdByGuest = reservation;
  });

  const reservation = evidence.createdByGuest as Reservation;
  await test.step("Host confirms and Floor exposes the reserved table", async () => {
    await apps.host.reload();
    await apps.host
      .getByRole("button", { name: "Reservas", exact: true })
      .click();
    const card = apps.host.locator(".host-reservation-card", { hasText: note });
    await expect(card).toBeVisible();
    const [response] = await Promise.all([
      apps.host.waitForResponse(
        (candidate) =>
          new URL(candidate.url()).pathname ===
          `/v1/reservations/${reservation.id}/confirm`,
      ),
      card.getByRole("button", { name: "Confirmar", exact: true }).click(),
    ]);
    expect(response.status()).toBe(200);
    const confirmed = ((await response.json()) as ApiData<Reservation>).data;
    assignedTableId = confirmed.tableIds![0]!;
    expect(confirmed.status).toBe("CONFIRMED");
    const reserved = await api.poll<ApiData<TableStatus[]>>(
      "reservation enters the active table window",
      () => api.get("waiter", `/v1/branches/${BRANCH_ID}/table-statuses`),
      (body) =>
        body.data.some(
          (item) =>
            item.tableId === assignedTableId && item.status === "RESERVED",
        ),
      70_000,
    );
    assertOk(reserved);
    await apps.floor.reload();
    await expect(
      apps.floor.locator(`[data-table-id="${assignedTableId}"]`),
    ).toContainText("Reservada");
    evidence.confirmedByHost = confirmed;
  });

  await test.step("Guest sees confirmation and Host records the no-show", async () => {
    await apps.guest.reload();
    await openGuestReservations(apps.guest);
    await expect(guestReservationCard(apps.guest, reservation)).toContainText(
      "Confirmada",
    );
    await apps.host.reload();
    await apps.host
      .getByRole("button", { name: "Reservas", exact: true })
      .click();
    const hostCard = apps.host.locator(".host-reservation-card", {
      hasText: note,
    });
    const [response] = await Promise.all([
      apps.host.waitForResponse(
        (candidate) =>
          new URL(candidate.url()).pathname ===
          `/v1/reservations/${reservation.id}/no-show`,
      ),
      hostCard.getByRole("button", { name: "No-show", exact: true }).click(),
    ]);
    expect(response.status()).toBe(200);
    await apps.guest.reload();
    await openGuestReservations(apps.guest);
    await expect(guestReservationCard(apps.guest, reservation)).toContainText(
      "No show",
    );
    await apps.floor.reload();
    await expect(
      apps.floor.locator(`[data-table-id="${assignedTableId}"]`),
    ).toContainText("Libre");
    evidence.noShow = ((await response.json()) as ApiData<Reservation>).data;
  });

  await test.step("Guest cancellation persists in Host history", async () => {
    const created = await api.mutate<ApiData<Reservation>>(
      "auditor",
      "POST",
      "/v1/my/reservations",
      {
        branchId: BRANCH_ID,
        partySize: 2,
        startAt: new Date(Date.now() + 5 * 60 * 60_000).toISOString(),
        durationMinutes: 60,
        notes: cancelledNote,
      },
    );
    assertOk(created, 201);
    await apps.guest.reload();
    await openGuestReservations(apps.guest);
    const card = apps.guest.locator(".customer-reservation-card", {
      hasText: cancelledNote,
    });
    const [response] = await Promise.all([
      apps.guest.waitForResponse(
        (candidate) =>
          new URL(candidate.url()).pathname ===
          `/v1/my/reservations/${created.body.data.id}/cancel`,
      ),
      card.getByRole("button", { name: "Cancelar", exact: true }).click(),
    ]);
    expect(response.status()).toBe(200);
    await apps.host.reload();
    await apps.host
      .getByRole("button", { name: "Reservas", exact: true })
      .click();
    await apps.host
      .getByRole("button", { name: "CANCELLED", exact: true })
      .click();
    await expect(
      apps.host.locator(".host-reservation-card", { hasText: cancelledNote }),
    ).toContainText("CANCELLED");
    evidence.cancelledByGuest = created.body.data.id;
  });

  await assertAccessible([apps.guest, apps.host, apps.floor]);
  await attachEvidence(testInfo, "mvp-j-004-evidence", evidence);
});

test("@release-journey MVP-J-005 recovers kitchen cancellation and split payment across Floor, Kitchen, Cash, and Dash", async ({
  api,
  apps,
  manifest,
}, testInfo) => {
  test.setTimeout(Number(process.env["E2E_JOURNEY_TIMEOUT_MS"] ?? 240_000));
  const suffix = `${manifest.runId.slice(-6)}-${Date.now()}`;
  const table = await createRealTable(
    api,
    `X${suffix.slice(-7)}`,
    `Excepción ${suffix}`,
    4,
  );
  const unavailable = await createRealProduct(
    api,
    `Ravioles agotados ${suffix}`,
    420_000,
  );
  const replacement = await createRealProduct(
    api,
    `Risotto reemplazo ${suffix}`,
    510_000,
  );
  const evidence: Record<string, unknown> = { table, unavailable, replacement };

  const visitResponse = await api.mutate<ApiData<Visit>>(
    "waiter",
    "POST",
    "/v1/visits",
    {
      branchId: BRANCH_ID,
      tableIds: [table.id],
      guestCount: 2,
    },
  );
  assertOk(visitResponse, 201);
  const visit = visitResponse.body.data;
  const checkResponse = await api.mutate<ApiData<Check>>(
    "waiter",
    "POST",
    `/v1/visits/${visit.id}/check`,
    { currency: "ARS" },
  );
  assertOk(checkResponse, 201);
  const checkId = checkResponse.body.data.id;

  await test.step("Floor and Kitchen receive the unavailable order", async () => {
    await apps.floor.reload();
    const tableCard = apps.floor.locator(`[data-table-id="${table.id}"]`);
    await expect(tableCard).toContainText("Ocupada");
    await tableCard.click();
    const submitted = await createSubmittedOrder(api, visit.id, unavailable);
    await selectKitchenStation(apps.kitchen, submitted.command.stationId);
    await expect(
      apps.kitchen.locator(`[data-command-id="${submitted.command.id}"]`),
    ).toContainText(unavailable.name);
    evidence.cancelledOrder = submitted.order;
    evidence.cancelledCommand = submitted.command;
  });

  const cancelledCommand = evidence.cancelledCommand as KitchenCommand;
  const cancelledOrder = evidence.cancelledOrder as Order;
  await test.step("Kitchen pauses and an authorized manager cancels with a reason", async () => {
    await kitchenAction(apps.kitchen, cancelledCommand.id, "Tomar");
    await kitchenAction(apps.kitchen, cancelledCommand.id, "Empezar");
    await kitchenAction(apps.kitchen, cancelledCommand.id, "Pausar");
    await kitchenAction(apps.kitchen, cancelledCommand.id, "Reanudar");
    const card = apps.kitchen.locator(
      `[data-command-id="${cancelledCommand.id}"]`,
    );
    await expect(
      card.getByRole("button", { name: "Cancelar", exact: true }),
    ).toHaveCount(0);
    const cancelled = await api.mutate<ApiData<KitchenCommand>>(
      "auditor",
      "POST",
      `/v1/kitchen/commands/${cancelledCommand.id}/cancel`,
      { reason: "Insumo agotado; solicitar reemplazo" },
    );
    assertOk(cancelled);
    expect(cancelled.body.data.cancelReason).toBe(
      "Insumo agotado; solicitar reemplazo",
    );
    const cancelledItem = await api.mutate<ApiData<Order>>(
      "auditor",
      "POST",
      `/v1/orders/${cancelledOrder.id}/items/${cancelledOrder.items[0]!.id}/cancel`,
      { reasonCode: "OUT_OF_STOCK" },
    );
    assertOk(cancelledItem);
    expect(cancelledItem.body.data.items[0]!.status).toBe("CANCELLED");
  });

  await test.step("Replacement completes and Floor receives it", async () => {
    const submitted = await createSubmittedOrder(api, visit.id, replacement);
    await selectKitchenStation(apps.kitchen, submitted.command.stationId);
    for (const action of ["Tomar", "Empezar", "Marcar lista", "Entregar"]) {
      await kitchenAction(apps.kitchen, submitted.command.id, action);
    }
    const delivered = await api.poll<ApiData<Order>>(
      "delivered replacement",
      () => api.get("waiter", `/v1/orders/${submitted.order.id}`),
      (body) => body.data.status === "DELIVERED",
    );
    assertOk(delivered);
    await apps.floor.reload();
    await apps.floor.locator(`[data-table-id="${table.id}"]`).click();
    await expect(
      apps.floor.getByText(replacement.name, { exact: true }),
    ).toBeVisible();
    evidence.replacementOrder = delivered.body.data;
  });

  await test.step("Adjustment, failed card, partial card, and Cash settlement preserve totals", async () => {
    const adjusted = await api.mutate<ApiData<Check>>(
      "auditor",
      "POST",
      `/v1/checks/${checkId}/add-adjustment`,
      {
        description: `Anulación ${unavailable.name}`,
        amountMinorUnits: -unavailable.priceMinorUnits,
        reason: "OUT_OF_STOCK",
      },
    );
    assertOk(adjusted);
    expect(adjusted.body.data.totals.netDue).toBe(replacement.priceMinorUnits);
    const requested = await api.mutate<ApiData<Check>>(
      "waiter",
      "POST",
      `/v1/checks/${checkId}/request-payment`,
      {},
    );
    assertOk(requested);

    const failedIntent = await createPayment(
      api,
      checkId,
      100_000,
      `failed-${suffix}`,
    );
    const failed = await api.mutate<ApiData<Payment>>(
      "cashier",
      "POST",
      `/v1/payments/${failedIntent.id}/fail`,
      {},
    );
    assertOk(failed);
    const partialIntent = await createPayment(
      api,
      checkId,
      200_000,
      `partial-${suffix}`,
    );
    const captured = await api.mutate<ApiData<Payment>>(
      "cashier",
      "POST",
      `/v1/payments/${partialIntent.id}/capture`,
      {},
    );
    assertOk(captured);
    const check = await api.get<ApiData<Check>>(
      "cashier",
      `/v1/checks/${checkId}`,
    );
    assertOk(check);
    expect(check.body.data.totals).toMatchObject({
      netDue: replacement.priceMinorUnits,
      paid: 200_000,
      balance: replacement.priceMinorUnits - 200_000,
    });

    await apps.cash.reload();
    const pendingRegion = apps.cash.getByRole("region", {
      name: "Cobros pendientes",
    });
    const pendingCheck = pendingRegion
      .locator(".pending-check-row")
      .filter({ hasText: table.name ?? `Mesa ${table.number}` });
    await expect(pendingCheck).toBeVisible();
    await pendingCheck.click();
    await pendingRegion
      .getByRole("button", { name: "Otro", exact: true })
      .click();
    const [settleResponse] = await Promise.all([
      apps.cash.waitForResponse(
        (candidate) =>
          new URL(candidate.url()).pathname === `/v1/checks/${checkId}/settle`,
      ),
      pendingRegion.getByRole("button", { name: /Cobrar/ }).click(),
    ]);
    expect(settleResponse.status()).toBe(200);
    const settled = await api.get<ApiData<Check>>(
      "cashier",
      `/v1/checks/${checkId}`,
    );
    assertOk(settled);
    expect(settled.body.data.status).toBe("SETTLED");
    expect(settled.body.data.paymentsSummary).toMatchObject({
      count: 3,
      capturedCount: 2,
    });
    evidence.payments = {
      failed: failed.body.data,
      partial: captured.body.data,
      settled: settled.body.data,
    };
  });

  await test.step("Floor closes, Dash reads, and tenant-role boundaries hold", async () => {
    await apps.floor.reload();
    await apps.floor.locator(`[data-table-id="${table.id}"]`).click();
    const [closeResponse] = await Promise.all([
      apps.floor.waitForResponse(
        (candidate) =>
          new URL(candidate.url()).pathname === `/v1/visits/${visit.id}/close`,
      ),
      apps.floor
        .getByRole("button", { name: "Cerrar mesa", exact: true })
        .click(),
    ]);
    expect(closeResponse.status()).toBe(200);
    const released = await api.poll<ApiData<TableStatus[]>>(
      "released table",
      () => api.get("waiter", `/v1/branches/${BRANCH_ID}/table-statuses`),
      (body) =>
        body.data.some(
          (item) => item.tableId === table.id && item.status === "AVAILABLE",
        ),
    );
    assertOk(released);
    await apps.floor.reload();
    await expect(
      apps.floor.locator(`[data-table-id="${table.id}"]`),
    ).toContainText("Libre");
    await apps.dash.goto(
      new URL("/overview", manifest.applications.dash).toString(),
    );
    await expect(
      apps.dash.getByRole("heading", { name: "Resumen del tenant" }),
    ).toBeVisible();

    const waiterCapture = await api.mutate(
      "waiter",
      "POST",
      `/v1/payments/${(evidence.payments as { partial: Payment }).partial.id}/capture`,
      {},
    );
    const cashierKitchen = await api.mutate(
      "cashier",
      "POST",
      `/v1/kitchen/commands/${cancelledCommand.id}/claim`,
      {},
    );
    const otherTenant = await api.get("tenantB", `/v1/checks/${checkId}`, {
      tenantId: "00000000-0000-0000-0000-000000000002",
    });
    expect([
      waiterCapture.status,
      cashierKitchen.status,
      otherTenant.status,
    ]).toEqual([403, 403, 403]);
    evidence.denials = [
      waiterCapture.status,
      cashierKitchen.status,
      otherTenant.status,
    ];
  });

  await assertAccessible([apps.floor, apps.kitchen, apps.cash, apps.dash]);
  await attachEvidence(testInfo, "mvp-j-005-evidence", evidence);
});

async function createRealTable(
  api: JourneyApiClient,
  number: string,
  name: string,
  capacity: number,
) {
  const salons = await api.get<ApiData<Salon[]>>(
    "auditor",
    `/v1/salons?branchId=${BRANCH_ID}`,
  );
  assertOk(salons);
  const created = await api.mutate<ApiData<TableRecord>>(
    "auditor",
    "POST",
    "/v1/tables",
    {
      salonId: salons.body.data[0]!.id,
      number,
      name,
      capacity,
    },
  );
  assertOk(created, 201);
  return created.body.data;
}

async function createRealProduct(
  api: JourneyApiClient,
  name: string,
  priceMinorUnits: number,
) {
  const created = await api.mutate<ApiData<Product>>(
    "auditor",
    "POST",
    `/v1/categories/${DEMO_CATEGORY_ID}/products`,
    { name, priceMinorUnits, currency: "ARS" },
  );
  assertOk(created, 201);
  return created.body.data;
}

async function createSubmittedOrder(
  api: JourneyApiClient,
  visitId: string,
  product: Product,
) {
  const draft = await api.mutate<ApiData<Order>>(
    "waiter",
    "POST",
    `/v1/visits/${visitId}/orders`,
    {},
  );
  assertOk(draft, 201);
  const withItem = await api.mutate<ApiData<Order>>(
    "waiter",
    "POST",
    `/v1/orders/${draft.body.data.id}/items`,
    { productId: product.id, quantity: 1 },
  );
  assertOk(withItem, 201);
  const submitted = await api.mutate<
    ApiData<{ order: Order; commands: KitchenCommand[] }>
  >("waiter", "POST", `/v1/orders/${draft.body.data.id}/submit`, {});
  assertOk(submitted);
  return {
    order: submitted.body.data.order,
    command: submitted.body.data.commands[0]!,
  };
}

async function createPayment(
  api: JourneyApiClient,
  checkId: string,
  amountMinorUnits: number,
  idempotencyKey: string,
) {
  const created = await api.mutate<ApiData<Payment>>(
    "cashier",
    "POST",
    `/v1/checks/${checkId}/payments`,
    { amountMinorUnits, currency: "ARS", method: "CARD", idempotencyKey },
  );
  assertOk(created, 201);
  return created.body.data;
}

async function selectKitchenStation(page: Page, stationId: string) {
  await page.evaluate(
    (id) => localStorage.setItem("maitre.kitchen.selectedStationId", id),
    stationId,
  );
  await page.reload();
}

async function kitchenAction(page: Page, commandId: string, label: string) {
  const card = page.locator(`[data-command-id="${commandId}"]`);
  const [response] = await Promise.all([
    page.waitForResponse(
      (candidate) =>
        candidate.request().method() === "POST" &&
        new URL(candidate.url()).pathname.startsWith(
          `/v1/kitchen/commands/${commandId}/`,
        ),
    ),
    card.getByRole("button", { name: label, exact: true }).click(),
  ]);
  expect(response.status()).toBe(200);
}

async function assertAccessible(pages: Page[]) {
  for (const page of pages) {
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.filter((violation) =>
        ["serious", "critical"].includes(violation.impact ?? ""),
      ),
    ).toEqual([]);
  }
}

async function openGuestReservations(page: Page) {
  await page
    .getByRole("button", { name: "Mis reservas", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "Mis reservas", exact: true }),
  ).toBeVisible();
}

function guestReservationCard(page: Page, reservation: Reservation) {
  const displayedStartAt = new Date(reservation.startAt).toLocaleString(
    "es-AR",
    { timeZone: APP_TIME_ZONE },
  );

  return page.locator(".customer-reservation-card", {
    hasText: displayedStartAt,
  });
}

function assertOk(evidence: ApiEvidence<unknown>, expected = 200) {
  expect(evidence.status).toBe(expected);
}

async function attachEvidence(
  testInfo: TestInfo,
  name: string,
  evidence: Record<string, unknown>,
) {
  await testInfo.attach(name, {
    body: JSON.stringify(evidence, null, 2),
    contentType: "application/json",
  });
}

function futureDateTimeLocal(minutes: number) {
  const date = new Date(Date.now() + minutes * 60_000);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((result, part) => {
      if (part.type !== "literal") result[part.type] = part.value;
      return result;
    }, {});

  return `${parts["year"]}-${parts["month"]}-${parts["day"]}T${parts["hour"]}:${parts["minute"]}`;
}
