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
