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
const secondBranch = {
  id: "30000000-0000-0000-0000-000000000002",
  brandId: brand.id,
  name: "Palermo",
  code: "PAL",
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
const servicePeriod = {
  id: "70000000-0000-0000-0000-000000000001",
  branchId: branch.id,
  businessDate: "2026-08-01",
  name: "Cena",
  type: "DINNER" as const,
  actualOpen: "2026-08-01T20:00:00.000Z",
  actualClose: null,
  status: "OPEN" as const,
};
const table = {
  id: "80000000-0000-0000-0000-000000000001",
  branchId: branch.id,
  salonId: salon.id,
  number: "1",
  name: "Ventana",
  capacity: 4,
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

test("contrae el panel global, conserva todos los destinos y persiste la preferencia", async ({
  page,
}) => {
  await installSession(page, tenantA.id);
  await mockOrganizationApi(page, { tenants: [tenantA] });
  await page.goto("/organizacion");

  const shell = page.locator(".dash-shell");
  const navigation = page.getByRole("navigation", {
    name: "Navegación principal",
  });
  const collapse = navigation.getByRole("button", {
    name: "Contraer panel",
  });
  await expect(collapse).toHaveAttribute("aria-expanded", "true");
  await expect
    .poll(() =>
      navigation.evaluate((element) => element.getBoundingClientRect().width),
    )
    .toBeGreaterThan(250);

  const typography = await page
    .getByRole("heading", { name: "Organización", exact: true })
    .evaluate((heading) => {
      const headingStyle = getComputedStyle(heading);
      const navigationLabel = document.querySelector(".dash-nav__item-label");
      const navigationStyle = navigationLabel
        ? getComputedStyle(navigationLabel)
        : null;
      return {
        headingSize: Number.parseFloat(headingStyle.fontSize),
        headingWeight: Number.parseInt(headingStyle.fontWeight, 10),
        navigationSize: navigationStyle
          ? Number.parseFloat(navigationStyle.fontSize)
          : 0,
      };
    });
  expect(typography.headingSize).toBeGreaterThan(typography.navigationSize * 2);
  expect(typography.headingSize).toBeLessThanOrEqual(52);
  expect(typography.headingWeight).toBeGreaterThanOrEqual(700);

  await collapse.click();
  await expect(shell).toHaveClass(/dash-shell--nav-collapsed/);
  const expand = navigation.getByRole("button", { name: "Expandir panel" });
  await expect(expand).toHaveAttribute("aria-expanded", "false");
  await expect
    .poll(() =>
      navigation.evaluate((element) => element.getBoundingClientRect().width),
    )
    .toBeLessThanOrEqual(90);
  await expect(
    navigation.getByRole("link", { name: "Organización" }),
  ).toBeVisible();
  await expect(
    navigation.getByRole("link", { name: "Overview" }),
  ).toBeVisible();
  await expect(
    navigation.getByRole("link", { name: "Configuración" }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() =>
        localStorage.getItem("maitre.dashboardSidebar.preference"),
      ),
    )
    .toBe("collapsed");

  await page.reload();
  await expect(
    page
      .getByRole("navigation", { name: "Navegación principal" })
      .getByRole("button", { name: "Expandir panel" }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Navegación principal" })
    .getByRole("button", { name: "Expandir panel" })
    .click();
  await expect
    .poll(() =>
      page.evaluate(() =>
        localStorage.getItem("maitre.dashboardSidebar.preference"),
      ),
    )
    .toBe("expanded");
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

test("cambia de tenant sin trasladar la marca guardada del tenant anterior", async ({
  page,
}) => {
  await installSession(page, tenantA.id);
  await page.addInitScript(
    ({ firstTenantId, secondTenantId, brandId }) => {
      localStorage.setItem(`maitre.selectedBrandId.${firstTenantId}`, brandId);
      localStorage.removeItem(`maitre.selectedBrandId.${secondTenantId}`);
    },
    {
      firstTenantId: tenantA.id,
      secondTenantId: tenantB.id,
      brandId: brand.id,
    },
  );
  const calls = await mockOrganizationApi(page, {
    tenants: [tenantA, tenantB],
  });

  await page.goto("/organizacion");
  await expect(page.getByLabel("Apariencia activa")).toContainText(
    "Casa Norte",
  );
  await expect
    .poll(() => calls.effectivePresentationTenantIds.includes(tenantA.id))
    .toBe(true);

  await page.getByRole("link", { name: "Cambiar tenant" }).click();
  await page.getByRole("button", { name: /Grupo Delta/ }).click();

  await expect(page).toHaveURL(/\/organizacion$/);
  await expect(page.getByLabel("Apariencia activa")).toContainText(
    "Maitre base",
  );
  await page.waitForLoadState("networkidle");
  expect(calls.effectivePresentationTenantIds).not.toContain(tenantB.id);
  await expect
    .poll(() =>
      page.evaluate(
        (tenantId) =>
          localStorage.getItem(`maitre.selectedBrandId.${tenantId}`),
        tenantB.id,
      ),
    )
    .toBeNull();
});

test("recorre estructura física, operación y equipo con carga lazy y paneles de alta", async ({
  page,
}) => {
  await installSession(page, tenantA.id);
  const calls = await mockOrganizationApi(page, { tenants: [tenantA] });

  await page.goto("/organizacion");
  await expect(
    page.getByRole("heading", { name: "Elegí un nodo del árbol" }),
  ).toBeVisible();
  await expect.poll(() => calls.salons).toBeGreaterThan(0);
  await expect.poll(() => calls.employments).toBe(0);
  await expect(
    page
      .locator(".org-tree__group-button")
      .filter({ hasText: "Estructura física" }),
  ).toContainText("1 salón");

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
    .getByRole("button", { name: "Expandir estructura física de Centro" })
    .click();
  await expect.poll(() => calls.salons).toBeGreaterThan(0);
  await expect.poll(() => calls.employments).toBe(0);
  await page.getByRole("button", { name: "Expandir equipo de Centro" }).click();
  await expect.poll(() => calls.employments).toBe(1);
  await expect(
    page
      .locator(".org-tree__group-button")
      .filter({ hasText: "Salón principal" }),
  ).toBeVisible();

  await page
    .locator(".org-tree__group-button")
    .filter({ hasText: "Equipo" })
    .click();
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
  await expect(
    page.getByText("Marca: Casa Norte · Sucursal: Centro"),
  ).toBeVisible();
  await expect.poll(() => calls.createdSalons).toBe(1);
});

test("actualiza el panel al expandir otra sucursal y elimina acciones del salón anterior", async ({
  page,
}) => {
  await installSession(page, tenantA.id);
  await mockOrganizationApi(page, {
    tenants: [tenantA],
    branches: [branch, secondBranch],
  });

  await page.goto(
    `/organizacion?node=salon&id=${salon.id}&parentId=${branch.id}`,
  );
  await expect(
    page.getByRole("heading", { name: "Detalle de salón" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Desactivar" })).toBeVisible();

  await page
    .getByRole("button", { name: "Expandir estructura física de Palermo" })
    .click();

  await expect(page).toHaveURL(
    new RegExp(
      `/organizacion\\?node=branch&id=${secondBranch.id}&parentId=${brand.id}$`,
    ),
  );
  await expect(
    page.getByRole("heading", { name: "Detalle de sucursal" }),
  ).toBeVisible();
  await expect(page.getByLabel("Código")).toHaveValue("PAL");
  await expect(page.getByRole("button", { name: "Desactivar" })).toHaveCount(0);

  await page.reload();
  await expect(page.getByLabel("Código")).toHaveValue("PAL");
  await expectNoSeriousAccessibilityViolations(page);
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
    .getByRole("button", {
      name: "Expandir estructura física de Centro Norte",
    })
    .click();
  await tree
    .locator(".org-tree__group-button")
    .filter({ hasText: "Salón principal" })
    .click();
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

test("separa Salón → Mesas de Jornada → Plaza y aplica la marca elegida", async ({
  page,
}) => {
  await installSession(page, tenantA.id);
  const calls = await mockOrganizationApi(page, { tenants: [tenantA] });
  await page.goto("/organizacion");

  await expect(page.getByLabel("Apariencia activa")).toContainText(
    "Maitre base",
  );
  const platformHeading = await page
    .getByRole("heading", { name: "Organización", exact: true })
    .evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        family: style.fontFamily,
        size: Number.parseFloat(style.fontSize),
        weight: Number.parseInt(style.fontWeight, 10),
      };
    });
  expect(platformHeading.family).not.toMatch(/Georgia|Times New Roman/i);
  expect(platformHeading.size).toBeLessThanOrEqual(58);
  expect(platformHeading.weight).toBeGreaterThanOrEqual(600);
  await expect
    .poll(() =>
      page
        .locator(".org-explorer__workspace")
        .evaluate((element) =>
          Number.parseFloat(getComputedStyle(element).borderRadius),
        ),
    )
    .toBeGreaterThanOrEqual(18);

  await expect
    .poll(() =>
      page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue("--brand-primary")
          .trim(),
      ),
    )
    .toBe("#5B5CE2");
  await page
    .getByRole("button", { name: "Marca Casa Norte", exact: true })
    .click();
  await expect
    .poll(() =>
      page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue("--brand-primary")
          .trim(),
      ),
    )
    .toBe("#7C3AED");
  await expect(page.getByLabel("Apariencia activa")).toContainText(
    "Casa Norte",
  );
  await expect.poll(() => calls.brandDetails).toBe(0);
  await expect.poll(() => calls.brandPresentations).toBe(1);
  await expect.poll(() => calls.effectivePresentations).toBe(1);
  await expect
    .poll(() =>
      page
        .getByRole("heading", { name: "Organización", exact: true })
        .evaluate((element) => getComputedStyle(element).fontFamily),
    )
    .toMatch(/Trebuchet MS/i);
  await expect
    .poll(() =>
      page.evaluate(
        (tenantId) =>
          localStorage.getItem(`maitre.selectedBrandId.${tenantId}`),
        tenantA.id,
      ),
    )
    .toBe(brand.id);

  await page.getByRole("button", { name: "Usar tema base" }).click();
  await expect(page.getByLabel("Apariencia activa")).toContainText(
    "Maitre base",
  );
  await expect
    .poll(() =>
      page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue("--brand-primary")
          .trim(),
      ),
    )
    .toBe("#5B5CE2");
  await expect
    .poll(() =>
      page.evaluate(
        (tenantId) =>
          localStorage.getItem(`maitre.selectedBrandId.${tenantId}`),
        tenantA.id,
      ),
    )
    .toBeNull();

  await page
    .getByRole("button", { name: "Expandir estructura física de Centro" })
    .click();
  await page
    .getByRole("button", { name: "Expandir mesas de Salón principal" })
    .click();
  await expect(page.getByText("Mesas", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Ventana.*4 cubiertos/ }),
  ).toBeVisible();

  await page
    .getByRole("button", { name: "Crear mesa en Salón principal" })
    .click();
  await expect(page.getByRole("heading", { name: "Nueva mesa" })).toBeVisible();
  await page.getByLabel("Número").fill("2");
  await page.getByLabel("Nombre visible").fill("Patio");
  await page.getByLabel("Cubiertos").fill("6");
  await page.getByRole("button", { name: "Crear mesa", exact: true }).click();
  await expect(page.getByText("Mesa creada correctamente.")).toBeVisible();
  expect(calls.createdTables).toBe(1);

  await page
    .getByRole("button", { name: "Expandir operación de servicio de Centro" })
    .click();
  await expect(page.getByText("Jornadas y plazas")).toBeVisible();
  await expect(page.getByText("Plazas", { exact: true })).toBeVisible();
  await expect(page.getByText(/Sin plazas.*agrupar mesas/)).toBeVisible();
  await page.getByRole("button", { name: "Crear plaza en Cena" }).click();
  await expect(
    page.getByRole("heading", { name: "Nueva plaza" }),
  ).toBeVisible();
  await expect(page.getByLabel("Salón físico")).toHaveValue(salon.id);
  await page.getByLabel("Nombre de la plaza").fill("Terraza norte");
  await expect(page.getByLabel("Variable")).toBeChecked();
  await page.getByLabel("Fija").check();
  await page.getByLabel("Mozo o responsable").selectOption(employment.id);
  await page.getByLabel(/Ventana/).check();
  await page.getByLabel(/Patio/).check();
  await expect(page.getByText("10 cubiertos potenciales")).toBeVisible();
  await page.getByRole("button", { name: "Crear plaza", exact: true }).click();
  await expect(
    page.getByText("Plaza creada y asignada a la jornada."),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Detalle de plaza" }),
  ).toBeVisible();
  expect(calls.createdPlazas).toBe(1);
  await expect(
    page.getByText(/Fija · Salón principal · 2 mesas/),
  ).toBeVisible();
  await expectNoSeriousAccessibilityViolations(page);
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
    .poll(() =>
      name.evaluate((input) => (input as HTMLInputElement).validity.valid),
    )
    .toBe(false);
  await name.fill("Marca fallida");
  await page.getByLabel("Descripción").fill("Error determinista");
  await page.getByRole("button", { name: "Crear marca" }).last().click();
  await expect(page.getByRole("alert")).toContainText(
    "No se pudo crear la marca",
  );
});

test("muestra validación y conflicto al guardar una plaza", async ({
  page,
}) => {
  await installSession(page, tenantA.id);
  await mockOrganizationApi(page, {
    tenants: [tenantA],
    failPlazaCreate: true,
  });
  await page.goto("/organizacion");
  await page
    .getByRole("button", { name: "Expandir operación de servicio de Centro" })
    .click();
  await page.getByRole("button", { name: "Crear plaza en Cena" }).click();
  const plazaName = page.getByLabel("Nombre de la plaza");
  await plazaName.fill("x");
  await page.getByLabel(/Ventana/).check();
  await page.getByRole("button", { name: "Crear plaza", exact: true }).click();
  await expect
    .poll(() =>
      plazaName.evaluate((input) => (input as HTMLInputElement).validity.valid),
    )
    .toBe(false);
  await plazaName.fill("Terraza norte");
  await page.getByRole("button", { name: "Crear plaza", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "La mesa ya pertenece a otra plaza",
  );
});

test("hace visible el vacío operativo y crea la primera jornada antes de sus plazas", async ({
  page,
}) => {
  await installSession(page, tenantA.id);
  const calls = await mockOrganizationApi(page, {
    tenants: [tenantA],
    noServicePeriods: true,
  });
  await page.goto("/organizacion");
  await page
    .getByRole("button", { name: "Expandir operación de servicio de Centro" })
    .click();
  await expect(
    page.getByText("Sin jornadas. Creá una para organizar sus plazas."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Crear jornada en Centro" }).click();
  await expect(
    page.getByRole("heading", { name: "Nueva jornada" }),
  ).toBeVisible();
  await page.getByLabel("Nombre de la jornada").fill("Almuerzo sábado");
  await page.getByLabel("Tipo de servicio").selectOption("LUNCH");
  await page
    .getByRole("button", { name: "Crear jornada", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Detalle de jornada" }),
  ).toBeVisible();
  await expect(
    page.getByText("Jornada creada. Ya podés organizar sus plazas."),
  ).toBeVisible();
  await expect(
    page
      .locator(".org-tree__node--period")
      .filter({ hasText: "Almuerzo sábado" }),
  ).toBeVisible();
  await expect(page.getByText("0 plazas", { exact: false })).toBeVisible();
  await expect(page).toHaveURL(
    new RegExp(`node=service-period&id=${servicePeriod.id}`),
  );
  expect(calls.createdPeriods).toBe(1);
});

test("gestiona el ciclo visible de una jornada abierta hasta su cierre", async ({
  page,
}) => {
  await installSession(page, tenantA.id);
  const calls = await mockOrganizationApi(page, { tenants: [tenantA] });
  await page.goto("/organizacion");
  await page
    .getByRole("button", { name: "Expandir operación de servicio de Centro" })
    .click();
  await page
    .locator(".org-tree__node--period")
    .filter({ hasText: "Cena" })
    .click();

  await expect(
    page.getByRole("heading", { name: "Detalle de jornada" }),
  ).toBeVisible();
  await expect(page.locator(".org-status")).toHaveText("Abierta");
  await page.getByRole("button", { name: "Iniciar cierre" }).click();
  await expect(page.locator(".org-status")).toHaveText("En cierre");
  await expect(
    page.getByText("La jornada entró en proceso de cierre."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cerrar jornada" }).click();
  await expect(page.locator(".org-status")).toHaveText("Cerrada");
  await expect(
    page.getByText("Esta jornada ya no admite cambios operativos."),
  ).toBeVisible();
  expect(calls.periodTransitions).toBe(2);
});

test("permite cancelar una jornada planificada y bloquea nuevas plazas", async ({
  page,
}) => {
  await installSession(page, tenantA.id);
  const calls = await mockOrganizationApi(page, {
    tenants: [tenantA],
    initialPeriodStatus: "PLANNED",
  });
  await page.goto("/organizacion");
  await page
    .getByRole("button", { name: "Expandir operación de servicio de Centro" })
    .click();
  await page
    .locator(".org-tree__node--period")
    .filter({ hasText: "Cena" })
    .click();

  await expect(page.locator(".org-status")).toHaveText("Planificada");
  await expect(
    page.getByRole("button", { name: "Abrir jornada" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cancelar jornada" }).click();
  await expect(page.locator(".org-status")).toHaveText("Cancelada");
  await expect(
    page.getByRole("button", { name: "Crear plaza en Cena" }),
  ).toBeDisabled();
  expect(calls.periodTransitions).toBe(1);
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
  await page
    .locator(".org-tree__group-button")
    .filter({ hasText: "Equipo" })
    .click();

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
    branches?: (typeof branch)[];
    delayBrands?: boolean;
    shouldFailBrands?: () => boolean;
    failFirstEmployment?: boolean;
    failPlazaCreate?: boolean;
    noServicePeriods?: boolean;
    initialPeriodStatus?:
      "PLANNED" | "OPEN" | "CLOSING" | "CLOSED" | "CANCELLED";
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
    brandDetails: 0,
    brandPresentations: 0,
    effectivePresentations: 0,
    effectivePresentationTenantIds: [] as string[],
    createdTables: 0,
    updatedTables: 0,
    createdPlazas: 0,
    updatedPlazas: 0,
    createdPeriods: 0,
    periodTransitions: 0,
  };
  const brandRecords = (options.brands ?? [brand]).map((item) => ({ ...item }));
  const branchRecords = (options.branches ?? [branch]).map((item) => ({
    ...item,
  }));
  const branchRecord = branchRecords[0]!;
  const salons = [{ ...salon }];
  const employmentRecords = [{ ...employment }];
  const tableRecords = [{ ...table }];
  const plazaRecords: Array<{
    id: string;
    branchId: string;
    salonId: string;
    servicePeriodId: string;
    name: string;
    mode: "FIXED" | "VARIABLE";
    waiterEmploymentId: string | null;
    tableIds: string[];
  }> = [];
  const periodRecords: Array<{
    id: string;
    branchId: string;
    businessDate: string;
    name: string;
    type: "BREAKFAST" | "LUNCH" | "DINNER" | "OTHER";
    actualOpen: string | null;
    actualClose: string | null;
    status: "PLANNED" | "OPEN" | "CLOSING" | "CLOSED" | "CANCELLED";
  }> = options.noServicePeriods
    ? []
    : [
        {
          ...servicePeriod,
          status: options.initialPeriodStatus ?? servicePeriod.status,
        },
      ];
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
        data: brandRecords.length === 0 ? [] : branchRecords,
      });
    if (path === `/v1/brands/${brand.id}` && method === "GET") {
      calls.brandDetails += 1;
      return json(route, { data: brandRecords[0] });
    }
    if (path === `/v1/brands/${brand.id}/presentation` && method === "GET") {
      calls.brandPresentations += 1;
      return json(route, {
        data: { draft: null, published: null, history: [] },
      });
    }
    if (
      path === `/v1/brands/${brand.id}/presentation/effective` &&
      method === "GET"
    ) {
      calls.effectivePresentations += 1;
      calls.effectivePresentationTenantIds.push(
        request.headers()["x-tenant-id"] ?? "",
      );
      return json(route, {
        data: {
          document: {
            schemaVersion: 1,
            identity: { displayName: "Casa Norte" },
            assets: {},
            colors: { primary: "#7C3AED" },
            typography: {
              heading: {
                family: "Trebuchet MS",
                fallback: "Arial, sans-serif",
                weights: [600, 700],
              },
              body: {
                family: "Trebuchet MS",
                fallback: "Arial, sans-serif",
                weights: [400, 600],
              },
            },
            shape: {},
            templates: {},
            content: {},
          },
        },
      });
    }
    if (path === `/v1/brands/${brand.id}` && method === "PATCH") {
      calls.updatedBrands += 1;
      Object.assign(brandRecords[0]!, request.postDataJSON());
      return json(route, { data: brandRecords[0] });
    }
    if (path.startsWith("/v1/branches/") && method === "GET") {
      const requestedBranch = branchRecords.find(
        (item) => path === `/v1/branches/${item.id}`,
      );
      if (requestedBranch) return json(route, { data: requestedBranch });
    }
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
    if (path === "/v1/tables" && method === "GET")
      return json(route, { data: tableRecords });
    if (path === "/v1/tables" && method === "POST") {
      calls.createdTables += 1;
      const body = request.postDataJSON() as Omit<
        typeof table,
        "id" | "branchId"
      >;
      const created = {
        id: "80000000-0000-0000-0000-000000000002",
        branchId: branch.id,
        ...body,
      };
      tableRecords.push(created);
      return json(route, { data: created }, 201);
    }
    if (path.startsWith("/v1/tables/") && method === "GET") {
      const record = tableRecords.find(
        (item) => path === `/v1/tables/${item.id}`,
      );
      return record
        ? json(route, { data: record })
        : json(route, { title: "Mesa inexistente", type: "about:blank" }, 404);
    }
    if (path.startsWith("/v1/tables/") && method === "PATCH") {
      calls.updatedTables += 1;
      const record = tableRecords.find(
        (item) => path === `/v1/tables/${item.id}`,
      );
      if (!record) return json(route, { title: "Mesa inexistente" }, 404);
      Object.assign(record, request.postDataJSON());
      return json(route, { data: record });
    }
    if (
      path === `/v1/branches/${branch.id}/service-periods` &&
      method === "GET"
    )
      return json(route, { data: periodRecords });
    if (
      path === `/v1/branches/${branch.id}/service-periods` &&
      method === "POST"
    ) {
      calls.createdPeriods += 1;
      const body = request.postDataJSON() as {
        businessDate: string;
        name: string;
        type: "BREAKFAST" | "LUNCH" | "DINNER" | "OTHER";
      };
      const created = {
        ...servicePeriod,
        ...body,
        actualOpen: null,
        status: "PLANNED" as const,
      };
      periodRecords.push(created);
      return json(route, { data: created }, 201);
    }
    if (path.startsWith("/v1/service-periods/") && method === "GET") {
      const record = periodRecords.find(
        (item) => path === `/v1/service-periods/${item.id}`,
      );
      return record
        ? json(route, { data: record })
        : json(route, { title: "Jornada inexistente" }, 404);
    }
    if (
      path.startsWith(`/v1/service-periods/${servicePeriod.id}/`) &&
      method === "POST"
    ) {
      const record = periodRecords.find((item) => item.id === servicePeriod.id);
      if (!record) return json(route, { title: "Jornada inexistente" }, 404);
      calls.periodTransitions += 1;
      const action = path.split("/").at(-1);
      if (action === "open") {
        record.status = "OPEN";
        record.actualOpen = "2026-08-01T20:00:00.000Z";
      }
      if (action === "begin-close") record.status = "CLOSING";
      if (action === "close") {
        record.status = "CLOSED";
        record.actualClose = "2026-08-02T00:00:00.000Z";
      }
      if (action === "cancel-planned") record.status = "CANCELLED";
      return json(route, { data: record });
    }
    if (path === "/v1/plazas" && method === "GET")
      return json(route, { data: plazaRecords });
    if (path === "/v1/plazas" && method === "POST") {
      if (options.failPlazaCreate) {
        return json(
          route,
          { title: "La mesa ya pertenece a otra plaza", type: "about:blank" },
          409,
        );
      }
      calls.createdPlazas += 1;
      const body = request.postDataJSON() as Omit<
        (typeof plazaRecords)[number],
        "id" | "branchId"
      >;
      const created = {
        id: "90000000-0000-0000-0000-000000000001",
        branchId: branch.id,
        ...body,
      };
      plazaRecords.push(created);
      return json(route, { data: created }, 201);
    }
    if (path.startsWith("/v1/plazas/") && method === "GET") {
      const record = plazaRecords.find(
        (item) => path === `/v1/plazas/${item.id}`,
      );
      return record
        ? json(route, { data: record })
        : json(route, { title: "Plaza inexistente", type: "about:blank" }, 404);
    }
    if (path.startsWith("/v1/plazas/") && method === "PATCH") {
      calls.updatedPlazas += 1;
      const record = plazaRecords.find(
        (item) => path === `/v1/plazas/${item.id}`,
      );
      if (!record) return json(route, { title: "Plaza inexistente" }, 404);
      Object.assign(record, request.postDataJSON());
      return json(route, { data: record });
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
