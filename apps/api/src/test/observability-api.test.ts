import assert from "node:assert/strict";
import { test } from "node:test";
import { InMemoryTelemetry, TELEMETRY_SIGNALS } from "@maitre/telemetry";
import { buildApp } from "../app.js";
import { buildContainer } from "../composition/container.js";
import { InMemoryOutboxRepository } from "@maitre/adapter-persistence-memory";

const CORRELATION_ID = "11111111-1111-4111-8111-111111111111";
const TRACEPARENT = "00-22222222222222222222222222222222-3333333333333333-01";

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
        signal: TELEMETRY_SIGNALS.httpActiveRequests,
        attributes: {
          method: "GET",
          route: "/health/live",
        },
      },
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
      {
        signal: TELEMETRY_SIGNALS.httpActiveRequests,
        attributes: {
          method: "GET",
          route: "/health/live",
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
  assert.equal(
    telemetry.metrics.some(
      ({ signal, attributes }) =>
        signal === TELEMETRY_SIGNALS.outboxBacklog &&
        attributes.status === "PENDING",
    ),
    true,
  );
  await app.close();
});

test("trusted correlation and trace context propagate into outbox envelopes", async () => {
  const telemetry = new InMemoryTelemetry();
  const container = await buildContainer();
  const owner = await container.users.findByExternalIdentity(
    "fixture",
    "demo-owner",
  );
  const memberships = await container.memberships.listActiveByUser(owner!.id);
  const tenantId = memberships[0]!.tenantId;
  const branch = (await container.branches.listByTenant(tenantId))[0]!;
  const app = await buildApp(container, telemetry);
  const response = await app.inject({
    method: "POST",
    url: "/v1/visits",
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
      "x-branch-id": branch.id,
      "x-correlation-id": CORRELATION_ID,
      traceparent: TRACEPARENT,
    },
    payload: {
      branchId: branch.id,
      tableIds: ["00000000-0000-0000-0000-000000000005"],
      guestCount: 2,
    },
  });
  assert.equal(response.statusCode, 201);
  const visitEvent = (container.outbox as InMemoryOutboxRepository)
    .all()
    .find((event) => event.eventName === "floor.visit.opened.v1");
  assert.equal(visitEvent?.correlationId, CORRELATION_ID);
  assert.equal(visitEvent?.traceparent, TRACEPARENT);
  assert.equal(
    telemetry.spans.some((span) => span.name === "auth verify access token"),
    true,
  );
  await app.close();
});

test("outbox health surface is tenant-scoped, protected and payload-free", async () => {
  const container = await buildContainer();
  const owner = await container.users.findByExternalIdentity(
    "fixture",
    "demo-owner",
  );
  const tenantId = (await container.memberships.listActiveByUser(owner!.id))[0]!
    .tenantId;
  const app = await buildApp(container);
  const response = await app.inject({
    method: "GET",
    url: "/v1/operations/outbox-health",
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().data.scope, "CURRENT_TENANT");
  const serialized = response.body;
  assert.equal(serialized.includes("payload"), false);
  assert.equal(serialized.includes("tenantId"), false);
  assert.equal(serialized.includes("aggregateId"), false);
  await app.close();
});
