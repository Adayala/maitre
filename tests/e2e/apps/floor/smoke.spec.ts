import { expect, test } from "@playwright/test";
import { expectNoSeriousAccessibilityViolations } from "../../support/accessibility";

test("@smoke muestra el acceso de Floor", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Maitre/);
  await expect(
    page.getByRole("heading", { name: "Maitre Salón" }),
  ).toBeVisible();
  await expectNoSeriousAccessibilityViolations(page);
});

test("muestra estados operativos, filtra mesas y abre una visita", async ({
  page,
}) => {
  const tenantId = "00000000-0000-0000-0000-000000000001";
  const branchId = "00000000-0000-0000-0000-000000000003";
  const salonId = "00000000-0000-0000-0000-000000000004";
  const tables = [
    {
      id: "00000000-0000-0000-0000-000000000101",
      salonId,
      branchId,
      number: "1",
      capacity: 4,
    },
    {
      id: "00000000-0000-0000-0000-000000000102",
      salonId,
      branchId,
      number: "2",
      capacity: 2,
    },
    {
      id: "00000000-0000-0000-0000-000000000103",
      salonId,
      branchId,
      number: "3",
      capacity: 6,
    },
  ];
  let submittedVisit: unknown;

  await page.addInitScript(
    ({ tenant, branch }) => {
      sessionStorage.setItem("maitre.waiter.fixtureAccessToken", "e2e-token");
      localStorage.setItem("maitre.waiter.selectedTenantId", tenant);
      localStorage.setItem("maitre.waiter.selectedBranchId", branch);
    },
    { tenant: tenantId, branch: branchId },
  );

  await page.route("http://127.0.0.1:3101/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (path === "/v1/me/context") {
      return route.fulfill({
        json: {
          user: { id: "user-e2e", displayName: "Mozo E2E", email: null },
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
              { code: "FLOOR", quantity: 1, scopeRefId: branchId },
              { code: "WAITERS", quantity: 5, scopeRefId: branchId },
            ],
          },
        },
      });
    }
    if (path === `/v1/branches/${branchId}/table-statuses`) {
      return route.fulfill({
        json: {
          data: [
            {
              tableId: tables[0]!.id,
              status: "AVAILABLE",
              asOf: "2026-07-29T17:00:00.000Z",
            },
            {
              tableId: tables[1]!.id,
              status: "RESERVED",
              asOf: "2026-07-29T17:00:00.000Z",
            },
            {
              tableId: tables[2]!.id,
              status: "OCCUPIED",
              relatedVisitId: "00000000-0000-0000-0000-000000000201",
              asOf: "2026-07-29T17:00:00.000Z",
            },
          ],
        },
      });
    }
    if (path === "/v1/salons") {
      return route.fulfill({
        json: { data: [{ id: salonId, branchId, name: "Salón principal" }] },
      });
    }
    if (path === "/v1/tables") {
      return route.fulfill({ json: { data: tables } });
    }
    if (path === "/v1/visits" && request.method() === "POST") {
      submittedVisit = request.postDataJSON();
      return route.fulfill({
        status: 201,
        json: {
          data: {
            id: "00000000-0000-0000-0000-000000000202",
            tenantId,
            branchId,
            tableIds: [tables[0]!.id],
            guestCount: 3,
            status: "OPEN",
            revision: 1,
            createdAt: "2026-07-29T17:00:00.000Z",
            updatedAt: "2026-07-29T17:00:00.000Z",
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
    page.getByRole("heading", { name: "Salón principal" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /1 Libre/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /2 Reservada/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /3 Ocupada/ })).toBeVisible();

  await page
    .locator(".waiter-seg-btn")
    .filter({ hasText: "Reservada" })
    .click();
  await expect(page.getByRole("button", { name: /2 Reservada/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /1 Libre/ })).toBeHidden();

  await page.locator(".waiter-seg-btn").filter({ hasText: "Todas" }).click();
  await page.getByRole("button", { name: /1 Libre/ }).click();
  await expect(
    page.getByRole("dialog", { name: "Sentar comensales" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Más" }).click();
  await page.getByRole("button", { name: "Sentar 3 👥" }).click();

  await expect
    .poll(() => submittedVisit)
    .toEqual({
      branchId,
      tableIds: [tables[0]!.id],
      guestCount: 3,
    });
  await expect(
    page.getByRole("dialog", { name: "Sentar comensales" }),
  ).toBeHidden();
});

test("arma un pedido y lo envía a cocina desde una visita", async ({
  page,
}) => {
  const tenantId = "00000000-0000-0000-0000-000000000001";
  const branchId = "00000000-0000-0000-0000-000000000003";
  const brandId = "00000000-0000-0000-0000-000000000002";
  const salonId = "00000000-0000-0000-0000-000000000004";
  const tableId = "00000000-0000-0000-0000-000000000105";
  const visitId = "00000000-0000-0000-0000-000000000205";
  const orderId = "00000000-0000-0000-0000-000000000305";
  const menuId = "00000000-0000-0000-0000-000000000405";
  const categoryId = "00000000-0000-0000-0000-000000000505";
  const productId = "00000000-0000-0000-0000-000000000605";
  let item: Record<string, unknown> | null = null;
  let submitted = false;

  await page.addInitScript(
    ({ tenant, branch }) => {
      sessionStorage.setItem("maitre.waiter.fixtureAccessToken", "e2e-token");
      localStorage.setItem("maitre.waiter.selectedTenantId", tenant);
      localStorage.setItem("maitre.waiter.selectedBranchId", branch);
    },
    { tenant: tenantId, branch: branchId },
  );

  const order = () => ({
    id: orderId,
    tenantId,
    branchId,
    visitId,
    currency: "ARS",
    items: item
      ? [
          {
            id: "item-e2e",
            productId,
            name: "Ravioles de verdura",
            quantity: item["quantity"],
            unitPriceMinorUnits: 8500,
            currency: "ARS",
            modifiers: [],
            allergens: ["GLUTEN"],
            notes: item["notes"],
            status: "QUEUED",
          },
        ]
      : [],
    status: submitted ? "SUBMITTED" : "DRAFT",
    notes: null,
    subtotalMinorUnits: item ? 17000 : 0,
    grandTotalMinorUnits: item ? 17000 : 0,
    revision: item ? 2 : 1,
    createdAt: "2026-07-29T18:00:00.000Z",
  });

  await page.route("http://127.0.0.1:3101/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const method = request.method();
    if (path === "/v1/me/context") {
      return route.fulfill({
        json: {
          user: { id: "waiter-e2e", displayName: "Mozo E2E", email: null },
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
              { code: "FLOOR", quantity: 1, scopeRefId: branchId },
              { code: "KITCHEN", quantity: 1, scopeRefId: branchId },
            ],
          },
        },
      });
    }
    if (path === `/v1/branches/${branchId}/table-statuses`) {
      return route.fulfill({
        json: {
          data: [
            {
              tableId,
              status: "OCCUPIED",
              relatedVisitId: visitId,
              asOf: "2026-07-29T18:00:00.000Z",
            },
          ],
        },
      });
    }
    if (path === "/v1/salons") {
      return route.fulfill({
        json: { data: [{ id: salonId, branchId, name: "Salón principal" }] },
      });
    }
    if (path === "/v1/tables") {
      return route.fulfill({
        json: {
          data: [{ id: tableId, salonId, branchId, number: "5", capacity: 4 }],
        },
      });
    }
    if (path === `/v1/visits/${visitId}`) {
      return route.fulfill({
        json: {
          data: {
            id: visitId,
            tenantId,
            branchId,
            tableIds: [tableId],
            guestCount: 2,
            status: "OPEN",
            revision: 1,
            createdAt: "2026-07-29T18:00:00.000Z",
            updatedAt: "2026-07-29T18:00:00.000Z",
          },
        },
      });
    }
    if (path === `/v1/visits/${visitId}/orders` && method === "GET") {
      return route.fulfill({
        json: { data: submitted || item ? [order()] : [] },
      });
    }
    if (path === `/v1/visits/${visitId}/check` && method === "GET") {
      return route.fulfill({
        status: 404,
        json: { title: "Check not found", status: 404 },
      });
    }
    if (path === `/v1/visits/${visitId}/check` && method === "POST") {
      return route.fulfill({
        status: 201,
        json: { data: { id: "check-e2e", visitId, currency: "ARS" } },
      });
    }
    if (path === `/v1/visits/${visitId}/orders` && method === "POST") {
      return route.fulfill({ status: 201, json: { data: order() } });
    }
    if (path === `/v1/branches/${branchId}`) {
      return route.fulfill({
        json: {
          data: { id: branchId, brandId, name: "Centro", code: "CENTRO" },
        },
      });
    }
    if (path === `/v1/brands/${brandId}/menus`) {
      return route.fulfill({
        json: {
          data: [
            {
              id: menuId,
              brandId,
              name: "Cena",
              isDefault: true,
              status: "ACTIVE",
            },
          ],
        },
      });
    }
    if (path === `/v1/menus/${menuId}`) {
      return route.fulfill({
        json: {
          data: {
            id: menuId,
            brandId,
            name: "Cena",
            isDefault: true,
            status: "ACTIVE",
            categories: [
              {
                id: categoryId,
                menuId,
                name: "Pastas",
                displayOrder: 1,
                status: "ACTIVE",
              },
            ],
          },
        },
      });
    }
    if (path === `/v1/categories/${categoryId}/products`) {
      return route.fulfill({
        json: {
          data: [
            {
              id: productId,
              categoryId,
              name: "Ravioles de verdura",
              description: "Salsa fileto",
              priceMinorUnits: 8500,
              currency: "ARS",
              status: "AVAILABLE",
              allergens: ["GLUTEN"],
              displayOrder: 1,
            },
          ],
        },
      });
    }
    if (path === `/v1/orders/${orderId}` && method === "GET") {
      return route.fulfill({ json: { data: order() } });
    }
    if (path === `/v1/orders/${orderId}/items` && method === "POST") {
      item = request.postDataJSON() as Record<string, unknown>;
      return route.fulfill({ status: 201, json: { data: order() } });
    }
    if (path === `/v1/orders/${orderId}/submit` && method === "POST") {
      submitted = true;
      return route.fulfill({
        json: {
          data: {
            order: order(),
            commands: [{ id: "command-e2e", status: "RECEIVED" }],
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
  await page.getByRole("button", { name: /5 Ocupada/ }).click();
  await page.getByRole("button", { name: /Nuevo pedido/ }).click();
  await expect(
    page.getByRole("heading", { name: "Nuevo pedido" }),
  ).toBeVisible();

  await page
    .getByRole("button", { name: "Agregar Ravioles de verdura" })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Agregar Ravioles de verdura",
  });
  await dialog.getByRole("button", { name: "Más" }).click();
  await dialog.getByPlaceholder("Ej: sin sal, punto jugoso…").fill("Sin queso");
  await dialog.getByRole("button", { name: /Agregar/ }).click();

  const cartButton = page.getByRole("button", { name: /Ver pedido/ });
  await expect(cartButton.locator(".cart-count")).toHaveText("2");
  await page.getByRole("button", { name: "Enviar a cocina" }).click();

  await expect
    .poll(() => item)
    .toEqual({
      productId,
      quantity: 2,
      notes: "Sin queso",
    });
  await expect.poll(() => submitted).toBe(true);
});
