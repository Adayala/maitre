import type { SupabaseClient } from "@supabase/supabase-js";
import type { NotificationIntent, NotificationIntentRepositoryPort } from "@maitre/reservations";

const TABLE = "reservations_notification_intents";

interface NotificationIntentRow {
  id: string;
  tenant_id: string;
  reservation_id: string;
  purpose: string;
  status: string;
  created_at: string;
}

function fromRow(row: NotificationIntentRow): NotificationIntent {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    reservationId: row.reservation_id,
    purpose: row.purpose as NotificationIntent["purpose"],
    status: row.status as NotificationIntent["status"],
    createdAt: new Date(row.created_at),
  };
}

function toRow(intent: NotificationIntent): NotificationIntentRow {
  return {
    id: intent.id,
    tenant_id: intent.tenantId,
    reservation_id: intent.reservationId,
    purpose: intent.purpose,
    status: intent.status,
    created_at: intent.createdAt.toISOString(),
  };
}

export class SupabaseNotificationIntentRepository implements NotificationIntentRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<NotificationIntent | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as NotificationIntentRow) : null;
  }

  async save(intent: NotificationIntent): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(intent));
    if (error) throw error;
  }
}
