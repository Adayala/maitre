import { test } from "node:test";
import assert from "node:assert/strict";
import { buildApp } from "../app.js";
import { buildContainer } from "../composition/container.js";

// SPEC-224 §5 — Fastify inject() exercises transport without a real port.
// Covers SPEC-023 §7 error contract: absent/invalid/expired token, and the
// happy path per SPEC-213's GET /v1/me/context.

test("GET /health/live returns ok without touching dependencies", async () => {
  const container = await buildContainer();
  const app = await buildApp(container);
  const response = await app.inject({ method: "GET", url: "/health/live" });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { status: "ok" });
  await app.close();
});

test("GET /v1/me/context without a bearer token returns 401 authentication-required", async () => {
  const container = await buildContainer();
  const app = await buildApp(container);
  const response = await app.inject({ method: "GET", url: "/v1/me/context" });
  assert.equal(response.statusCode, 401);
  assert.equal(response.json().type, "authentication-required");
  assert.equal(response.headers["www-authenticate"], "Bearer");
  await app.close();
});

test("GET /v1/me/context with a bogus token returns 401 authentication-required", async () => {
  const container = await buildContainer();
  const app = await buildApp(container);
  const response = await app.inject({
    method: "GET",
    url: "/v1/me/context",
    headers: { authorization: "Bearer not-a-real-token" },
  });
  assert.equal(response.statusCode, 401);
  assert.equal(response.json().type, "authentication-required");
  await app.close();
});

test("GET /v1/me/context with a malformed Authorization header returns 401", async () => {
  const container = await buildContainer();
  const app = await buildApp(container);
  const response = await app.inject({
    method: "GET",
    url: "/v1/me/context",
    headers: { authorization: "not-bearer-scheme" },
  });
  assert.equal(response.statusCode, 401);
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
  assert.equal(body.user.displayName, "Demo Owner");
  assert.equal(body.tenants.length, 1);
  assert.equal(body.tenants[0].branches.length, 1);
  assert.equal(body.tenants[0].branches[0].code, "MAIN");
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
  container.sessions.registerToken("expired-token", {
    provider: "fixture",
    subject: "demo-owner",
    issuedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() - 60 * 60 * 1000),
  });
  const app = await buildApp(container);
  const response = await app.inject({
    method: "GET",
    url: "/v1/me/context",
    headers: { authorization: "Bearer expired-token" },
  });
  assert.equal(response.statusCode, 401);
  assert.equal(response.json().type, "session-expired");
  await app.close();
});

test("GET /v1/me/context rejects a principal with no matching User (identity-not-enabled)", async () => {
  const container = await buildContainer();
  container.sessions.registerToken("unknown-subject-token", {
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
  assert.equal(response.json().type, "identity-not-enabled");
  await app.close();
});
