import { expect } from "@playwright/test";
import { test } from "./fixtures.js";

test("@release-journey MVP-J-001 requires the real Cash payment capability", async ({
  api,
  apps,
  manifest,
}, testInfo) => {
  await testInfo.attach("current-product-gap", {
    body: JSON.stringify(
      {
        code: "CASH_PENDING_CHECK_PAYMENT_UI_MISSING",
        status: "BLOCKING",
        runId: manifest.runId,
        detail:
          "Cash currently exposes sessions, movements and reconciliation but no pending-check payment workflow.",
      },
      null,
      2,
    ),
    contentType: "application/json",
  });

  await test.step("all deployable applications share one ready API", async () => {
    const readiness = await api.get<{ status: string }>(
      "waiter",
      "/health/ready",
    );
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
  });

  await test.step("Cash can discover a real pending check before state mutation", async () => {
    await expect(
      apps.cash.getByRole("region", { name: "Cobros pendientes" }),
      "MVP-J-001 is blocked: Cash has no pending-check/payment surface",
    ).toBeVisible();
  });
});
