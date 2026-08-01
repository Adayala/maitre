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

test("@ui-contract actualiza el perfil fiscal y declara un punto de venta ARCA", async ({
  page,
}) => {
  const tenantId = "00000000-0000-0000-0000-000000000001";
  const branchId = "00000000-0000-0000-0000-000000000003";
  const fiscalEntityId = "00000000-0000-0000-0000-000000000501";
  const pointOfSaleId = "00000000-0000-0000-0000-000000000502";
  const invoiceId = "00000000-0000-0000-0000-000000000503";
  const now = "2026-07-29T18:00:00.000Z";
  let legalAddress = "";
  let pointOfSale: Record<string, unknown> | null = null;

  const fiscalEntity = () => ({
    id: fiscalEntityId,
    cuit: "20209014549",
    legalName: "Maitre Test SA",
    displayName: "Maitre",
    name: "Maitre Test SA",
    status: "ACTIVE",
    taxCondition: "RI",
    legalAddress: legalAddress || undefined,
    updatedAt: now,
  });

  await page.addInitScript(
    ({ tenant }) => {
      sessionStorage.setItem("maitre.fixtureAccessToken", "e2e-token");
      localStorage.setItem("maitre.selectedTenantId", tenant);
    },
    { tenant: tenantId },
  );

  await page.route("http://127.0.0.1:3101/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;

    if (path === "/v1/me/context") {
      return route.fulfill({
        json: {
          user: { id: "user-e2e", displayName: "Fiscal E2E", email: null },
          tenants: [
            {
              id: tenantId,
              name: "Maitre",
              branches: [{ id: branchId, code: "CENTRO", name: "Centro" }],
            },
          ],
        },
      });
    }
    if (path === "/v1/brand-presentations/resolve") {
      return route.fulfill({ status: 404, json: { title: "Sin marca" } });
    }
    if (path === "/v1/fiscal-entities") {
      return route.fulfill({ json: { data: [fiscalEntity()] } });
    }
    if (
      path === `/v1/fiscal-entities/${fiscalEntityId}` &&
      request.method() === "PATCH"
    ) {
      const body = request.postDataJSON() as Record<string, unknown>;
      expect(body).toMatchObject({
        legalAddress: "Av. Corrientes 1234",
        reason: "Validación registral E2E",
      });
      legalAddress = String(body["legalAddress"]);
      return route.fulfill({ json: { data: fiscalEntity() } });
    }
    if (path === "/v1/branches") {
      return route.fulfill({
        json: {
          data: [
            {
              id: branchId,
              code: "CENTRO",
              name: "Centro",
              status: "ACTIVE",
              fiscalEntityId,
            },
          ],
        },
      });
    }
    if (path === `/v1/subscriptions/${tenantId}`) {
      return route.fulfill({
        json: {
          data: { id: tenantId, subscriberFiscalEntityId: fiscalEntityId },
        },
      });
    }
    if (path === "/v1/fiscal-points-of-sale") {
      if (request.method() === "POST") {
        const body = request.postDataJSON() as Record<string, unknown>;
        expect(body).toMatchObject({
          fiscalEntityId,
          branchId,
          environment: "HOMOLOGATION",
          officialCode: "0002",
          arcaDomicileCode: "DOM-CENTRO",
          issuingSystem: "WSFEV1",
        });
        pointOfSale = {
          id: pointOfSaleId,
          ...body,
          registrationStatus: "DECLARED",
          status: "ACTIVE",
        };
        return route.fulfill({ status: 201, json: { data: pointOfSale } });
      }
      return route.fulfill({
        json: { data: pointOfSale ? [pointOfSale] : [] },
      });
    }
    if (path === "/v1/invoices") {
      return route.fulfill({
        json: {
          data: [
            {
              id: invoiceId,
              voucherType: "FACTURA_A",
              number: 7,
              status: "AUTHORIZED",
              currency: "ARS",
              totals: { grossMinorUnits: 242000 },
              authorizedAt: now,
            },
          ],
        },
      });
    }
    if (
      path === `/v1/invoices/${invoiceId}/document` &&
      url.searchParams.get("format") === "pdf"
    ) {
      return route.fulfill({
        headers: {
          "Access-Control-Expose-Headers": "Content-Disposition, ETag",
          "Content-Disposition":
            'attachment; filename="factura-a-00001-00000007.pdf"',
          "Content-Type": "application/pdf",
        },
        body: "%PDF-1.7 mock",
      });
    }
    return route.fulfill({
      status: 404,
      json: { title: "Fixture route not found", status: 404 },
    });
  });

  await page.goto("/fiscal");
  await expect(
    page.getByRole("heading", { name: "Control fiscal" }),
  ).toBeVisible();
  await expect(page.getByText("20-20901454-9")).toBeVisible();

  await page.getByLabel("Domicilio legal").fill("Av. Corrientes 1234");
  await page.getByLabel("Motivo del cambio").fill("Validación registral E2E");
  await page.getByRole("button", { name: "Guardar perfil fiscal" }).click();
  await expect(
    page.getByText("Datos fiscales actualizados y auditados.", { exact: true }),
  ).toBeVisible();

  await page.getByText("Declarar nuevo punto de venta").click();
  await page.getByLabel("Código oficial").fill("0002");
  await page.getByLabel("Código domicilio ARCA").fill("DOM-CENTRO");
  await page.getByLabel("Etiqueta del domicilio").fill("Sucursal Centro");
  await page.getByRole("button", { name: "Declarar punto" }).click();

  await expect(
    page.getByText("Punto de venta declarado.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("PV 0002")).toBeVisible();
  await expect(page.getByText("HOMOLOGATION")).toBeVisible();
  await expect(page.getByText("FACTURA A · 00000007")).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Descargar PDF" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("factura-a-00001-00000007.pdf");
  await expect(
    page.getByText("Comprobante FACTURA A · 00000007 descargado.", {
      exact: true,
    }),
  ).toBeVisible();
  await expectNoSeriousAccessibilityViolations(page);
});
