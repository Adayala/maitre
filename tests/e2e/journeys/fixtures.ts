import {
  test as base,
  type Browser,
  type BrowserContext,
  type Page,
} from "@playwright/test";
import {
  createRunManifest,
  tokenForRole,
  type E2ERunManifest,
} from "../../../tooling/e2e/run-manifest.mjs";
import { JourneyApiClient } from "./api-client.js";

const TENANT_ID = "00000000-0000-0000-0000-000000000001";
const BRANCH_ID = "00000000-0000-0000-0000-000000000003";

interface ApplicationPages {
  floor: Page;
  kitchen: Page;
  cash: Page;
}

interface JourneyFixtures {
  manifest: E2ERunManifest;
  api: JourneyApiClient;
  apps: ApplicationPages;
}

export const test = base.extend<JourneyFixtures>({
  manifest: async ({ browserName: _browserName }, use, testInfo) => {
    const manifest = createRunManifest();
    await testInfo.attach("e2e-run-manifest", {
      body: JSON.stringify(manifest, null, 2),
      contentType: "application/json",
    });
    await use(manifest);
  },

  api: async ({ request, manifest }, use) => {
    await use(new JourneyApiClient(request, manifest));
  },

  apps: async ({ browser, manifest }, use, testInfo) => {
    const diagnostics: Array<Record<string, unknown>> = [];
    const resources = await Promise.all([
      applicationPage(browser, "floor", manifest, diagnostics),
      applicationPage(browser, "kitchen", manifest, diagnostics),
      applicationPage(browser, "cash", manifest, diagnostics),
    ]);
    const apps = {
      floor: resources[0].page,
      kitchen: resources[1].page,
      cash: resources[2].page,
    };

    await use(apps);

    if (diagnostics.length > 0 || testInfo.status !== testInfo.expectedStatus) {
      await testInfo.attach("journey-diagnostics", {
        body: JSON.stringify(diagnostics, null, 2),
        contentType: "application/json",
      });
    }
    await Promise.all(resources.map(({ context }) => context.close()));
  },
});

async function applicationPage(
  browser: Browser,
  application: keyof ApplicationPages,
  manifest: E2ERunManifest,
  diagnostics: Array<Record<string, unknown>>,
): Promise<{ context: BrowserContext; page: Page }> {
  const configuration = {
    floor: {
      tokenKey: "maitre.waiter.fixtureAccessToken",
      token: tokenForRole("waiter"),
      localValues: {
        "maitre.waiter.selectedTenantId": TENANT_ID,
        "maitre.waiter.selectedBranchId": BRANCH_ID,
      },
    },
    kitchen: {
      tokenKey: "maitre.kitchen.fixtureAccessToken",
      token: tokenForRole("cook"),
      localValues: {
        "maitre.kitchen.selectedTenantId": TENANT_ID,
        "maitre.kitchen.selectedBranchId": BRANCH_ID,
        "maitre.kitchen.selectedStationId":
          "00000000-0000-0000-0000-00000000000d",
        "maitre.kitchen.soundEnabled": "0",
      },
    },
    cash: {
      tokenKey: "maitre.cashier.fixtureAccessToken",
      token: tokenForRole("cashier"),
      localValues: {
        "maitre.cashier.selectedTenantId": TENANT_ID,
        "maitre.cashier.selectedBranchId": BRANCH_ID,
        "maitre.cashier.selectedRegisterId":
          "00000000-0000-0000-0000-00000000000e",
      },
    },
  }[application];

  const context = await browser.newContext({
    locale: "es-AR",
    timezoneId: "America/Argentina/Buenos_Aires",
  });
  await context.addInitScript(({ tokenKey, token, localValues }) => {
    sessionStorage.setItem(tokenKey, token);
    for (const [key, value] of Object.entries(localValues)) {
      localStorage.setItem(key, value);
    }
  }, configuration);
  const page = await context.newPage();
  page.on("console", (message) => {
    if (message.type() === "error") {
      diagnostics.push({
        application,
        kind: "console",
        message: message.text(),
      });
    }
  });
  page.on("pageerror", (error) => {
    diagnostics.push({
      application,
      kind: "pageerror",
      name: error.name,
      message: error.message,
    });
  });
  page.on("response", (response) => {
    if (
      response.status() >= 500 &&
      response.url().startsWith(manifest.apiBaseUrl)
    ) {
      diagnostics.push({
        application,
        kind: "network",
        method: response.request().method(),
        path: new URL(response.url()).pathname,
        status: response.status(),
        correlationId: response.headers()["x-correlation-id"] ?? null,
      });
    }
  });
  await page.goto(manifest.applications[application]);
  return { context, page };
}
