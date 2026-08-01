import { expect, test } from "@playwright/test";
import { expectNoSeriousAccessibilityViolations } from "../../support/accessibility";

test("@smoke muestra el acceso de Kitchen", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Maitre/);
  await expect(
    page.getByRole("heading", { name: "Maitre Cocina" }),
  ).toBeVisible();
  await expectNoSeriousAccessibilityViolations(page);
});

test("@ui-contract opera una comanda desde recibida hasta el handoff", async ({
  page,
}) => {
  const tenantId = "00000000-0000-0000-0000-000000000001";
  const branchId = "00000000-0000-0000-0000-000000000003";
  const stationId = "00000000-0000-0000-0000-000000000301";
  const commandId = "00000000-0000-0000-0000-000000000302";
  const userId = "user-kitchen-e2e";
  let status = "RECEIVED";
  let ownerActorRef: string | null = null;
  const actions: string[] = [];

  await page.addInitScript(
    ({ tenant, branch, station }) => {
      sessionStorage.setItem("maitre.kitchen.fixtureAccessToken", "e2e-token");
      localStorage.setItem("maitre.kitchen.selectedTenantId", tenant);
      localStorage.setItem("maitre.kitchen.selectedBranchId", branch);
      localStorage.setItem("maitre.kitchen.selectedStationId", station);
      localStorage.setItem("maitre.kitchen.soundEnabled", "0");
    },
    { tenant: tenantId, branch: branchId, station: stationId },
  );

  const command = () => ({
    id: commandId,
    tenantId,
    branchId,
    stationId,
    status,
    priority: 5,
    ownerActorRef,
    payload: {
      displayName: "Milanesa napolitana",
      quantity: 2,
      modifierSummary: "Sin papas",
      notes: "Una porción sin sal",
      allergenFlags: ["GLUTEN"],
    },
    receivedAt: "2026-07-29T18:00:00.000Z",
  });

  await page.route("http://127.0.0.1:3101/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;

    if (path === "/v1/me/context") {
      return route.fulfill({
        json: {
          user: { id: userId, displayName: "Cocinero E2E", email: null },
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
    if (path === `/v1/branches/${branchId}/kitchen/stations`) {
      return route.fulfill({
        json: {
          data: [
            {
              id: stationId,
              tenantId,
              branchId,
              code: "HOT",
              displayName: "Cocina caliente",
              capabilities: ["HOT"],
              status: "ACTIVE",
              displayOrder: 1,
            },
          ],
        },
      });
    }
    if (path === `/v1/subscriptions/${tenantId}/access`) {
      return route.fulfill({
        json: {
          data: {
            services: [{ code: "KITCHEN", quantity: 1, scopeRefId: branchId }],
          },
        },
      });
    }
    if (path === `/v1/kitchen/stations/${stationId}/production-queue`) {
      return route.fulfill({
        json: {
          data: {
            stationId,
            asOf: "2026-07-29T18:05:00.000Z",
            commands:
              status === "COMPLETED" || status === "CANCELLED"
                ? []
                : [command()],
          },
        },
      });
    }
    if (path === `/v1/branches/${branchId}/kitchen/alerts`) {
      return route.fulfill({ json: { data: [] } });
    }
    if (
      path.startsWith(`/v1/kitchen/commands/${commandId}/`) &&
      request.method() === "POST"
    ) {
      const action = path.split("/").at(-1)!;
      actions.push(action);
      const nextStatus: Record<string, string> = {
        claim: "CLAIMED",
        start: "IN_PROGRESS",
        "mark-ready": "READY",
        "complete-handoff": "COMPLETED",
      };
      status = nextStatus[action]!;
      if (action === "claim") ownerActorRef = userId;
      return route.fulfill({ json: { data: command() } });
    }
    return route.fulfill({
      status: 404,
      json: { title: "Fixture route not found", status: 404 },
    });
  });

  await page.goto("/");

  const card = page.getByRole("article", {
    name: /Milanesa napolitana, Nueva/,
  });
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute("data-command-id", commandId);
  await expect(card.getByText("GLUTEN")).toBeVisible();
  await expect(card.getByText("Una porción sin sal")).toBeVisible();

  await card.getByRole("button", { name: "Tomar" }).click();
  await expect(
    page.getByRole("article", { name: /Milanesa napolitana, Tomada/ }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Empezar" }).click();
  await expect(
    page.getByRole("article", {
      name: /Milanesa napolitana, En preparación/,
    }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Marcar lista" }).click();
  await expect(
    page.getByRole("article", { name: /Milanesa napolitana, Lista/ }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Entregar" }).click();
  await expect(
    page.getByRole("article", { name: /Milanesa napolitana/ }),
  ).toBeHidden();
  await expect
    .poll(() => actions)
    .toEqual(["claim", "start", "mark-ready", "complete-handoff"]);
});
