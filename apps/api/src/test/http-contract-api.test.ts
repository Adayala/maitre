import assert from "node:assert/strict";
import { test } from "node:test";
import { z } from "zod";
import { buildApp, resolveCorsOrigins } from "../app.js";
import { buildContainer } from "../composition/container.js";

const PROBLEM_BASE = "https://docs.maitre.app/problems";

test("authentication failures use the complete RFC 9457 representation", async () => {
  const container = await buildContainer();
  const app = await buildApp(container);
  const response = await app.inject({ method: "GET", url: "/v1/me/context" });

  assert.equal(response.statusCode, 401);
  assert.match(
    response.headers["content-type"] ?? "",
    /^application\/problem\+json/,
  );
  assert.equal(response.headers["www-authenticate"], "Bearer");
  assert.deepEqual(response.json(), {
    type: `${PROBLEM_BASE}/authentication-required`,
    title: "Authentication required",
    status: 401,
    detail: "Authentication required",
    instance: "/v1/me/context",
    code: "AUTHENTICATION_REQUIRED",
    correlationId: response.headers["x-correlation-id"],
  });
  await app.close();
});

test("unexpected failures are sanitized by the central error boundary", async () => {
  const container = await buildContainer();
  const app = await buildApp(container);
  app.get("/__contract-test/failure", async () => {
    throw new Error("database-password-canary");
  });

  const response = await app.inject({
    method: "GET",
    url: "/__contract-test/failure?secret=canary",
  });
  const body = response.json();
  assert.equal(response.statusCode, 500);
  assert.match(
    response.headers["content-type"] ?? "",
    /^application\/problem\+json/,
  );
  assert.equal(body.type, `${PROBLEM_BASE}/internal-error`);
  assert.equal(body.instance, "/__contract-test/failure");
  assert.equal(body.code, "INTERNAL_ERROR");
  assert.doesNotMatch(
    JSON.stringify(body),
    /database-password-canary|secret=canary/,
  );
  await app.close();
});

test("validation failures include sanitized field errors", async () => {
  const container = await buildContainer();
  const app = await buildApp(container);
  app.post("/__contract-test/validation", async (request) =>
    z.object({ quantity: z.number().int().positive() }).parse(request.body),
  );

  const response = await app.inject({
    method: "POST",
    url: "/__contract-test/validation",
    payload: { quantity: 0 },
  });
  const body = response.json();
  assert.equal(response.statusCode, 400);
  assert.equal(body.type, `${PROBLEM_BASE}/validation-failed`);
  assert.equal(body.code, "VALIDATION_FAILED");
  assert.deepEqual(body.errors, [
    {
      path: "quantity",
      code: "TOO_SMALL",
      message: "Number must be greater than 0",
    },
  ]);
  await app.close();
});

test("CORS origin resolution is normalized, deduplicated and fail-closed", () => {
  const previousEnvironment = process.env["APP_ENV"];
  const previousOrigins = process.env["CORS_ALLOWED_ORIGINS"];
  try {
    process.env["APP_ENV"] = "production";
    process.env["CORS_ALLOWED_ORIGINS"] =
      "https://dash.maitre.app/,https://dash.maitre.app";
    assert.deepEqual(resolveCorsOrigins(), ["https://dash.maitre.app"]);

    delete process.env["CORS_ALLOWED_ORIGINS"];
    assert.throws(
      () => resolveCorsOrigins(),
      /CORS_ALLOWED_ORIGINS must be configured in production/,
    );
  } finally {
    restoreEnvironment("APP_ENV", previousEnvironment);
    restoreEnvironment("CORS_ALLOWED_ORIGINS", previousOrigins);
  }
});

test("CORS preflight grants only configured origins", async () => {
  const previousOrigins = process.env["CORS_ALLOWED_ORIGINS"];
  try {
    process.env["CORS_ALLOWED_ORIGINS"] = "https://floor.maitre.test";
    const container = await buildContainer();
    const app = await buildApp(container);

    const allowed = await app.inject({
      method: "OPTIONS",
      url: "/v1/me/context",
      headers: {
        origin: "https://floor.maitre.test",
        "access-control-request-method": "GET",
      },
    });
    assert.equal(
      allowed.headers["access-control-allow-origin"],
      "https://floor.maitre.test",
    );

    const denied = await app.inject({
      method: "OPTIONS",
      url: "/v1/me/context",
      headers: {
        origin: "https://unknown.example",
        "access-control-request-method": "GET",
      },
    });
    assert.equal(denied.headers["access-control-allow-origin"], undefined);
    await app.close();
  } finally {
    restoreEnvironment("CORS_ALLOWED_ORIGINS", previousOrigins);
  }
});

function restoreEnvironment(name: string, value: string | undefined): void {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}
