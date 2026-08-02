import test from "node:test";
import assert from "node:assert/strict";
import { buildApp } from "../app.js";
import { buildContainer } from "../composition/container.js";

const tenantId = "00000000-0000-0000-0000-000000000001";
const brandId = "00000000-0000-0000-0000-000000000002";

test("published demo presentation resolves with tenant-safe brand identity and assets", async () => {
  const container = await buildContainer();
  const app = await buildApp(container);
  const response = await app.inject({
    method: "GET",
    url: `/v1/brands/${brandId}/presentation/effective?surface=WAITER`,
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
  });
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().data.tenantId, tenantId);
  assert.equal(response.json().data.brandId, brandId);
  assert.equal(response.json().data.surface, "WAITER");
  assert.equal(
    response.json().data.document.identity.displayName,
    "Casa Maitre",
  );
  assert.match(
    response.json().data.document.assets.logo.url,
    /public\/tenants\/.+\/assets\/00000000-0000-0000-0000-000000000021$/,
  );
  await app.close();
});

test("presentation reads history once and resolves effective brand data concurrently", async () => {
  const container = await buildContainer();
  const originalList = container.brandPresentations.listByBrand.bind(
    container.brandPresentations,
  );
  const originalFindDraft = container.brandPresentations.findDraft.bind(
    container.brandPresentations,
  );
  const originalFindPublished = container.brandPresentations.findPublished.bind(
    container.brandPresentations,
  );
  const originalFindBrand = container.brands.findById.bind(container.brands);
  let historyReads = 0;
  let draftReads = 0;
  let publishedReads = 0;
  let brandPending = false;
  let publishedOverlappedBrand = false;

  container.brandPresentations.listByBrand = async (...args) => {
    historyReads += 1;
    return originalList(...args);
  };
  container.brandPresentations.findDraft = async (...args) => {
    draftReads += 1;
    return originalFindDraft(...args);
  };
  container.brandPresentations.findPublished = async (...args) => {
    publishedReads += 1;
    publishedOverlappedBrand ||= brandPending;
    return originalFindPublished(...args);
  };
  container.brands.findById = async (...args) => {
    brandPending = true;
    await new Promise<void>((resolve) => setImmediate(resolve));
    const result = await originalFindBrand(...args);
    brandPending = false;
    return result;
  };

  const app = await buildApp(container);
  const headers = {
    authorization: `Bearer ${container.demoAccessToken}`,
    "x-tenant-id": tenantId,
  };
  const editable = await app.inject({
    method: "GET",
    url: `/v1/brands/${brandId}/presentation`,
    headers,
  });
  assert.equal(editable.statusCode, 200);
  assert.equal(historyReads, 1);
  assert.equal(draftReads, 0);
  assert.equal(publishedReads, 0);

  const effective = await app.inject({
    method: "GET",
    url: `/v1/brands/${brandId}/presentation/effective?surface=DASH`,
    headers,
  });
  assert.equal(effective.statusCode, 200);
  assert.equal(publishedReads, 1);
  assert.equal(publishedOverlappedBrand, true);
  await app.close();
});

test("draft remains private until publish and publish increments effective content", async () => {
  const container = await buildContainer();
  const app = await buildApp(container);
  const headers = {
    authorization: `Bearer ${container.demoAccessToken}`,
    "x-tenant-id": tenantId,
  };
  const publishedBefore = await app.inject({
    method: "GET",
    url: `/public/tenants/${tenantId}/brands/${brandId}/presentation`,
  });
  assert.equal(
    publishedBefore.json().data.document.identity.displayName,
    "Casa Maitre",
  );

  const draft = await app.inject({
    method: "PUT",
    url: `/v1/brands/${brandId}/presentation/draft`,
    headers,
    payload: {
      presentation: {
        schemaVersion: 1,
        identity: { displayName: "Casa Maitre Nueva" },
        assets: {},
        colors: { primary: "#A63D2F" },
        typography: {},
        shape: {},
        templates: {},
        content: {},
      },
    },
  });
  assert.equal(draft.statusCode, 200);
  const publicDuringDraft = await app.inject({
    method: "GET",
    url: `/public/tenants/${tenantId}/brands/${brandId}/presentation`,
  });
  assert.equal(
    publicDuringDraft.json().data.document.identity.displayName,
    "Casa Maitre",
  );

  const publish = await app.inject({
    method: "POST",
    url: `/v1/brands/${brandId}/presentation/publish`,
    headers,
  });
  assert.equal(publish.statusCode, 200);
  const publicAfter = await app.inject({
    method: "GET",
    url: `/public/tenants/${tenantId}/brands/${brandId}/presentation`,
  });
  assert.equal(
    publicAfter.json().data.document.identity.displayName,
    "Casa Maitre Nueva",
  );
  await app.close();
});

test("invalid colors fail closed", async () => {
  const container = await buildContainer();
  const app = await buildApp(container);
  const response = await app.inject({
    method: "PUT",
    url: `/v1/brands/${brandId}/presentation/draft`,
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
    payload: {
      presentation: {
        schemaVersion: 1,
        identity: {},
        assets: {},
        colors: { primary: "red" },
        typography: {},
        shape: {},
        templates: {},
        content: {},
      },
    },
  });
  assert.equal(response.statusCode, 400);
  await app.close();
});

test("brand assets are validated, persisted, served and archived", async () => {
  const container = await buildContainer();
  const app = await buildApp(container);
  const headers = {
    authorization: `Bearer ${container.demoAccessToken}`,
    "x-tenant-id": tenantId,
  };
  const unsafe = await app.inject({
    method: "POST",
    url: `/v1/brands/${brandId}/assets`,
    headers,
    payload: {
      kind: "LOGO",
      fileName: "unsafe.svg",
      mimeType: "image/svg+xml",
      base64: Buffer.from(
        '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
      ).toString("base64"),
    },
  });
  assert.equal(unsafe.statusCode, 400);

  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8"/></svg>';
  const upload = await app.inject({
    method: "POST",
    url: `/v1/brands/${brandId}/assets`,
    headers,
    payload: {
      kind: "LOGO",
      fileName: "safe.svg",
      mimeType: "image/svg+xml",
      base64: Buffer.from(svg).toString("base64"),
    },
  });
  assert.equal(upload.statusCode, 201);
  const asset = upload.json().data;
  const served = await app.inject({ method: "GET", url: asset.publicUrl });
  assert.equal(served.statusCode, 200);
  assert.equal(served.headers["content-type"], "image/svg+xml");
  assert.equal(served.body, svg);

  const archived = await app.inject({
    method: "DELETE",
    url: `/v1/brands/${brandId}/assets/${asset.id}`,
    headers,
  });
  assert.equal(archived.statusCode, 204);
  const missing = await app.inject({ method: "GET", url: asset.publicUrl });
  assert.equal(missing.statusCode, 404);
  await app.close();
});
