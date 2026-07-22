import { test } from "node:test";
import assert from "node:assert/strict";
import {
  eventEnvelopeSchema,
  tenantCreatedPayloadSchema,
  brandCreatedPayloadSchema,
  branchCreatedPayloadSchema,
} from "../event-envelope.js";

const now = new Date("2026-01-01T00:00:00Z").toISOString();

test("eventEnvelopeSchema accepts a valid envelope", () => {
  const result = eventEnvelopeSchema.safeParse({
    eventId: "11111111-1111-1111-1111-111111111111",
    eventName: "TenantCreated",
    eventVersion: 1,
    occurredAt: now,
    producer: "organization",
    tenantId: "22222222-2222-2222-2222-222222222222",
    aggregateType: "Tenant",
    aggregateId: "22222222-2222-2222-2222-222222222222",
    correlationId: "33333333-3333-3333-3333-333333333333",
    payload: { name: "Acme" },
  });
  assert.equal(result.success, true);
});

test("eventEnvelopeSchema rejects eventVersion <= 0", () => {
  const result = eventEnvelopeSchema.safeParse({
    eventId: "11111111-1111-1111-1111-111111111111",
    eventName: "TenantCreated",
    eventVersion: 0,
    occurredAt: now,
    producer: "organization",
    tenantId: "22222222-2222-2222-2222-222222222222",
    aggregateType: "Tenant",
    aggregateId: "22222222-2222-2222-2222-222222222222",
    correlationId: "33333333-3333-3333-3333-333333333333",
    payload: {},
  });
  assert.equal(result.success, false);
});

test("tenantCreatedPayloadSchema accepts the minimal SPEC-013 payload", () => {
  const result = tenantCreatedPayloadSchema.safeParse({
    tenantId: "22222222-2222-2222-2222-222222222222",
    name: "Acme",
    status: "ACTIVE",
    createdAt: now,
  });
  assert.equal(result.success, true);
});

test("brandCreatedPayloadSchema accepts the minimal SPEC-014 payload", () => {
  const result = brandCreatedPayloadSchema.safeParse({
    brandId: "33333333-3333-3333-3333-333333333333",
    tenantId: "22222222-2222-2222-2222-222222222222",
    name: "La Parrilla",
    status: "ACTIVE",
    createdAt: now,
  });
  assert.equal(result.success, true);
});

test("branchCreatedPayloadSchema accepts the minimal SPEC-015 payload without fiscalEntityId", () => {
  const result = branchCreatedPayloadSchema.safeParse({
    branchId: "44444444-4444-4444-4444-444444444444",
    tenantId: "22222222-2222-2222-2222-222222222222",
    brandId: "33333333-3333-3333-3333-333333333333",
    name: "Main Branch",
    timezone: "America/Argentina/Buenos_Aires",
    status: "ACTIVE",
    createdAt: now,
  });
  assert.equal(result.success, true);
});
