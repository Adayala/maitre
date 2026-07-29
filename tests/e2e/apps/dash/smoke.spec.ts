import { expect, test } from "@playwright/test";
import { expectNoSeriousAccessibilityViolations } from "../../support/accessibility";

test("@smoke muestra el acceso de Dash", async ({ page }) => {
  await page.goto("/login");
  await expect(page).toHaveTitle(/Maitre/);
  await expect(
    page.getByRole("heading", { name: "Entrá al centro operativo" }),
  ).toBeVisible();
  await expectNoSeriousAccessibilityViolations(page);
});
