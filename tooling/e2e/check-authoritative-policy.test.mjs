import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { inspectAuthoritativeSpecs } from "./check-authoritative-policy.mjs";

async function fixture(source) {
  const root = await mkdtemp(path.join(tmpdir(), "maitre-e2e-policy-"));
  await mkdir(path.join(root, "journeys"));
  await writeFile(path.join(root, "journeys", "mvp.spec.ts"), source);
  return path.join(root, "journeys");
}

test("authoritative policy accepts black-box Playwright actions", async () => {
  const root = await fixture(`
    import { test } from "@playwright/test";
    test("journey", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("button", { name: "Abrir" }).click();
    });
  `);
  const result = await inspectAuthoritativeSpecs(root);
  assert.deepEqual(result.violations, []);
});

test("authoritative policy rejects mocks, disabled tests and fixed sleeps", async () => {
  const root = await fixture(`
    test.skip("journey", async ({ page }) => {
      await page.route("**/v1/**", handler);
      await route.fulfill({ json: {} });
      await page.waitForTimeout(1000);
    });
  `);
  const result = await inspectAuthoritativeSpecs(root);
  assert.deepEqual(
    result.violations.map(({ code }) => code),
    [
      "disabled-test",
      "product-route-handler",
      "fulfilled-response",
      "fixed-sleep",
    ],
  );
});

test("authoritative policy also scans shared journey fixtures", async () => {
  const root = await fixture(`
    test("journey", async ({ page }) => {
      await page.goto("/");
    });
  `);
  await writeFile(
    path.join(root, "fixtures.ts"),
    `export const installMocks = (page) => page.route("**/v1/**", handler);`,
  );
  const result = await inspectAuthoritativeSpecs(root);
  assert.deepEqual(
    result.violations.map(({ code }) => code),
    ["product-route-handler"],
  );
});
