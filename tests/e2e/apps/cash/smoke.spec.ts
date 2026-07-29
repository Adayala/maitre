import { expect, test } from "@playwright/test";
import { expectNoSeriousAccessibilityViolations } from "../../support/accessibility";

test("@smoke muestra el acceso de Cash", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Maitre Caja" }),
  ).toBeVisible();
  await expectNoSeriousAccessibilityViolations(page);
});
