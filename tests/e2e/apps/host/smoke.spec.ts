import { expect, test } from "@playwright/test";
import { expectNoSeriousAccessibilityViolations } from "../../support/accessibility";

test("@smoke muestra el acceso de Host", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Maitre/);
  await expect(
    page.getByRole("heading", { name: "Maitre Host" }),
  ).toBeVisible();
  await expectNoSeriousAccessibilityViolations(page);
});

test("crea una reserva desde recepción y la incorpora a la agenda", async ({
  page,
}) => {
  const tenantId = "00000000-0000-0000-0000-000000000001";
  const branchId = "00000000-0000-0000-0000-000000000003";
  const salonId = "00000000-0000-0000-0000-000000000004";
  const reservationId = "00000000-0000-0000-0000-000000000201";
  const guestId = "00000000-0000-0000-0000-000000000301";
  let createdReservation: Record<string, unknown> | null = null;

  await page.addInitScript(
    ({ tenant, branch }) => {
      sessionStorage.setItem("maitre.host.fixtureAccessToken", "e2e-token");
      localStorage.setItem("maitre.host.selectedTenantId", tenant);
      localStorage.setItem("maitre.host.selectedBranchId", branch);
    },
    { tenant: tenantId, branch: branchId },
  );

  await page.route("http://127.0.0.1:3101/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    if (path === "/v1/me/context") {
      return route.fulfill({
        json: {
          user: { id: "user-e2e", displayName: "Host E2E", email: null },
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
              { code: "RESERVATIONS", quantity: 1, scopeRefId: branchId },
              { code: "SEATS", quantity: 40, scopeRefId: branchId },
            ],
          },
        },
      });
    }
    if (path === `/v1/branches/${branchId}/reservations`) {
      if (request.method() === "POST") {
        createdReservation = request.postDataJSON() as Record<string, unknown>;
        return route.fulfill({
          status: 201,
          json: {
            data: {
              id: reservationId,
              tenantId,
              branchId,
              guestId,
              ...createdReservation,
              status: "PENDING",
              revision: 1,
              createdAt: "2026-07-29T18:00:00.000Z",
              updatedAt: "2026-07-29T18:00:00.000Z",
            },
          },
        });
      }
      return route.fulfill({
        json: {
          data: createdReservation
            ? [
                {
                  id: reservationId,
                  tenantId,
                  branchId,
                  guestId,
                  ...createdReservation,
                  status: "PENDING",
                  revision: 1,
                  createdAt: "2026-07-29T18:00:00.000Z",
                  updatedAt: "2026-07-29T18:00:00.000Z",
                },
              ]
            : [],
        },
      });
    }
    if (path === "/v1/guests/lookup")
      return route.fulfill({ json: { data: null } });
    if (path === "/v1/guests" && request.method() === "POST") {
      return route.fulfill({
        status: 201,
        json: { data: { id: guestId, ...request.postDataJSON() } },
      });
    }
    if (path === `/v1/guests/${guestId}`) {
      return route.fulfill({
        json: {
          data: {
            id: guestId,
            displayName: "Ada Lovelace",
            email: "ada@example.com",
          },
        },
      });
    }
    if (path === `/v1/branches/${branchId}/waitlist-entries`) {
      return route.fulfill({ json: { data: [] } });
    }
    if (path === `/v1/branches/${branchId}/availability`) {
      return route.fulfill({
        json: {
          data: {
            asOf: "2026-07-29T18:00:00.000Z",
            timezone: "America/Argentina/Buenos_Aires",
            freshness: "LIVE",
            startAt: url.searchParams.get("startAt"),
            durationMinutes: Number(url.searchParams.get("durationMinutes")),
            available: true,
            freeTableIds: ["table-e2e"],
          },
        },
      });
    }
    if (path === "/v1/salons") {
      return route.fulfill({
        json: {
          data: [
            { id: salonId, branchId, name: "Salón principal", capacity: 40 },
          ],
        },
      });
    }
    if (path === `/v1/salons/${salonId}`) {
      return route.fulfill({
        json: {
          data: {
            id: salonId,
            branchId,
            name: "Salón principal",
            capacity: 40,
            tables: [
              { id: "table-e2e", salonId, branchId, number: "1", capacity: 4 },
            ],
          },
        },
      });
    }
    if (path === `/v1/branches/${branchId}/table-statuses`) {
      return route.fulfill({
        json: {
          data: [
            { tableId: "table-e2e", status: "AVAILABLE", occupancy: null },
          ],
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
    page.getByRole("heading", { name: "Nueva reserva" }),
  ).toBeVisible();
  await page.getByPlaceholder("Nombre y apellido").fill("Ada Lovelace");
  await page.getByPlaceholder("opcional").first().fill("ada@example.com");
  await page
    .getByPlaceholder("Cumpleaños, silla alta, etc.")
    .fill("Mesa tranquila");
  await page.getByRole("button", { name: "Crear reserva" }).click();

  await expect(page.getByText("Reserva creada.")).toBeVisible();
  await expect
    .poll(() => createdReservation)
    .toMatchObject({
      partySize: 2,
      durationMinutes: 90,
      source: "HOST_APP",
      guestId,
      notes: "Mesa tranquila",
    });
  await expect(page.getByText("Ada Lovelace").first()).toBeVisible();
});
