import { z } from "zod";

// SPEC-217 §2 — event envelope shared by domain events across modules.
export const eventEnvelopeSchema = z.object({
  eventId: z.string().uuid(),
  eventName: z.string().min(1),
  eventVersion: z.number().int().positive(),
  occurredAt: z.coerce.date(),
  producer: z.string().min(1),
  tenantId: z.string().uuid(),
  aggregateType: z.string().min(1),
  aggregateId: z.string().uuid(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  payload: z.record(z.unknown()),
});
export type EventEnvelope = z.infer<typeof eventEnvelopeSchema>;

// SPEC-013 §Payload
export const tenantCreatedPayloadSchema = z.object({
  tenantId: z.string().uuid(),
  name: z.string(),
  status: z.string(),
  createdAt: z.coerce.date(),
});

// SPEC-014 §Payload
export const brandCreatedPayloadSchema = z.object({
  brandId: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string(),
  status: z.string(),
  createdAt: z.coerce.date(),
});

// SPEC-015 §Payload
export const branchCreatedPayloadSchema = z.object({
  branchId: z.string().uuid(),
  tenantId: z.string().uuid(),
  brandId: z.string().uuid(),
  fiscalEntityId: z.string().uuid().optional(),
  name: z.string(),
  timezone: z.string(),
  status: z.string(),
  createdAt: z.coerce.date(),
});
