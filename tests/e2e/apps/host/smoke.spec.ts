import { expect, test } from "@playwright/test";

test("@smoke muestra el acceso de Host", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Maitre/);
  await expect(page.getByRole("heading", { name: "Maitre Host" })).toBeVisible();
});
