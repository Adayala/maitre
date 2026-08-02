import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, type TestInfo } from "@playwright/test";
import { tokenForRole } from "../../../tooling/e2e/run-manifest.mjs";
import type { ApiEvidence } from "./api-client.js";
import { test } from "./fixtures.js";

interface ApiData<T> {
  data: T;
}

interface Entity {
  id: string;
  name: string;
}

interface UserRecord {
  id: string;
  name: string;
  roleIds: string[];
}

interface Employment {
  id: string;
  personRef: string;
  employeeCode: string;
}

test("@release-journey MVP-J-003 configures a tenant and exposes the same operation across Dash, Host, and Floor", async ({
  api,
  apps,
  manifest,
}, testInfo) => {
  test.setTimeout(Number(process.env["E2E_JOURNEY_TIMEOUT_MS"] ?? 240_000));
  const suffix = `${manifest.runId.slice(-6)}-${Date.now()}`;
  const evidence: Record<string, unknown> = {};

  const tenant = await api.mutate<ApiData<Entity>>(
    "auditor",
    "POST",
    "/v1/tenants",
    {
      name: `Tenant operativo ${suffix}`,
      defaultLocale: "es-AR",
      defaultCurrency: "ARS",
      defaultTimezone: "America/Argentina/Buenos_Aires",
      contactEmail: `tenant-${suffix}@example.test`,
    },
  );
  assertStatus(tenant, 201);
  const context = { tenantId: tenant.body.data.id };

  const brand = await api.mutate<ApiData<Entity>>(
    "auditor",
    "POST",
    "/v1/brands",
    {
      name: `Marca operativa ${suffix}`,
      description: "Marca blanca configurada por el journey multi-app",
      config: { language: "es", currency: "ARS" },
    },
    context,
  );
  assertStatus(brand, 201);
  const branch = await api.mutate<ApiData<Entity>>(
    "auditor",
    "POST",
    "/v1/branches",
    {
      brandId: brand.body.data.id,
      name: `Sucursal Centro ${suffix}`,
      code: `C${Date.now().toString().slice(-7)}`,
      timezone: "America/Argentina/Buenos_Aires",
    },
    context,
  );
  assertStatus(branch, 201);
  const branchContext = { ...context, branchId: branch.body.data.id };
  const subscriptionItems = [
    { catalogItemCode: "CORE" },
    { catalogItemCode: "BRANCHES", quantity: 1 },
    { catalogItemCode: "FLOOR", scopeRefId: branch.body.data.id },
    {
      catalogItemCode: "SEATS",
      quantity: 1,
      scopeRefId: branch.body.data.id,
    },
    {
      catalogItemCode: "WAITERS",
      quantity: 1,
      scopeRefId: branch.body.data.id,
    },
    { catalogItemCode: "RESERVATIONS", scopeRefId: branch.body.data.id },
  ];
  for (const item of subscriptionItems) {
    const contracted = await api.mutate(
      "auditor",
      "POST",
      `/v1/subscriptions/${tenant.body.data.id}/items`,
      item,
      branchContext,
    );
    assertStatus(contracted, 201);
  }
  const salon = await api.mutate<ApiData<Entity>>(
    "auditor",
    "POST",
    "/v1/salons",
    {
      branchId: branch.body.data.id,
      name: `Salón Principal ${suffix}`,
      capacity: 40,
    },
    branchContext,
  );
  assertStatus(salon, 201);
  const table = await api.mutate<ApiData<Entity>>(
    "auditor",
    "POST",
    "/v1/tables",
    {
      salonId: salon.body.data.id,
      number: "01",
      name: `Mesa Ventana ${suffix}`,
      capacity: 4,
    },
    branchContext,
  );
  assertStatus(table, 201);

  const staffDefinitions = [
    { name: `Maitre ${suffix}`, roleId: "role_maitre", code: `M-${suffix}` },
    { name: `Mozo ${suffix}`, roleId: "role_waiter", code: `W-${suffix}` },
    { name: `Cajero ${suffix}`, roleId: "role_cashier", code: `C-${suffix}` },
  ];
  const staff: Array<{ user: UserRecord; employment: Employment }> = [];
  for (const definition of staffDefinitions) {
    const user = await api.mutate<ApiData<UserRecord>>(
      "auditor",
      "POST",
      "/v1/users",
      {
        email: `${definition.roleId.slice(5)}-${suffix}@example.test`,
        name: definition.name,
        roleIds: [definition.roleId],
      },
      branchContext,
    );
    assertStatus(user, 201);
    const employment = await api.mutate<ApiData<Employment>>(
      "auditor",
      "POST",
      "/v1/employments",
      {
        personRef: user.body.data.id,
        employeeCode: definition.code,
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: [branch.body.data.id],
        status: "ACTIVE",
        validFrom: manifest.businessClock,
      },
      branchContext,
    );
    assertStatus(employment, 201);
    staff.push({ user: user.body.data, employment: employment.body.data });
  }

  const period = await api.mutate<ApiData<Entity>>(
    "auditor",
    "POST",
    `/v1/branches/${branch.body.data.id}/service-periods`,
    {
      businessDate: manifest.businessClock.slice(0, 10),
      name: `Cena ${suffix}`,
      type: "DINNER",
    },
    branchContext,
  );
  assertStatus(period, 201);
  const opened = await api.mutate<ApiData<Entity>>(
    "auditor",
    "POST",
    `/v1/service-periods/${period.body.data.id}/open`,
    {},
    branchContext,
  );
  assertStatus(opened);
  const waiter = staff.find((item) =>
    item.user.roleIds.includes("role_waiter"),
  )!;
  const plaza = await api.mutate<ApiData<Entity>>(
    "auditor",
    "POST",
    "/v1/plazas",
    {
      salonId: salon.body.data.id,
      servicePeriodId: period.body.data.id,
      name: `Plaza Ventana ${suffix}`,
      mode: "FIXED",
      waiterEmploymentId: waiter.employment.id,
      tableIds: [table.body.data.id],
    },
    branchContext,
  );
  assertStatus(plaza, 201);
  evidence.configuration = {
    tenant: tenant.body.data,
    brand: brand.body.data,
    branch: branch.body.data,
    salon: salon.body.data,
    table: table.body.data,
    staff,
    period: opened.body.data,
    plaza: plaza.body.data,
    subscriptionItems,
  };

  await test.step("Dash reads the configured hierarchy and staff", async () => {
    await selectApplicationContext(apps.dash, "maitre.fixtureAccessToken", {
      "maitre.selectedTenantId": tenant.body.data.id,
    });
    await apps.dash.goto(
      new URL("/organizacion", manifest.applications.dash).toString(),
    );
    await expect(
      apps.dash.getByText(brand.body.data.name, { exact: true }),
    ).toBeVisible();
    await expect(
      apps.dash.getByText(branch.body.data.name, { exact: true }),
    ).toBeVisible();
    const users = await api.get<{ data: UserRecord[] }>(
      "auditor",
      "/v1/users",
      branchContext,
    );
    assertStatus(users);
    expect(users.body.data).toEqual(
      expect.arrayContaining(
        staff.map(({ user }) => expect.objectContaining({ id: user.id })),
      ),
    );
  });

  await test.step("Host reads the active service and waiter plaza", async () => {
    await selectApplicationContext(
      apps.host,
      "maitre.host.fixtureAccessToken",
      {
        "maitre.host.selectedTenantId": tenant.body.data.id,
        "maitre.host.selectedBranchId": branch.body.data.id,
      },
    );
    await expect(
      apps.host.getByRole("heading", { name: opened.body.data.name }),
    ).toBeVisible();
    await expect(
      apps.host.getByText(plaza.body.data.name, { exact: true }),
    ).toBeVisible();
  });

  await test.step("Floor reads the same salon, table, and plaza", async () => {
    await selectApplicationContext(
      apps.floor,
      "maitre.waiter.fixtureAccessToken",
      {
        "maitre.waiter.selectedTenantId": tenant.body.data.id,
        "maitre.waiter.selectedBranchId": branch.body.data.id,
      },
    );
    await expect(
      apps.floor.locator(`[data-table-id="${table.body.data.id}"]`),
    ).toContainText("01");
    await expect(
      apps.floor.getByRole("heading", {
        name: `Otra plaza · ${plaza.body.data.name}`,
      }),
    ).toBeVisible();
  });

  for (const page of [apps.dash, apps.host, apps.floor]) {
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.filter((item) =>
        ["serious", "critical"].includes(item.impact ?? ""),
      ),
    ).toEqual([]);
  }
  await attachEvidence(testInfo, evidence);
});

async function selectApplicationContext(
  page: Page,
  tokenKey: string,
  localValues: Record<string, string>,
) {
  await page.evaluate(
    ({ key, token, values }) => {
      sessionStorage.setItem(key, token);
      for (const [name, value] of Object.entries(values))
        localStorage.setItem(name, value);
    },
    { key: tokenKey, token: tokenForRole("auditor"), values: localValues },
  );
  await page.reload();
}

function assertStatus(evidence: ApiEvidence<unknown>, status = 200) {
  expect(evidence.status).toBe(status);
}

async function attachEvidence(
  testInfo: TestInfo,
  evidence: Record<string, unknown>,
) {
  await testInfo.attach("mvp-j-003-evidence", {
    body: JSON.stringify(evidence, null, 2),
    contentType: "application/json",
  });
}
