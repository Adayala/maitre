import { expect, test } from "@playwright/test";
import { expectNoSeriousAccessibilityViolations } from "../../support/accessibility";

test("@smoke muestra la experiencia pública de Guest", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Maitre", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Navegación del restaurante" }),
  ).toBeVisible();
  await expectNoSeriousAccessibilityViolations(page);
});
