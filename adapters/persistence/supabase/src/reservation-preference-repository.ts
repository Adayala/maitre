import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReservationPreference, ReservationPreferenceRepositoryPort } from "@maitre/reservations";

const TABLE = "reservations_preferences";

interface ReservationPreferenceRow {
  id: string;
  tenant_id: string;
  subject_type: string;
  subject_id: string;
  code: string;
  value: string | null;
  kind: string;
  notes: string | null;
  revision: number;
  created_at: string;
  updated_at: string;
}

function fromRow(row: ReservationPreferenceRow): ReservationPreference {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    subjectType: row.subject_type as ReservationPreference["subjectType"],
    subjectId: row.subject_id,
    code: row.code,
    kind: row.kind as ReservationPreference["kind"],
    revision: row.revision,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    ...(row.value !== null ? { value: row.value } : {}),
    ...(row.notes !== null ? { notes: row.notes } : {}),
  };
}

function toRow(preference: ReservationPreference): ReservationPreferenceRow {
  return {
    id: preference.id,
    tenant_id: preference.tenantId,
    subject_type: preference.subjectType,
    subject_id: preference.subjectId,
    code: preference.code,
    value: preference.value ?? null,
    kind: preference.kind,
    notes: preference.notes ?? null,
    revision: preference.revision,
    created_at: preference.createdAt.toISOString(),
    updated_at: preference.updatedAt.toISOString(),
  };
}

export class SupabaseReservationPreferenceRepository implements ReservationPreferenceRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<ReservationPreference | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as ReservationPreferenceRow) : null;
  }

  async listBySubject(
    tenantId: string,
    subjectType: string,
    subjectId: string,
  ): Promise<ReservationPreference[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("subject_type", subjectType)
      .eq("subject_id", subjectId);
    if (error) throw error;
    return (data as ReservationPreferenceRow[]).map(fromRow);
  }

  async save(preference: ReservationPreference): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(preference));
    if (error) throw error;
  }
}
