import { expect } from "@playwright/test";
import { test } from "./fixtures.js";

test("@release-journey MVP-J-001 reaches the real Cash pending-payment capability", async ({
  api,
  apps,
}) => {
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
      "MVP-J-001 requires Cash to expose pending checks before payment mutation",
    ).toBeVisible();
  });
});
