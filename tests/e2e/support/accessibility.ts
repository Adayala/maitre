import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

export async function expectNoSeriousAccessibilityViolations(page: Page) {
  // Axe must inspect the settled palette, not colors blended by entry animations.
  await page.addStyleTag({
    content:
      "*,*::before,*::after{animation:none!important;transition:none!important}",
  });
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const violations = results.violations.filter(
    ({ impact }) => impact === "serious" || impact === "critical",
  );

  await test.info().attach("accessibility.json", {
    body: JSON.stringify(results, null, 2),
    contentType: "application/json",
  });
  expect(violations, formatViolations(violations)).toEqual([]);
}

type Violations = Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"];

function formatViolations(violations: Violations) {
  return violations
    .map(
      ({ id, impact, help, nodes }) =>
        `${impact}: ${id} — ${help} (${nodes.length} nodes)`,
    )
    .join("\n");
}
