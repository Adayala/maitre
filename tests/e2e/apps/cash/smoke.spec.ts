import { expect, test } from "@playwright/test";
import { expectNoSeriousAccessibilityViolations } from "../../support/accessibility";

test("@smoke muestra el acceso de Cash", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Maitre Caja" }),
  ).toBeVisible();
  await expectNoSeriousAccessibilityViolations(page);
});

test("abre caja, registra una venta, cierra y envía la conciliación", async ({
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
