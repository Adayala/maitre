import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { buildApp } from "../app.js";
import { buildContainer, type Container } from "../composition/container.js";
import type {
  FixtureSessionVerificationPort,
  InMemoryOutboxRepository,
} from "@maitre/adapter-persistence-memory";

function sessionsOf(container: Container): FixtureSessionVerificationPort {
  return container.sessions as FixtureSessionVerificationPort;
}

function outboxOf(container: Container): InMemoryOutboxRepository {
  return container.outbox as InMemoryOutboxRepository;
}

// SPEC-224 §5 — Fastify inject() exercises transport without a real port.
// Covers SPEC-023 §7 error contract: absent/invalid/expired token, and the
// happy path per SPEC-213's GET /v1/me/context.

test("GET /health/live returns ok without touching dependencies", async () => {
  const container = await buildContainer();
  const app = await buildApp(container);
  const response = await app.inject({ method: "GET", url: "/health/live" });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(
    new Set(Object.keys(response.json() as Record<string, unknown>)),
    new Set(["status", "build"]),
  );
  assert.equal(response.json().status, "ok");
  assert.deepEqual(
    new Set(Object.keys(response.json().build as Record<string, unknown>)),
    new Set(["commitSha", "deployedAt", "environment"]),
  );
  await app.close();
});

test("GET /v1/me/context without a bearer token returns 401 authentication-required", async () => {
  const container = await buildContainer();
  const app = await buildApp(container);
  const response = await app.inject({ method: "GET", url: "/v1/me/context" });
  assert.equal(response.statusCode, 401);
  assert.deepEqual(
    new Set(Object.keys(response.json() as Record<string, unknown>)),
    new Set([
      "type",
      "title",
      "status",
      "detail",
      "instance",
      "code",
      "correlationId",
    ]),
  );
  assert.equal(
    response.json().type,
    "https://docs.maitre.app/problems/authentication-required",
  );
  assert.equal(response.json().detail, "Authentication required");
  assert.equal(response.json().status, 401);
  assert.equal(response.headers["www-authenticate"], "Bearer");
  await app.close();
});

test("GET /v1/me/context with a bogus token returns 401 authentication-required", async () => {
  const container = await buildContainer();
  const app = await buildApp(container);
  const correlationId = "11111111-1111-4111-8111-111111111112";
  const response = await app.inject({
    method: "GET",
    url: "/v1/me/context",
    headers: {
      authorization: "Bearer not-a-real-token",
      "x-correlation-id": correlationId,
    },
  });
  assert.equal(response.statusCode, 401);
  assert.deepEqual(
    new Set(Object.keys(response.json() as Record<string, unknown>)),
    new Set([
      "type",
      "title",
      "status",
      "detail",
      "instance",
      "code",
      "correlationId",
    ]),
  );
  assert.equal(
    response.json().type,
    "https://docs.maitre.app/problems/authentication-required",
  );
  assert.equal(response.json().detail, "Authentication required");
  assert.equal(response.json().status, 401);
  assert.equal(response.json().correlationId, correlationId);
  assert.equal(response.headers["x-correlation-id"], correlationId);
  assert.equal(response.headers["www-authenticate"], "Bearer");
  await app.close();
});

test("GET /v1/me/context with a malformed Authorization header returns 401", async () => {
  const container = await buildContainer();
  const app = await buildApp(container);
  const correlationId = "11111111-1111-4111-8111-111111111113";
  const response = await app.inject({
    method: "GET",
    url: "/v1/me/context",
    headers: {
      authorization: "not-bearer-scheme",
      "x-correlation-id": correlationId,
    },
  });
  assert.equal(response.statusCode, 401);
  assert.deepEqual(
    new Set(Object.keys(response.json() as Record<string, unknown>)),
    new Set([
      "type",
      "title",
      "status",
      "detail",
      "instance",
      "code",
      "correlationId",
    ]),
  );
  assert.equal(
    response.json().type,
    "https://docs.maitre.app/problems/authentication-required",
  );
  assert.equal(response.json().detail, "Authentication required");
  assert.equal(response.json().status, 401);
  assert.equal(response.json().correlationId, correlationId);
  assert.equal(response.headers["x-correlation-id"], correlationId);
  assert.equal(response.headers["www-authenticate"], "Bearer");
  await app.close();
});

test("GET /v1/me/context with the seeded demo token returns the authorized context", async () => {
  const container = await buildContainer();
  const app = await buildApp(container);
  const response = await app.inject({
    method: "GET",
    url: "/v1/me/context",
    headers: { authorization: `Bearer ${container.demoAccessToken}` },
  });
  assert.equal(response.statusCode, 200);
  const body = response.json();
  assert.deepEqual(
    new Set(Object.keys(body as Record<string, unknown>)),
    new Set(["user", "tenants"]),
  );
  assert.deepEqual(
    new Set(Object.keys(body.user as Record<string, unknown>)),
    new Set(["id", "displayName", "email"]),
  );
  assert.equal(body.user.displayName, "Demo Owner");
  assert.equal(body.tenants.length, 1);
  assert.deepEqual(
    new Set(Object.keys(body.tenants[0] as Record<string, unknown>)),
    new Set(["id", "name", "branches"]),
  );
  assert.equal(body.tenants[0].branches.length, 1);
  assert.deepEqual(
    new Set(
      Object.keys(body.tenants[0].branches[0] as Record<string, unknown>),
    ),
    new Set(["id", "code", "name"]),
  );
  assert.equal(body.tenants[0].branches[0].code, "MAIN");
  await app.close();
});

test("GET /v1/me/context appends UserAuthenticated to the outbox with no tenantId", async () => {
  const container = await buildContainer();
  const app = await buildApp(container);
  const before = outboxOf(container).all().length;
  await app.inject({
    method: "GET",
    url: "/v1/me/context",
    headers: { authorization: `Bearer ${container.demoAccessToken}` },
  });
  const records = outboxOf(container).all();
  assert.equal(records.length, before + 1);
  const event = records[records.length - 1]!;
  assert.equal(event.eventName, "UserAuthenticated");
  assert.equal(event.tenantId, undefined);
  await app.close();
});

test("GET /v1/me/context overlaps audit, membership and per-tenant branch resolution", async () => {
  const container = await buildContainer();
  const originalAppend = container.outbox.append.bind(container.outbox);
  const originalMemberships = container.memberships.listActiveByUser.bind(
    container.memberships,
  );
  const originalTenant = container.tenants.findById.bind(container.tenants);
  const originalBranches = container.branches.listByTenant.bind(
    container.branches,
  );
  let auditPending = false;
  let membershipsOverlappedAudit = false;
  let tenantPending = false;
  let branchesOverlappedTenant = false;

  container.outbox.append = async (event) => {
    auditPending = true;
    await new Promise<void>((resolve) => setImmediate(resolve));
    await originalAppend(event);
    auditPending = false;
  };
  container.memberships.listActiveByUser = async (userId) => {
    membershipsOverlappedAudit = auditPending;
    return originalMemberships(userId);
  };
  container.tenants.findById = async (id) => {
    tenantPending = true;
    await new Promise<void>((resolve) => setImmediate(resolve));
    const tenant = await originalTenant(id);
    tenantPending = false;
    return tenant;
  };
  container.branches.listByTenant = async (id) => {
    branchesOverlappedTenant = tenantPending;
    return originalBranches(id);
  };

  const app = await buildApp(container);
  const response = await app.inject({
    method: "GET",
    url: "/v1/me/context",
    headers: { authorization: `Bearer ${container.demoAccessToken}` },
  });

  assert.equal(response.statusCode, 200);
  assert.equal(membershipsOverlappedAudit, true);
  assert.equal(branchesOverlappedTenant, true);
  await app.close();
});

test("GET /v1/me/context propagates x-correlation-id to response and outbox event", async () => {
  const container = await buildContainer();
  const app = await buildApp(container);
  const correlationId = "11111111-1111-4111-8111-111111111114";

  const response = await app.inject({
    method: "GET",
    url: "/v1/me/context",
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-correlation-id": correlationId,
    },
  });
  assert.equal(response.statusCode, 200);
  assert.equal(response.headers["x-correlation-id"], correlationId);

  const records = outboxOf(container).all();
  const event = records[records.length - 1]!;
  assert.equal(event.eventName, "UserAuthenticated");
  assert.equal(event.correlationId, correlationId);
  await app.close();
});

test("GET /v1/me/context does not require X-Tenant-Id/X-Branch-Id headers", async () => {
  const container = await buildContainer();
  const app = await buildApp(container);
  const response = await app.inject({
    method: "GET",
    url: "/v1/me/context",
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": "irrelevant",
      "x-branch-id": "irrelevant",
    },
  });
  assert.equal(response.statusCode, 200);
  await app.close();
});

test("GET /v1/me/context rejects a token whose session has expired", async () => {
  const container = await buildContainer();
  sessionsOf(container).registerToken("expired-token", {
    provider: "fixture",
    subject: "demo-owner",
    issuedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() - 60 * 60 * 1000),
  });
  const app = await buildApp(container);
  const correlationId = "11111111-1111-4111-8111-111111111115";
  const response = await app.inject({
    method: "GET",
    url: "/v1/me/context",
    headers: {
      authorization: "Bearer expired-token",
      "x-correlation-id": correlationId,
    },
  });
  assert.equal(response.statusCode, 401);
  assert.deepEqual(
    new Set(Object.keys(response.json() as Record<string, unknown>)),
    new Set([
      "type",
      "title",
      "status",
      "detail",
      "instance",
      "code",
      "correlationId",
    ]),
  );
  assert.equal(
    response.json().type,
    "https://docs.maitre.app/problems/session-expired",
  );
  assert.equal(response.json().detail, "Session expired");
  assert.equal(response.json().status, 401);
  assert.equal(response.json().correlationId, correlationId);
  assert.equal(response.headers["x-correlation-id"], correlationId);
  assert.equal(response.headers["www-authenticate"], "Bearer");
  await app.close();
});

test("GET /v1/me/context rejects a principal with no matching User (identity-not-enabled)", async () => {
  const container = await buildContainer();
  sessionsOf(container).registerToken("unknown-subject-token", {
    provider: "fixture",
    subject: "someone-else",
    issuedAt: new Date(),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  });
  const app = await buildApp(container);
  const response = await app.inject({
    method: "GET",
    url: "/v1/me/context",
    headers: { authorization: "Bearer unknown-subject-token" },
  });
  assert.equal(response.statusCode, 403);
  assert.deepEqual(
    new Set(Object.keys(response.json() as Record<string, unknown>)),
    new Set([
      "type",
      "title",
      "status",
      "detail",
      "instance",
      "code",
      "correlationId",
    ]),
  );
  assert.equal(
    response.json().type,
    "https://docs.maitre.app/problems/identity-not-enabled",
  );
  assert.equal(response.json().detail, "Identity not enabled");
  assert.equal(response.json().status, 403);
  await app.close();
});

test("GET /v1/me/context claims a pending invite for a Supabase identity and activates invited memberships", async () => {
  const container = await buildContainer();
  const now = new Date();
  const owner = await container.users.findByExternalIdentity(
    "fixture",
    "demo-owner",
  );
  const seededMemberships = await container.memberships.listActiveByUser(
    owner!.id,
  );
  const tenantId = seededMemberships[0]!.tenantId;

  const invitedUser = {
    id: randomUUID(),
    identityProvider: "pending-invite",
    externalIdentityId: randomUUID(),
    displayName: "Invited Host",
    email: "host@example.com",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.users.save(invitedUser);
  await container.memberships.save({
    id: randomUUID(),
    tenantId,
    userId: invitedUser.id,
    status: "INVITED",
    branchScopeType: "ALL_BRANCHES",
    roleIds: ["role_maitre"],
    branchIds: [],
    invitedAt: now,
    activatedAt: null,
    createdAt: now,
    updatedAt: now,
  });

  sessionsOf(container).registerToken("supabase-first-login", {
    provider: "supabase",
    subject: "supabase-user-1",
    email: "host@example.com",
    emailVerified: true,
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });

  const app = await buildApp(container);
  const response = await app.inject({
    method: "GET",
    url: "/v1/me/context",
    headers: { authorization: "Bearer supabase-first-login" },
  });
  assert.equal(response.statusCode, 200);

  const claimed = await container.users.findByExternalIdentity(
    "supabase",
    "supabase-user-1",
  );
  assert.ok(claimed);
  assert.equal(claimed?.id, invitedUser.id);
  assert.equal(claimed?.identityProvider, "supabase");
  assert.equal(claimed?.email, "host@example.com");

  const memberships = await container.memberships.listByUser(invitedUser.id);
  assert.equal(memberships.length, 1);
  assert.equal(memberships[0]?.status, "ACTIVE");
  assert.ok(memberships[0]?.activatedAt);
  await app.close();
});

test("GET /v1/me/context auto-provisions a Supabase user with no memberships yet", async () => {
  const container = await buildContainer();
  const now = new Date();

  sessionsOf(container).registerToken("supabase-no-membership", {
    provider: "supabase",
    subject: "supabase-user-2",
    email: "new.owner@example.com",
    emailVerified: true,
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });

  const app = await buildApp(container);
  const response = await app.inject({
    method: "GET",
    url: "/v1/me/context",
    headers: { authorization: "Bearer supabase-no-membership" },
  });
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().user.email, "new.owner@example.com");
  assert.deepEqual(response.json().tenants, []);

  const created = await container.users.findByExternalIdentity(
    "supabase",
    "supabase-user-2",
  );
  assert.ok(created);
  assert.equal(created?.email, "new.owner@example.com");
  await app.close();
});

test("GET /v1/me/context respects SELECTED_BRANCHES scope in memberships", async () => {
  const container = await buildContainer();
  const now = new Date();
  const owner = await container.users.findByExternalIdentity(
    "fixture",
    "demo-owner",
  );
  const seededMemberships = await container.memberships.listActiveByUser(
    owner!.id,
  );
  const tenantId = seededMemberships[0]!.tenantId;

  const secondBranchId = randomUUID();
  const firstBranch = (await container.branches.listByTenant(tenantId))[0]!;
  await container.branches.save({
    id: secondBranchId,
    tenantId,
    brandId: firstBranch.brandId,
    code: "ANNEX",
    name: "Annex Branch",
    timezone: firstBranch.timezone,
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
  });

  const scopedUser = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "demo-scoped-me-context",
    displayName: "Scoped Me Context",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.users.save(scopedUser);
  await container.memberships.save({
    id: randomUUID(),
    tenantId,
    userId: scopedUser.id,
    status: "ACTIVE",
    branchScopeType: "SELECTED_BRANCHES",
    roleIds: ["role_waiter"],
    branchIds: [secondBranchId],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  const token = "scoped-me-context-token";
  sessionsOf(container).registerToken(token, {
    provider: "fixture",
    subject: "demo-scoped-me-context",
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });

  const app = await buildApp(container);
  const response = await app.inject({
    method: "GET",
    url: "/v1/me/context",
    headers: { authorization: `Bearer ${token}` },
  });
  assert.equal(response.statusCode, 200);
  const body = response.json();
  assert.deepEqual(
    new Set(Object.keys(body as Record<string, unknown>)),
    new Set(["user", "tenants"]),
  );
  assert.deepEqual(
    new Set(Object.keys(body.user as Record<string, unknown>)),
    new Set(["id", "displayName", "email"]),
  );
  assert.equal(body.user.displayName, "Scoped Me Context");
  assert.equal(body.tenants.length, 1);
  assert.deepEqual(
    new Set(Object.keys(body.tenants[0] as Record<string, unknown>)),
    new Set(["id", "name", "branches"]),
  );
  assert.equal(body.tenants[0].branches.length, 1);
  assert.deepEqual(
    new Set(
      Object.keys(body.tenants[0].branches[0] as Record<string, unknown>),
    ),
    new Set(["id", "code", "name"]),
  );
  assert.equal(body.tenants[0].branches[0].id, secondBranchId);
  assert.equal(body.tenants[0].branches[0].code, "ANNEX");
  await app.close();
});
