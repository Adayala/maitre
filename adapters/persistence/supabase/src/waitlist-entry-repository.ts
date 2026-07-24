import type { SupabaseClient } from "@supabase/supabase-js";
import type { WaitlistEntry, WaitlistEntryRepositoryPort } from "@maitre/reservations";

const TABLE = "reservations_waitlist_entries";

interface WaitlistEntryRow {
  id: string;
  tenant_id: string;
  branch_id: string;
  guest_id: string | null;
  party_size: number;
  arrived_at: string;
  quoted_minutes: number | null;
  priority_override: number;
  override_reason: string | null;
  status: string;
  notified_at: string | null;
  seated_at: string | null;
  visit_id: string | null;
  cancel_reason: string | null;
  notes: string | null;
  revision: number;
  created_at: string;
  updated_at: string;
}

function fromRow(row: WaitlistEntryRow): WaitlistEntry {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    branchId: row.branch_id,
    partySize: row.party_size,
    arrivedAt: new Date(row.arrived_at),
    priorityOverride: row.priority_override,
    status: row.status as WaitlistEntry["status"],
    revision: row.revision,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    ...(row.guest_id !== null ? { guestId: row.guest_id } : {}),
    ...(row.quoted_minutes !== null ? { quotedMinutes: row.quoted_minutes } : {}),
    ...(row.override_reason !== null ? { overrideReason: row.override_reason } : {}),
    ...(row.notified_at !== null ? { notifiedAt: new Date(row.notified_at) } : {}),
    ...(row.seated_at !== null ? { seatedAt: new Date(row.seated_at) } : {}),
    ...(row.visit_id !== null ? { visitId: row.visit_id } : {}),
    ...(row.cancel_reason !== null ? { cancelReason: row.cancel_reason } : {}),
    ...(row.notes !== null ? { notes: row.notes } : {}),
  };
}

function toRow(entry: WaitlistEntry): WaitlistEntryRow {
  return {
    id: entry.id,
    tenant_id: entry.tenantId,
    branch_id: entry.branchId,
    guest_id: entry.guestId ?? null,
    party_size: entry.partySize,
    arrived_at: entry.arrivedAt.toISOString(),
    quoted_minutes: entry.quotedMinutes ?? null,
    priority_override: entry.priorityOverride,
    override_reason: entry.overrideReason ?? null,
    status: entry.status,
    notified_at: entry.notifiedAt ? entry.notifiedAt.toISOString() : null,
    seated_at: entry.seatedAt ? entry.seatedAt.toISOString() : null,
    visit_id: entry.visitId ?? null,
    cancel_reason: entry.cancelReason ?? null,
    notes: entry.notes ?? null,
    revision: entry.revision,
    created_at: entry.createdAt.toISOString(),
    updated_at: entry.updatedAt.toISOString(),
  };
}

export class SupabaseWaitlistEntryRepository implements WaitlistEntryRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<WaitlistEntry | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as WaitlistEntryRow) : null;
  }

  async listByBranch(tenantId: string, branchId: string): Promise<WaitlistEntry[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("branch_id", branchId);
    if (error) throw error;
    return (data as WaitlistEntryRow[]).map(fromRow);
  }

  async save(entry: WaitlistEntry): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(entry));
    if (error) throw error;
  }
}
