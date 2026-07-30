import type {
  JourneyOutboxEvent,
  OutboxOperationalSnapshot,
  OutboxOperationsPort,
  OutboxRecord,
  OutboxStatus,
} from "@maitre/organization";

// In-memory outbox — a placeholder for the Postgres outbox table of
// SPEC-217 §4. `append` here is trivially atomic with the aggregate save
// since both happen in the same synchronous in-process call; a real adapter
// must write both inside one PostgreSQL transaction.
interface StoredOutboxRecord extends OutboxRecord {
  createdAt: Date;
  publishedAt?: Date;
  leaseExpiresAt?: Date;
  lastAttemptAt?: Date;
  telemetryClaimedAt?: Date;
  telemetryObservedAt?: Date;
}

export class InMemoryOutboxRepository implements OutboxOperationsPort {
  private readonly records: StoredOutboxRecord[] = [];

  constructor(private readonly now: () => Date = () => new Date()) {}

  async append(record: OutboxRecord): Promise<void> {
    this.records.push({ ...record, createdAt: this.now() });
  }

  /** Test/inspection helper — not part of OutboxPort. */
  all(): readonly OutboxRecord[] {
    return this.records;
  }

  async getOperationalSnapshot(
    input: { tenantId?: string; now?: Date } = {},
  ): Promise<OutboxOperationalSnapshot> {
    const now = input.now ?? this.now();
    const records = input.tenantId
      ? this.records.filter((record) => record.tenantId === input.tenantId)
      : this.records;
    const counts: Record<OutboxStatus, number> = {
      PENDING: 0,
      PROCESSING: 0,
      PUBLISHED: 0,
      FAILED: 0,
    };
    for (const record of records) counts[record.status] += 1;
    const oldestPending = records
      .filter((record) => record.status === "PENDING")
      .reduce<Date | undefined>(
        (oldest, record) =>
          !oldest || record.createdAt < oldest ? record.createdAt : oldest,
        undefined,
      );
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60_000);
    return {
      counts,
      oldestPendingAgeMs: oldestPending
        ? Math.max(0, now.getTime() - oldestPending.getTime())
        : 0,
      publishedLast5m: records.filter(
        (record) =>
          record.status === "PUBLISHED" &&
          record.publishedAt !== undefined &&
          record.publishedAt >= fiveMinutesAgo,
      ).length,
      retryCount: records.reduce(
        (total, record) => total + Math.max(0, record.attempts - 1),
        0,
      ),
      failedCount: counts.FAILED,
      expiredLeaseCount: records.filter(
        (record) =>
          record.status === "PROCESSING" &&
          record.leaseExpiresAt !== undefined &&
          record.leaseExpiresAt < now,
      ).length,
    };
  }

  async listJourneyEvents(
    limit = 1_000,
  ): Promise<readonly JourneyOutboxEvent[]> {
    return this.records
      .filter((record) => JOURNEY_EVENT_NAMES.has(record.eventName))
      .sort(
        (left, right) => left.occurredAt.getTime() - right.occurredAt.getTime(),
      )
      .slice(-Math.max(1, Math.min(limit, 5_000)))
      .map((record) => ({
        eventId: record.eventId,
        eventName: record.eventName,
        occurredAt: record.occurredAt,
        aggregateType: record.aggregateType,
        aggregateId: record.aggregateId,
        correlationId: record.correlationId,
        ...(record.traceparent ? { traceparent: record.traceparent } : {}),
        payload: record.payload,
        ...(record.telemetryObservedAt
          ? { telemetryObservedAt: record.telemetryObservedAt }
          : {}),
      }));
  }

  async markJourneyEventObserved(
    eventId: string,
    observedAt: Date,
  ): Promise<void> {
    const record = this.records.find(
      (candidate) => candidate.eventId === eventId,
    );
    if (record && !record.telemetryObservedAt) {
      record.telemetryObservedAt = observedAt;
      delete record.telemetryClaimedAt;
    }
  }

  async claimJourneyEvent(
    eventId: string,
    claimedAt: Date,
    leaseMs: number,
  ): Promise<boolean> {
    const record = this.records.find(
      (candidate) => candidate.eventId === eventId,
    );
    if (!record || record.telemetryObservedAt) return false;
    if (
      record.telemetryClaimedAt &&
      record.telemetryClaimedAt.getTime() + leaseMs > claimedAt.getTime()
    ) {
      return false;
    }
    record.telemetryClaimedAt = claimedAt;
    return true;
  }

  /** Test helper for publisher/backlog operational states. */
  setOperationalState(
    eventId: string,
    patch: Partial<
      Pick<
        StoredOutboxRecord,
        | "status"
        | "attempts"
        | "publishedAt"
        | "leaseExpiresAt"
        | "lastAttemptAt"
      >
    >,
  ): void {
    const record = this.records.find(
      (candidate) => candidate.eventId === eventId,
    );
    if (!record) throw new Error(`outbox-record-not-found:${eventId}`);
    Object.assign(record, patch);
  }
}

const JOURNEY_EVENT_NAMES = new Set([
  "floor.visit.opened.v1",
  "ordering.order.submitted.v1",
  "kitchen.command.received.v1",
  "kitchen.command.in-progress.v1",
  "kitchen.command.ready.v1",
  "ordering.order.delivered.v1",
  "floor.check.opened.v1",
  "payment.captured.v1",
  "floor.visit.closed.v1",
]);
