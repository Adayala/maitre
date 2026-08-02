import assert from "node:assert/strict";
import test from "node:test";
import { buildApp } from "../app.js";
import { buildContainer } from "../composition/container.js";

const tenantId = "00000000-0000-0000-0000-000000000001";

test("tenant context reuses the authenticated user and overlaps tenant with membership lookup", async () => {
  const container = await buildContainer();
  const originalTenantLookup = container.tenants.findById.bind(
    container.tenants,
  );
  const originalMembershipLookup =
    container.memberships.findActiveByUserAndTenant.bind(container.memberships);
  const originalUserLookup = container.users.findById.bind(container.users);
  let tenantLookupPending = false;
  let membershipOverlappedTenant = false;
  let redundantUserLookups = 0;

  container.tenants.findById = async (id) => {
    tenantLookupPending = true;
    await new Promise<void>((resolve) => setImmediate(resolve));
    const tenant = await originalTenantLookup(id);
    tenantLookupPending = false;
    return tenant;
  };
  container.memberships.findActiveByUserAndTenant = async (userId, id) => {
    membershipOverlappedTenant = tenantLookupPending;
    return originalMembershipLookup(userId, id);
  };
  container.users.findById = async (id) => {
    redundantUserLookups += 1;
    return originalUserLookup(id);
  };

  const app = await buildApp(container);
  const response = await app.inject({
    method: "GET",
    url: "/v1/brands",
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
  });

  assert.equal(response.statusCode, 200);
  assert.equal(membershipOverlappedTenant, true);
  assert.equal(redundantUserLookups, 0);
  await app.close();
});
