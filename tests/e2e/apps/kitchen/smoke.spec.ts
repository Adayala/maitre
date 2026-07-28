import { expect, test } from "@playwright/test";

test("@smoke muestra el acceso de Kitchen", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Maitre/);
  await expect(page.getByRole("heading", { name: "Maitre Cocina" })).toBeVisible();
});
