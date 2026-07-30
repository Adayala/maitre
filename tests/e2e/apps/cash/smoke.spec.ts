import { expect, test } from "@playwright/test";
import { expectNoSeriousAccessibilityViolations } from "../../support/accessibility";

test("@smoke muestra el acceso de Cash", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Maitre Caja" }),
  ).toBeVisible();
  await expectNoSeriousAccessibilityViolations(page);
});

test("@ui-contract abre caja, registra una venta, cierra y envía la conciliación", async ({
  page,
}) => {
  const tenantId = "00000000-0000-0000-0000-000000000001";
  const branchId = "00000000-0000-0000-0000-000000000003";
  const registerId = "00000000-0000-0000-0000-000000000401";
  const sessionId = "00000000-0000-0000-0000-000000000402";
  const reconciliationId = "00000000-0000-0000-0000-000000000403";
  const now = "2026-07-29T18:00:00.000Z";
  let sessionStatus: "ABSENT" | "OPEN" | "CLOSING" | "CLOSED" = "ABSENT";
  let movementRecorded = false;
  let reconciliationStatus: "DRAFT" | "SUBMITTED" = "DRAFT";
  let countedMinorUnits: number | null = null;

  const session = () => ({
    id: sessionId,
    tenantId,
    branchId,
    cashRegisterId: registerId,
    currency: "ARS",
    businessDate: "2026-07-29",
    timezone: "America/Argentina/Buenos_Aires",
    openingAmountMinorUnits: 10_000,
    openedAt: now,
    openedBy: "user-e2e",
    cutoffAt:
      sessionStatus === "CLOSING" || sessionStatus === "CLOSED" ? now : null,
    closedAt: sessionStatus === "CLOSED" ? now : null,
    closedBy: sessionStatus === "CLOSED" ? "user-e2e" : null,
    ledgerRevision: movementRecorded ? 2 : 1,
    status: sessionStatus === "ABSENT" ? "OPEN" : sessionStatus,
    suspended: false,
    createdAt: now,
    updatedAt: now,
  });
  const reconciliation = () => ({
    id: reconciliationId,
    tenantId,
    branchId,
    cashRegisterId: registerId,
    cashSessionId: sessionId,
    currency: "ARS",
    ledgerRevision: 2,
    attempt: 1,
    countedMinorUnits,
    expectedMinorUnits: 15_000,
    differenceMinorUnits:
      countedMinorUnits === null ? null : countedMinorUnits - 15_000,
    status: reconciliationStatus,
    preparedBy: "user-e2e",
    preparedAt: now,
    submittedAt: reconciliationStatus === "SUBMITTED" ? now : null,
    createdAt: now,
    updatedAt: now,
  });

  await page.addInitScript(
    ({ tenant, branch, register }) => {
      sessionStorage.setItem("maitre.cashier.fixtureAccessToken", "e2e-token");
      localStorage.setItem("maitre.cashier.selectedTenantId", tenant);
      localStorage.setItem("maitre.cashier.selectedBranchId", branch);
      localStorage.setItem("maitre.cashier.selectedRegisterId", register);
    },
    { tenant: tenantId, branch: branchId, register: registerId },
  );

  await page.route("http://127.0.0.1:3101/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;

    if (path === "/v1/me/context") {
      return route.fulfill({
        json: {
          user: { id: "user-e2e", displayName: "Caja E2E", email: null },
          tenants: [
            {
              id: tenantId,
              name: "Maitre",
              branches: [{ id: branchId, code: "CENTRO", name: "Centro" }],
            },
          ],
        },
      });
    }
    if (path === `/v1/subscriptions/${tenantId}/access`) {
      return route.fulfill({
        json: {
          data: {
            services: [
              { code: "CASH", quantity: 1, scopeRefId: branchId },
              { code: "CASHIERS", quantity: 1, scopeRefId: branchId },
            ],
          },
        },
      });
    }
    if (path === `/v1/cash-registers/${registerId}`) {
      return route.fulfill({
        json: {
          data: {
            id: registerId,
            tenantId,
            branchId,
            code: "CAJA-1",
            displayName: "Caja principal",
            allowedCurrencies: ["ARS"],
            status: "ACTIVE",
            revision: 1,
            createdAt: now,
            updatedAt: now,
          },
        },
      });
    }
    if (path === `/v1/cash-registers/${registerId}/sessions`) {
      if (request.method() === "POST") {
        expect(request.postDataJSON()).toMatchObject({
          currency: "ARS",
          openingAmountMinorUnits: 10_000,
        });
        sessionStatus = "OPEN";
        return route.fulfill({ status: 201, json: { data: session() } });
      }
      return route.fulfill({
        json: { data: sessionStatus === "ABSENT" ? [] : [session()] },
      });
    }
    if (path === `/v1/cash-sessions/${sessionId}/movements`) {
      if (request.method() === "POST") {
        expect(request.postDataJSON()).toMatchObject({
          type: "CASH_SALE",
          amountMinorUnits: 5_000,
          currency: "ARS",
        });
        movementRecorded = true;
        return route.fulfill({
          status: 201,
          json: {
            data: {
              id: "00000000-0000-0000-0000-000000000404",
              tenantId,
              branchId,
              cashRegisterId: registerId,
              cashSessionId: sessionId,
              currency: "ARS",
              type: "CASH_SALE",
              direction: "IN",
              amountMinorUnits: 5_000,
              ledgerRevision: 2,
              occurredAt: now,
              recordedAt: now,
            },
          },
        });
      }
      return route.fulfill({
        json: {
          data: movementRecorded
            ? [
                {
                  id: "00000000-0000-0000-0000-000000000404",
                  tenantId,
                  branchId,
                  cashRegisterId: registerId,
                  cashSessionId: sessionId,
                  currency: "ARS",
                  type: "CASH_SALE",
                  direction: "IN",
                  amountMinorUnits: 5_000,
                  ledgerRevision: 2,
                  occurredAt: now,
                  recordedAt: now,
                },
              ]
            : [],
        },
      });
    }
    if (path === `/v1/cash-sessions/${sessionId}/begin-close`) {
      sessionStatus = "CLOSING";
      return route.fulfill({ json: { data: session() } });
    }
    if (path === `/v1/cash-sessions/${sessionId}/close`) {
      sessionStatus = "CLOSED";
      return route.fulfill({
        json: {
          data: { session: session(), reconciliation: reconciliation() },
        },
      });
    }
    if (path === `/v1/cash-reconciliations/${reconciliationId}`) {
      return route.fulfill({ json: { data: reconciliation() } });
    }
    if (path === `/v1/cash-reconciliations/${reconciliationId}/summary`) {
      return route.fulfill({
        json: {
          data: {
            cashReconciliationId: reconciliationId,
            cashSessionId: sessionId,
            currency: "ARS",
            ledgerRevision: 2,
            openingMinorUnits: 10_000,
            expectedMinorUnits: 15_000,
            countedMinorUnits,
            differenceMinorUnits:
              countedMinorUnits === null ? null : countedMinorUnits - 15_000,
            status: reconciliationStatus,
          },
        },
      });
    }
    if (path === `/v1/cash-reconciliations/${reconciliationId}/record-counts`) {
      countedMinorUnits = Number(
        (request.postDataJSON() as { countedMinorUnits: number })
          .countedMinorUnits,
      );
      return route.fulfill({ json: { data: reconciliation() } });
    }
    if (path === `/v1/cash-reconciliations/${reconciliationId}/submit`) {
      reconciliationStatus = "SUBMITTED";
      return route.fulfill({ json: { data: reconciliation() } });
    }
    if (path === `/v1/branches/${branchId}/pending-checks`) {
      return route.fulfill({ json: { data: [] } });
    }
    if (path === `/v1/branches/${branchId}/daily-settlement`) {
      return route.fulfill({
        json: {
          data: {
            tenantId,
            branchId,
            businessDate: "2026-07-29",
            timezone: "America/Argentina/Buenos_Aires",
            currency: "ARS",
            sessionCount: sessionStatus === "ABSENT" ? 0 : 1,
            openingsMinorUnits: sessionStatus === "ABSENT" ? 0 : 10_000,
            movementsByType: movementRecorded ? { CASH_SALE: 5_000 } : {},
            expectedMinorUnits: movementRecorded ? 15_000 : 10_000,
            countedMinorUnits: countedMinorUnits ?? 0,
            differenceMinorUnits:
              countedMinorUnits === null ? 0 : countedMinorUnits - 15_000,
            sessions:
              sessionStatus === "ABSENT"
                ? []
                : [
                    {
                      cashSessionId: sessionId,
                      cashRegisterId: registerId,
                      status:
                        sessionStatus === "CLOSED" ? "CLOSED" : sessionStatus,
                      openingMinorUnits: 10_000,
                      expectedMinorUnits: movementRecorded ? 15_000 : 10_000,
                      countedMinorUnits,
                      differenceMinorUnits:
                        countedMinorUnits === null
                          ? null
                          : countedMinorUnits - 15_000,
                    },
                  ],
          },
        },
      });
    }
    return route.fulfill({
      status: 404,
      json: { title: "Fixture route not found", status: 404 },
    });
  });

  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Caja principal" }),
  ).toBeVisible();

  await page.getByLabel("Apertura inicial").fill("100");
  await page.getByRole("button", { name: "Abrir sesión" }).click();
  await expect(
    page.getByText("Abierta", { exact: true }).first(),
  ).toBeVisible();

  await page.getByLabel("Monto").fill("50");
  await page.getByRole("button", { name: "Registrar movimiento" }).click();
  await expect(page.getByText("Movimiento registrado.")).toBeVisible();
  await expect(page.getByText("Venta efectivo").last()).toBeVisible();

  await page.getByRole("button", { name: "Iniciar cierre" }).click();
  await expect(
    page.getByText("En cierre", { exact: true }).first(),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cerrar sesión" }).click();

  await expect(
    page.getByText("Sesión cerrada y reconciliación creada."),
  ).toBeVisible();
  await page.getByLabel("Conteo físico").fill("150");
  await page.getByRole("button", { name: "Guardar conteo" }).click();
  await expect(page.getByText("Conteo guardado.")).toBeVisible();
  await page.getByRole("button", { name: "Enviar reconciliación" }).click();
  await expect(
    page.getByText("Reconciliación enviada para aprobación."),
  ).toBeVisible();
  await expect(
    page.getByText("Enviada", { exact: true }).first(),
  ).toBeVisible();
});

test("@ui-contract cobra el saldo exacto de una cuenta pendiente y la liquida", async ({
  page,
}) => {
  const tenantId = "00000000-0000-0000-0000-000000000001";
  const branchId = "00000000-0000-0000-0000-000000000003";
  const registerId = "00000000-0000-0000-0000-000000000411";
  const sessionId = "00000000-0000-0000-0000-000000000412";
  const checkId = "00000000-0000-0000-0000-000000000413";
  const paymentId = "00000000-0000-0000-0000-000000000414";
  const now = "2026-07-30T18:00:00.000Z";
  let pending = true;
  let sessionOpen = false;

  const session = {
    id: sessionId,
    tenantId,
    branchId,
    cashRegisterId: registerId,
    currency: "ARS",
    businessDate: "2026-07-30",
    timezone: "America/Argentina/Buenos_Aires",
    openingAmountMinorUnits: 20_000,
    openedAt: now,
    openedBy: "user-e2e",
    ledgerRevision: 1,
    status: "OPEN",
    suspended: false,
    createdAt: now,
    updatedAt: now,
  };
  const check = {
    id: checkId,
    tenantId,
    branchId,
    visitId: "00000000-0000-0000-0000-000000000415",
    currency: "ARS",
    lines: [
      {
        id: "00000000-0000-0000-0000-000000000416",
        description: "Cena",
        amountMinorUnits: 4_500,
      },
    ],
    adjustments: [],
    status: "PAYMENT_PENDING",
    revision: 3,
    createdAt: now,
    updatedAt: now,
    totals: {
      gross: 4_500,
      discounts: 0,
      estimatedTax: 0,
      serviceCharges: 0,
      netDue: 4_500,
      paid: 0,
      balance: 4_500,
    },
    paymentsSummary: {
      count: 0,
      capturedCount: 0,
      refundCount: 0,
      paidMinorUnits: 0,
    },
    visit: {
      id: "00000000-0000-0000-0000-000000000415",
      status: "CLOSING",
      guestCount: 2,
      tableIds: ["00000000-0000-0000-0000-000000000417"],
    },
    tables: [
      {
        id: "00000000-0000-0000-0000-000000000417",
        number: "12",
      },
    ],
  };

  await page.addInitScript(
    ({ tenant, branch, register }) => {
      sessionStorage.setItem("maitre.cashier.fixtureAccessToken", "e2e-token");
      localStorage.setItem("maitre.cashier.selectedTenantId", tenant);
      localStorage.setItem("maitre.cashier.selectedBranchId", branch);
      localStorage.setItem("maitre.cashier.selectedRegisterId", register);
    },
    { tenant: tenantId, branch: branchId, register: registerId },
  );

  await page.route("http://127.0.0.1:3101/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const selectedBranchHeader = request.headers()["x-branch-id"];

    if (path === "/v1/me/context") {
      return route.fulfill({
        json: {
          user: { id: "user-e2e", displayName: "Caja E2E", email: null },
          tenants: [
            {
              id: tenantId,
              name: "Maitre",
              branches: [{ id: branchId, code: "CENTRO", name: "Centro" }],
            },
          ],
        },
      });
    }
    if (path === `/v1/subscriptions/${tenantId}/access`) {
      return route.fulfill({
        json: {
          data: {
            services: [
              { code: "CASH", quantity: 1, scopeRefId: branchId },
              { code: "CASHIERS", quantity: 1, scopeRefId: branchId },
            ],
          },
        },
      });
    }
    if (path === `/v1/cash-registers/${registerId}`) {
      return route.fulfill({
        json: {
          data: {
            id: registerId,
            tenantId,
            branchId,
            code: "CAJA-1",
            displayName: "Caja principal",
            allowedCurrencies: ["ARS"],
            status: "ACTIVE",
            revision: 1,
            createdAt: now,
            updatedAt: now,
          },
        },
      });
    }
    if (path === `/v1/cash-registers/${registerId}/sessions`) {
      if (request.method() === "POST") {
        sessionOpen = true;
        return route.fulfill({ status: 201, json: { data: session } });
      }
      return route.fulfill({ json: { data: sessionOpen ? [session] : [] } });
    }
    if (path === `/v1/cash-sessions/${sessionId}/movements`) {
      return route.fulfill({ json: { data: [] } });
    }
    if (path === `/v1/branches/${branchId}/daily-settlement`) {
      return route.fulfill({
        json: {
          data: {
            tenantId,
            branchId,
            businessDate: "2026-07-30",
            timezone: "America/Argentina/Buenos_Aires",
            currency: "ARS",
            sessionCount: 1,
            openingsMinorUnits: 20_000,
            movementsByType: {},
            expectedMinorUnits: 20_000,
            countedMinorUnits: 0,
            differenceMinorUnits: 0,
            sessions: [],
          },
        },
      });
    }
    if (path === `/v1/branches/${branchId}/pending-checks`) {
      expect(selectedBranchHeader).toBe(branchId);
      return route.fulfill({ json: { data: pending ? [check] : [] } });
    }
    if (path === `/v1/checks/${checkId}/payments`) {
      expect(selectedBranchHeader).toBe(branchId);
      expect(request.postDataJSON()).toMatchObject({
        amountMinorUnits: 4_500,
        currency: "ARS",
        method: "CASH",
      });
      return route.fulfill({
        status: 201,
        json: {
          data: {
            id: paymentId,
            tenantId,
            branchId,
            checkId,
            amountMinorUnits: 4_500,
            currency: "ARS",
            method: "CASH",
            status: "PENDING",
            idempotencyKey: (
              request.postDataJSON() as { idempotencyKey: string }
            ).idempotencyKey,
            revision: 1,
            createdAt: now,
            updatedAt: now,
          },
        },
      });
    }
    if (path === `/v1/payments/${paymentId}/capture`) {
      expect(selectedBranchHeader).toBe(branchId);
      expect(request.postDataJSON()).toEqual({ cashSessionId: sessionId });
      return route.fulfill({
        json: {
          data: {
            id: paymentId,
            tenantId,
            branchId,
            checkId,
            amountMinorUnits: 4_500,
            currency: "ARS",
            method: "CASH",
            status: "CAPTURED",
            idempotencyKey: "captured",
            revision: 2,
            createdAt: now,
            updatedAt: now,
          },
        },
      });
    }
    if (path === `/v1/checks/${checkId}/settle`) {
      expect(selectedBranchHeader).toBe(branchId);
      pending = false;
      return route.fulfill({
        json: {
          data: {
            ...check,
            status: "SETTLED",
            totals: { ...check.totals, paid: 4_500, balance: 0 },
          },
        },
      });
    }
    return route.fulfill({
      status: 404,
      json: { title: "Fixture route not found", status: 404 },
    });
  });

  await page.goto("/");
  const pendingRegion = page.getByRole("region", {
    name: "Cobros pendientes",
  });
  await expect(pendingRegion).toBeVisible();
  await pendingRegion.getByRole("button", { name: /Mesa 12/ }).click();
  const payButton = pendingRegion.getByRole("button", { name: /Cobrar/ });
  await expect(payButton).toBeDisabled();
  await expect(
    pendingRegion.getByText("Abrí una sesión en ARS para cobrar en efectivo."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Abrir sesión" }).click();
  await expect(payButton).toBeEnabled();
  await payButton.click();
  await expect(
    pendingRegion.getByText("Cuenta de Mesa 12 cobrada y liquidada."),
  ).toBeVisible();
  await expect(pendingRegion.getByText("Cola al día")).toBeVisible();
  await expectNoSeriousAccessibilityViolations(page);
});
