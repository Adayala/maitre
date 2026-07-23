// SPEC-217 §2/§4 — mirrors @maitre/organization's OutboxPort. Each module
// owns its ports (SPEC-209); both shapes are identical by design so a
// single physical outbox adapter instance satisfies both structurally.

export type OutboxStatus = "PENDING" | "PROCESSING" | "PUBLISHED" | "FAILED";

export interface OutboxRecord<TPayload = unknown> {
  eventId: string;
  eventName: string;
  eventVersion: number;
  occurredAt: Date;
  producer: string;
  // SPEC-025 — some identity events (UserAuthenticated) are tenant-agnostic:
  // "tenant context opcional validado". Absent means platform-level.
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
