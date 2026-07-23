// SPEC-217 §2/§4 — event envelope and transactional outbox port.
// Use cases append a record in the same call that persists the aggregate;
// a separate publisher (out of scope for I0) later claims PENDING records.

export type OutboxStatus = "PENDING" | "PROCESSING" | "PUBLISHED" | "FAILED";

export interface OutboxRecord<TPayload = unknown> {
  eventId: string;
  eventName: string;
  eventVersion: number;
  occurredAt: Date;
  producer: string;
  // Optional: some events are tenant-agnostic/platform-level (e.g. identity's
  // UserAuthenticated, SPEC-025 — "tenant context opcional validado").
  tenantId?: string;
  aggregateType: string;
  aggregateId: string;
  correlationId: string;
  causationId?: string;
  payload: TPayload;
  status: OutboxStatus;
  attempts: number;
}

export interface OutboxPort {
  append(record: OutboxRecord): Promise<void>;
}
