import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  JourneyOutboxEvent,
  OutboxOperationalSnapshot,
  OutboxOperationsPort,
  OutboxRecord,
  OutboxStatus,
} from "@maitre/organization";

const TABLE = "platform_outbox";

export class SupabaseOutboxRepository implements OutboxOperationsPort {
  constructor(private readonly client: SupabaseClient) {}

  async append(record: OutboxRecord): Promise<void> {
    const { error } = await this.client.from(TABLE).insert({
      event_id: record.eventId,
      event_name: record.eventName,
      event_version: record.eventVersion,
      occurred_at: record.occurredAt.toISOString(),
      producer: record.producer,
      tenant_id: record.tenantId ?? null,
      aggregate_type: record.aggregateType,
      aggregate_id: record.aggregateId,
      correlation_id: record.correlationId,
      causation_id: record.causationId ?? null,
      traceparent: record.traceparent ?? null,
      payload: record.payload,
      status: record.status,
      attempts: record.attempts,
    });
    if (error) throw error;
  }

  async getOperationalSnapshot(
    input: { tenantId?: string; now?: Date } = {},
  ): Promise<OutboxOperationalSnapshot> {
    const { data, error } = await this.client.rpc(
      "outbox_operational_snapshot",
      {
        p_tenant_id: input.tenantId ?? null,
        p_now: (input.now ?? new Date()).toISOString(),
      },
    );
    if (error) throw error;
    const value = data as Record<string, unknown>;
    const rawCounts = (value["counts"] ?? {}) as Record<string, unknown>;
    const counts = Object.fromEntries(
      (["PENDING", "PROCESSING", "PUBLISHED", "FAILED"] as OutboxStatus[]).map(
        (status) => [status, numeric(rawCounts[status])],
      ),
    ) as Record<OutboxStatus, number>;
    return {
      counts,
      oldestPendingAgeMs: numeric(value["oldestPendingAgeMs"]),
      publishedLast5m: numeric(value["publishedLast5m"]),
      retryCount: numeric(value["retryCount"]),
      failedCount: numeric(value["failedCount"]),
      expiredLeaseCount: numeric(value["expiredLeaseCount"]),
    };
  }

  async listJourneyEvents(
    limit = 1_000,
  ): Promise<readonly JourneyOutboxEvent[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select(
        "event_id,event_name,occurred_at,aggregate_type,aggregate_id,correlation_id,traceparent,payload,telemetry_observed_at",
      )
      .in("event_name", [...JOURNEY_EVENT_NAMES])
      .order("occurred_at", { ascending: false })
      .limit(Math.max(1, Math.min(limit, 5_000)));
    if (error) throw error;
    return (data ?? []).map((row) => ({
      eventId: row.event_id as string,
      eventName: row.event_name as string,
      occurredAt: new Date(row.occurred_at as string),
      aggregateType: row.aggregate_type as string,
      aggregateId: row.aggregate_id as string,
      correlationId: row.correlation_id as string,
      ...(typeof row.traceparent === "string"
        ? { traceparent: row.traceparent }
        : {}),
      payload: row.payload,
      ...(typeof row.telemetry_observed_at === "string"
        ? { telemetryObservedAt: new Date(row.telemetry_observed_at) }
        : {}),
    }));
  }

  async claimJourneyEvent(
    eventId: string,
    claimedAt: Date,
    leaseMs: number,
  ): Promise<boolean> {
    const { data, error } = await this.client.rpc(
      "claim_journey_telemetry_event",
      {
        p_event_id: eventId,
        p_now: claimedAt.toISOString(),
        p_lease_seconds: Math.max(1, Math.ceil(leaseMs / 1_000)),
      },
    );
    if (error) throw error;
    return data === true;
  }

  async markJourneyEventObserved(
    eventId: string,
    observedAt: Date,
  ): Promise<void> {
    const { error } = await this.client
      .from(TABLE)
      .update({
        telemetry_observed_at: observedAt.toISOString(),
        telemetry_claimed_at: null,
      })
      .eq("event_id", eventId)
      .is("telemetry_observed_at", null);
    if (error) throw error;
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

function numeric(value: unknown): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}
