import { expect, test, type Page, type Route } from "@playwright/test";
import { expectNoSeriousAccessibilityViolations } from "../../support/accessibility";

const tenantA = {
  id: "10000000-0000-0000-0000-000000000001",
  name: "Grupo Horizonte",
  branches: [
    { id: "30000000-0000-0000-0000-000000000001", code: "CTR", name: "Centro" },
  ],
};
const tenantB = {
  id: "10000000-0000-0000-0000-000000000002",
  name: "Grupo Delta",
  branches: [],
};
const brand = {
  id: "20000000-0000-0000-0000-000000000001",
  name: "Casa Norte",
  slug: "casa-norte",
  status: "ACTIVE",
  description: "Cocina urbana",
};
const branch = {
  id: tenantA.branches[0]!.id,
  brandId: brand.id,
  name: "Centro",
  code: "CTR",
  status: "ACTIVE",
  timezone: "America/Argentina/Buenos_Aires",
};
const salon = {
  id: "40000000-0000-0000-0000-000000000001",
  branchId: branch.id,
  name: "Salón principal",
  capacity: 48,
  status: "ACTIVE",
};
const employment = {
  id: "50000000-0000-0000-0000-000000000001",
  personRef: "60000000-0000-0000-0000-000000000001",
  employeeCode: "EMP-01",
  eligibleBranchIds: [branch.id],
  status: "ACTIVE",
  relationshipType: "EMPLOYEE",
};

test("exige elegir el tenant antes de habilitar la edición, incluso si hay uno", async ({
  page,
}) => {
  await installSession(page, "ffffffff-ffff-ffff-ffff-ffffffffffff");
  await mockOrganizationApi(page, { tenants: [tenantA] });
  await page.goto("/select-tenant");

  await expect(page).toHaveURL(/\/select-tenant$/);
  await expect(
    page.getByRole("heading", { name: "Elegí dónde vas a trabajar" }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem("maitre.selectedTenantId")),
    )
    .toBeNull();
  await page.getByRole("button", { name: /Grupo Horizonte/ }).click();
  await expect(page).toHaveURL(/\/organizacion$/);
  await expect(page.getByText("Trabajando en")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Cambiar tenant" }),
  ).toBeVisible();
  const primaryNavigation = page.getByRole("navigation", {
    name: "Navegación principal",
  });
  await expect(
    page.getByRole("complementary", {
      name: "Jerarquía editable de la organización",
    }),
  ).toBeVisible();
  await expect(primaryNavigation.getByText("Control operativo")).toBeVisible();
  await expect(primaryNavigation.getByText("Gobierno")).toBeVisible();
  await expect(primaryNavigation.locator('a[href="/brands"]')).toHaveCount(0);
  await expect(primaryNavigation.locator('a[href="/branches"]')).toHaveCount(0);
  await expect(primaryNavigation.locator('a[href="/users"]')).toHaveCount(0);
  await expectNoSeriousAccessibilityViolations(page);
});

test("obliga a elegir entre múltiples tenants y persiste la selección explícita", async ({
  page,
}) => {
  await installSession(page);
  await mockOrganizationApi(page, { tenants: [tenantA, tenantB] });

  await page.goto("/");
  await expect(page).toHaveURL(/\/select-tenant$/);
  await expect(
    page.getByRole("heading", { name: "Elegí dónde vas a trabajar" }),
  ).toBeVisible();
  await expect(page.getByRole("listitem")).toHaveCount(2);
  await page.getByRole("button", { name: /Grupo Horizonte/ }).click();

  await expect(page).toHaveURL(/\/organizacion$/);
  await expect(
    page.getByText("Grupo Horizonte", { exact: true }).first(),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem("maitre.selectedTenantId")),
    )
    .toBe(tenantA.id);
});

test("recorre Marca → Sucursal → Salones y Equipo con carga lazy y paneles de alta", async ({
  page,
}) => {
  await installSession(page, tenantA.id);
  const calls = await mockOrganizationApi(page, { tenants: [tenantA] });

  await page.goto("/organizacion");
  await expect(
    page.getByRole("heading", { name: "Elegí un nodo del árbol" }),
  ).toBeVisible();
  await expect.poll(() => calls.salons).toBe(0);
  await expect.poll(() => calls.employments).toBe(0);

  await page
    .getByRole("button", { name: "Centro", exact: false })
    .filter({ hasText: "Sucursal" })
    .click();
  await expect(page).toHaveURL(
    /\/organizacion\?node=branch&id=30000000-0000-0000-0000-000000000001&parentId=20000000-0000-0000-0000-000000000001$/,
  );
  await expect(
    page.getByRole("heading", { name: "Detalle de sucursal" }),
  ).toBeVisible();
  await expect(page.getByLabel("Código")).toHaveValue("CTR");

  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Detalle de sucursal" }),
  ).toBeVisible();

  await page
    .getByRole("button", { name: "Expandir salones de Centro" })
    .click();
  await expect.poll(() => calls.salons).toBe(1);
  await expect.poll(() => calls.employments).toBe(0);
  await page.getByRole("button", { name: "Expandir equipo de Centro" }).click();
  await expect.poll(() => calls.employments).toBe(1);
  await expect(
    page.getByRole("button", { name: /Salón principal/ }),
  ).toBeVisible();

  await page.getByRole("button", { name: /Equipo \/ mozos/ }).click();
  await expect(
    page.getByRole("heading", { name: "Empleados de la sucursal" }),
  ).toBeVisible();
  const assignedEmployees = page.getByRole("list", {
    name: "Empleados asignados",
  });
  await expect(assignedEmployees.getByText("Ada Operadora")).toBeVisible();
  await expect(
    page
      .getByRole("list", { name: "Empleados asignados" })
      .getByText("Administración"),
  ).toBeVisible();

  await page.getByLabel("Nombre").fill("Bruno Encargado");
  await page.getByLabel("Email").fill("bruno@example.test");
  await page.getByLabel("Código de empleado").fill("EMP-02");
  const [invitationResponse, employmentResponse] = await Promise.all([
    page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        new URL(response.url()).pathname === "/v1/users",
    ),
    page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        new URL(response.url()).pathname === "/v1/employments",
    ),
    page.getByRole("button", { name: "Invitar y asignar" }).click(),
  ]);
  expect(invitationResponse.status()).toBe(201);
  expect(employmentResponse.status()).toBe(201);
  await expect(assignedEmployees.getByText("Bruno Encargado")).toBeVisible();
  await expect(
    page.getByText("Empleado invitado y asignado correctamente.", {
      exact: true,
    }),
  ).toBeVisible();
  expect(calls.invitedUsers).toBe(1);
  expect(calls.createdEmployments).toBe(1);

  await page.getByRole("button", { name: "Crear salón en Centro" }).click();
  await expect(
    page.getByRole("heading", { name: "Nuevo salón" }),
  ).toBeVisible();
  await page.getByLabel("Nombre").fill("Patio");
  await page.getByLabel("Capacidad").fill("24");
  await page.getByRole("button", { name: "Crear salón" }).last().click();
  await expect(
    page.getByText("Salón creado correctamente.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Detalle de salón" }),
  ).toBeVisible();
  await expect.poll(() => calls.createdSalons).toBe(1);
});

test("edita marca, sucursal, salón y mozo desde el mismo árbol", async ({
  page,
}) => {
  await installSession(page, tenantA.id);
  const calls = await mockOrganizationApi(page, { tenants: [tenantA] });
  await page.goto("/organizacion");
  const tree = page.getByRole("complementary", {
    name: "Jerarquía editable de la organización",
  });

  await tree
    .getByRole("button", { name: "Marca Casa Norte", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Detalle de marca" }),
  ).toBeVisible();
  await page.getByLabel("Nombre", { exact: true }).first().fill("Casa Sur");
  await page.getByRole("button", { name: "Guardar cambios" }).first().click();
  await expect.poll(() => calls.updatedBrands).toBe(1);
  await expect(tree.getByText("Casa Sur", { exact: true })).toBeVisible();

  await tree
    .getByRole("button", { name: "Centro", exact: false })
    .filter({ hasText: "Sucursal" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Detalle de sucursal" }),
  ).toBeVisible();
  await page.getByLabel("Nombre", { exact: true }).fill("Centro Norte");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect.poll(() => calls.updatedBranches).toBe(1);
  await expect(tree.getByText("Centro Norte", { exact: true })).toBeVisible();

  await tree
    .getByRole("button", { name: "Expandir salones de Centro Norte" })
    .click();
  await tree.getByRole("button", { name: /Salón principal/ }).click();
  const salonName = page.getByLabel("Nombre", { exact: true });
  await expect(salonName).toHaveValue("Salón principal");
  await salonName.fill("Salón Azul");
  await page.getByLabel("Capacidad").fill("56");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect.poll(() => calls.updatedSalons).toBe(1);
  await expect(tree.getByText("Salón Azul", { exact: true })).toBeVisible();

  await tree
    .getByRole("button", { name: "Expandir equipo de Centro Norte" })
    .click();
  await tree.getByRole("button", { name: /Ada Operadora/ }).click();
  await expect(
    page.getByRole("heading", { name: "Ada Operadora" }),
  ).toBeVisible();
  await page.getByLabel("Perfil operativo").selectOption("role_waiter");
  await page.getByLabel("Código de empleado").fill("MOZO-01");
  await page.getByLabel("Tipo de relación").selectOption("EMPLOYEE");
  await page.getByLabel("Estado laboral").selectOption("ACTIVE");
  await page.getByRole("button", { name: "Guardar persona" }).click();
  await expect(
    page.getByText("Persona y relación laboral actualizadas correctamente."),
  ).toBeVisible();
  expect(calls.updatedEmployments).toBe(1);
  expect(calls.updatedUsers).toBe(1);
});

test("cubre loading, retry, estado vacío, validación y error de mutación", async ({
  page,
}) => {
  await installSession(page, tenantA.id);
  let failBrands = true;
  await mockOrganizationApi(page, {
    tenants: [tenantA],
    brands: [],
    delayBrands: true,
    shouldFailBrands: () => failBrands,
  });

  await page.goto("/organizacion");
  await expect(page.getByText("Cargando…", { exact: true })).toBeVisible();
  await expect(page.getByRole("alert")).toContainText(
    "No se pudo cargar marcas",
  );
  failBrands = false;
  await page.getByRole("button", { name: "Reintentar" }).click();
  await expect(
    page.getByText("No hay marcas. Usá “+” para crear la primera."),
  ).toBeVisible();

  await page.getByRole("button", { name: "Crear marca" }).click();
  const name = page.getByLabel("Nombre");
  await page.getByRole("button", { name: "Crear marca" }).last().click();
  await expect
    .poll(() => name.evaluate((input) => input.validity.valid))
    .toBe(false);
  await name.fill("Marca fallida");
  await page.getByLabel("Descripción").fill("Error determinista");
  await page.getByRole("button", { name: "Crear marca" }).last().click();
  await expect(page.getByRole("alert")).toContainText(
    "No se pudo crear la marca",
  );
});

test("reintenta una asignación fallida sin duplicar la invitación", async ({
  page,
}) => {
  await installSession(page, tenantA.id);
  const calls = await mockOrganizationApi(page, {
    tenants: [tenantA],
    failFirstEmployment: true,
  });
  await page.goto("/organizacion");
  await page.getByRole("button", { name: /Equipo \/ mozos/ }).click();

  await page.getByLabel("Nombre").fill("Cora Temporal");
  await page.getByLabel("Email").fill("cora@example.test");
  await page.getByLabel("Código de empleado").fill("TEMP-03");
  await page.getByLabel("Relación").selectOption("TEMPORARY");
  await page.getByRole("button", { name: "Invitar y asignar" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "La invitación fue creada, pero no se pudo asignar la sucursal",
  );

  await page.getByRole("button", { name: "Reintentar asignación" }).click();
  await expect(
    page
      .getByRole("list", { name: "Empleados asignados" })
      .getByText("Cora Temporal"),
  ).toBeVisible();
  expect(calls.invitedUsers).toBe(1);
  expect(calls.employmentAttempts).toBe(2);
  expect(calls.createdEmployments).toBe(1);
});

test("mantiene el explorer usable y accesible en viewport mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await installSession(page, tenantA.id);
  await mockOrganizationApi(page, { tenants: [tenantA] });
  await page.goto("/organizacion");

  const tree = page.getByRole("complementary", {
    name: "Jerarquía editable de la organización",
  });
  const detail = page.getByRole("heading", { name: "Elegí un nodo del árbol" });
  await expect(tree).toBeVisible();
  await expect(detail).toBeVisible();
  const treeBox = await tree.boundingBox();
  const detailBox = await detail.boundingBox();
  expect(treeBox).not.toBeNull();
  expect(detailBox).not.toBeNull();
  expect(detailBox!.y).toBeGreaterThan(treeBox!.y);
  await expectNoSeriousAccessibilityViolations(page);
});

async function installSession(page: Page, selectedTenantId?: string) {
  await page.addInitScript(
    ({ tenantId }) => {
      sessionStorage.setItem("maitre.fixtureAccessToken", "e2e-token");
      if (tenantId) localStorage.setItem("maitre.selectedTenantId", tenantId);
      else localStorage.removeItem("maitre.selectedTenantId");
    },
    { tenantId: selectedTenantId },
  );
}

async function mockOrganizationApi(
  page: Page,
  options: {
    tenants: (typeof tenantA)[];
    brands?: (typeof brand)[];
    delayBrands?: boolean;
    shouldFailBrands?: () => boolean;
    failFirstEmployment?: boolean;
  },
) {
  const calls = {
    salons: 0,
    employments: 0,
    createdSalons: 0,
    invitedUsers: 0,
    employmentAttempts: 0,
    createdEmployments: 0,
    updatedBrands: 0,
    updatedBranches: 0,
    updatedSalons: 0,
    updatedEmployments: 0,
    updatedUsers: 0,
  };
  const brandRecords = (options.brands ?? [brand]).map((item) => ({ ...item }));
  const branchRecord = { ...branch };
  const salons = [{ ...salon }];
  const employmentRecords = [{ ...employment }];
  const users = [
    {
      id: employment.personRef,
      email: "ada@example.test",
      name: "Ada Operadora",
      status: "ACTIVE",
      roleIds: ["role_admin"],
    },
  ];
  await page.route("**/v1/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();
    if (path === "/v1/me/context")
      return json(route, {
        user: {
          id: "user-owner",
          displayName: "Owner E2E",
          email: "owner@example.test",
        },
        tenants: options.tenants,
      });
    if (path === "/v1/brands" && method === "GET") {
      if (options.delayBrands)
        await new Promise((resolve) => setTimeout(resolve, 250));
      if (options.shouldFailBrands?.())
        return json(
          route,
          { title: "No se pudo cargar marcas", type: "about:blank" },
          500,
        );
      return json(route, { data: brandRecords });
    }
    if (path === "/v1/branches" && method === "GET")
      return json(route, {
        data: brandRecords.length === 0 ? [] : [branchRecord],
      });
    if (path === `/v1/brands/${brand.id}` && method === "GET")
      return json(route, { data: brandRecords[0] });
    if (path === `/v1/brands/${brand.id}/presentation` && method === "GET")
      return json(route, {
        data: { draft: null, published: null, history: [] },
      });
    if (path === `/v1/brands/${brand.id}` && method === "PATCH") {
      calls.updatedBrands += 1;
      Object.assign(brandRecords[0]!, request.postDataJSON());
      return json(route, { data: brandRecords[0] });
    }
    if (path === `/v1/branches/${branch.id}` && method === "GET")
      return json(route, { data: branchRecord });
    if (path === `/v1/branches/${branch.id}` && method === "PATCH") {
      calls.updatedBranches += 1;
      Object.assign(branchRecord, request.postDataJSON());
      return json(route, { data: branchRecord });
    }
    if (path === "/v1/salons" && method === "GET") {
      calls.salons += 1;
      return json(route, { data: salons });
    }
    if (path.startsWith("/v1/salons/") && method === "GET") {
      const requestedSalon = salons.find(
        (item) => path === `/v1/salons/${item.id}`,
      );
      return requestedSalon
        ? json(route, { data: requestedSalon })
        : json(route, { title: "Salón inexistente", type: "about:blank" }, 404);
    }
    if (path.startsWith("/v1/salons/") && method === "PATCH") {
      calls.updatedSalons += 1;
      const requestedSalon = salons.find(
        (item) => path === `/v1/salons/${item.id}`,
      );
      if (!requestedSalon)
        return json(
          route,
          { title: "Salón inexistente", type: "about:blank" },
          404,
        );
      Object.assign(requestedSalon, request.postDataJSON());
      return json(route, { data: requestedSalon });
    }
    if (path === `/v1/branches/${branch.id}/employments`) {
      calls.employments += 1;
      return json(route, { data: employmentRecords });
    }
    if (path === "/v1/users" && method === "GET")
      return json(route, { data: users });
    if (path === "/v1/users" && method === "POST") {
      calls.invitedUsers += 1;
      const body = request.postDataJSON() as {
        email: string;
        name: string;
        roleIds: string[];
      };
      const created = {
        id: `60000000-0000-0000-0000-${String(calls.invitedUsers + 100).padStart(12, "0")}`,
        email: body.email,
        name: body.name,
        status: "INVITED",
        roleIds: body.roleIds,
      };
      users.push(created);
      return json(route, { data: created }, 201);
    }
    if (path.startsWith("/v1/users/") && method === "PATCH") {
      calls.updatedUsers += 1;
      const requestedUser = users.find(
        (user) => path === `/v1/users/${user.id}`,
      );
      if (!requestedUser)
        return json(
          route,
          { title: "Usuario inexistente", type: "about:blank" },
          404,
        );
      const body = request.postDataJSON() as {
        roleIds?: string[];
        membershipStatus?: string;
      };
      if (body.roleIds) requestedUser.roleIds = body.roleIds;
      if (body.membershipStatus) requestedUser.status = body.membershipStatus;
      return json(route, { data: requestedUser });
    }
    if (path.startsWith("/v1/employments/") && method === "GET") {
      const requestedEmployment = employmentRecords.find(
        (item) => path === `/v1/employments/${item.id}`,
      );
      return requestedEmployment
        ? json(route, { data: requestedEmployment })
        : json(
            route,
            { title: "Relación inexistente", type: "about:blank" },
            404,
          );
    }
    if (path.startsWith("/v1/employments/") && method === "PATCH") {
      calls.updatedEmployments += 1;
      const requestedEmployment = employmentRecords.find(
        (item) => path === `/v1/employments/${item.id}`,
      );
      if (!requestedEmployment)
        return json(
          route,
          { title: "Relación inexistente", type: "about:blank" },
          404,
        );
      Object.assign(requestedEmployment, request.postDataJSON());
      return json(route, { data: requestedEmployment });
    }
    if (path === "/v1/employments" && method === "POST") {
      calls.employmentAttempts += 1;
      if (options.failFirstEmployment && calls.employmentAttempts === 1) {
        return json(
          route,
          { title: "No se pudo asignar la sucursal", type: "about:blank" },
          500,
        );
      }
      const body = request.postDataJSON() as Omit<typeof employment, "id">;
      expect(body.eligibleBranchIds).toEqual([branch.id]);
      const created = {
        ...body,
        id: `50000000-0000-0000-0000-${String(calls.employmentAttempts + 1).padStart(12, "0")}`,
      };
      employmentRecords.push(created);
      calls.createdEmployments += 1;
      return json(route, { data: created }, 201);
    }
    if (path === "/v1/roles")
      return json(route, {
        data: [
          { id: "role_admin", name: "Administración" },
          { id: "role_waiter", name: "Mozo" },
        ],
      });
    if (path === "/v1/salons" && method === "POST") {
      calls.createdSalons += 1;
      const body = request.postDataJSON() as {
        name: string;
        capacity: number;
        branchId: string;
      };
      const created = {
        ...salon,
        id: "40000000-0000-0000-0000-000000000099",
        ...body,
      };
      salons.push(created);
      return json(route, { data: created }, 201);
    }
    if (path === "/v1/brands" && method === "POST")
      return json(
        route,
        { title: "No se pudo crear la marca", type: "about:blank" },
        500,
      );
    return json(
      route,
      { title: `Mock faltante: ${method} ${path}`, type: "about:blank" },
      404,
    );
  });
  return calls;
}

async function json(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}
