// SPEC-217 §2/§4 — mirrors @maitre/organization and @maitre/identity's
// OutboxPort (each module owns its ports per SPEC-209; shapes match by
// design so one physical adapter instance satisfies all of them).

export type OutboxStatus = "PENDING" | "PROCESSING" | "PUBLISHED" | "FAILED";

export interface OutboxRecord<TPayload = unknown> {
  eventId: string;
  eventName: string;
  eventVersion: number;
  occurredAt: Date;
  producer: string;
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
