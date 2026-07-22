import type { SupabaseClient } from "@supabase/supabase-js";
import type { OutboxPort, OutboxRecord } from "@maitre/organization";

const TABLE = "platform_outbox";

export class SupabaseOutboxRepository implements OutboxPort {
  constructor(private readonly client: SupabaseClient) {}

  async append(record: OutboxRecord): Promise<void> {
    const { error } = await this.client.from(TABLE).insert({
      event_id: record.eventId,
      event_name: record.eventName,
      event_version: record.eventVersion,
      occurred_at: record.occurredAt.toISOString(),
      producer: record.producer,
      tenant_id: record.tenantId,
      aggregate_type: record.aggregateType,
      aggregate_id: record.aggregateId,
      correlation_id: record.correlationId,
      causation_id: record.causationId ?? null,
      payload: record.payload,
      status: record.status,
      attempts: record.attempts,
    });
    if (error) throw error;
  }
}
