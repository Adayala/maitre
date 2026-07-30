import assert from "node:assert/strict";
import { test } from "node:test";
import {
  InMemoryTelemetry,
  TELEMETRY_SIGNALS,
} from "@maitre/telemetry";
import { buildApp } from "../app.js";
import { buildContainer } from "../composition/container.js";

const CORRELATION_ID = "11111111-1111-4111-8111-111111111111";
const TRACEPARENT =
  "00-22222222222222222222222222222222-3333333333333333-01";

test("HTTP observability emits bounded RED signals and propagates context", async () => {
  const telemetry = new InMemoryTelemetry();
  const app = await buildApp(await buildContainer(), telemetry);
  const response = await app.inject({
    method: "GET",
    url: "/health/live?probe=1",
    headers: {
      "x-correlation-id": CORRELATION_ID,
      traceparent: TRACEPARENT,
    },
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.headers["x-correlation-id"], CORRELATION_ID);
  assert.deepEqual(
    telemetry.metrics.map(({ signal, attributes }) => ({ signal, attributes })),
    [
      {
        signal: TELEMETRY_SIGNALS.httpRequests,
        attributes: {
          method: "GET",
          route: "/health/live",
          status_class: "2xx",
          outcome: "success",
        },
      },
      {
        signal: TELEMETRY_SIGNALS.httpDuration,
        attributes: {
          method: "GET",
          route: "/health/live",
          status_class: "2xx",
          outcome: "success",
        },
      },
    ],
  );
  assert.equal(telemetry.spans[0]?.name, "GET /health/live");
  assert.equal(telemetry.spans[0]?.parentTraceparent, TRACEPARENT);
  await app.close();
});

test("Problem Details reuses the trusted response correlation ID", async () => {
  const telemetry = new InMemoryTelemetry();
  const container = await buildContainer();
  const app = await buildApp(container, telemetry);
  const response = await app.inject({
    method: "GET",
    url: "/v1/brands",
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-correlation-id": CORRELATION_ID,
    },
  });

  assert.equal(response.statusCode, 403);
  assert.equal(response.headers["x-correlation-id"], CORRELATION_ID);
  assert.equal(response.json().correlationId, CORRELATION_ID);
  assert.equal(
    telemetry.metrics.find(
      ({ signal }) => signal === TELEMETRY_SIGNALS.httpRequests,
    )?.attributes.status_class,
    "4xx",
  );
  await app.close();
});

test("invalid external context is replaced and readiness emits dependency state", async () => {
  const telemetry = new InMemoryTelemetry();
  const app = await buildApp(await buildContainer(), telemetry);
  const response = await app.inject({
    method: "GET",
    url: "/health/ready",
    headers: {
      "x-correlation-id": "customer@example.com",
      traceparent: "00-00000000000000000000000000000000-0000000000000000-01",
    },
  });

  assert.match(
    String(response.headers["x-correlation-id"]),
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
  );
  assert.equal(telemetry.spans[0]?.parentTraceparent, undefined);
  assert.equal(
    telemetry.metrics.find(
      ({ signal }) => signal === TELEMETRY_SIGNALS.readiness,
    )?.attributes.outcome,
    "ready",
  );
  await app.close();
});
