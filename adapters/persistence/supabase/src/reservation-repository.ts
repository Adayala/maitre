import type { SupabaseClient } from "@supabase/supabase-js";
import type { Reservation, ReservationRepositoryPort } from "@maitre/reservations";

const TABLE = "reservations_reservations";

interface ReservationRow {
  id: string;
  tenant_id: string;
  branch_id: string;
  guest_id: string | null;
  party_size: number;
  start_at: string;
  duration_minutes: number;
  source: string;
  status: string;
  table_ids: string[] | null;
  visit_id: string | null;
  cancellation_policy_id: string | null;
  cancel_reason: string | null;
  cancelled_at: string | null;
  no_show_reason: string | null;
  notes: string | null;
  revision: number;
  created_at: string;
  updated_at: string;
}

function fromRow(row: ReservationRow): Reservation {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    branchId: row.branch_id,
    partySize: row.party_size,
    startAt: new Date(row.start_at),
    durationMinutes: row.duration_minutes,
    source: row.source,
    status: row.status as Reservation["status"],
    revision: row.revision,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    ...(row.guest_id !== null ? { guestId: row.guest_id } : {}),
    ...(row.table_ids !== null ? { tableIds: row.table_ids } : {}),
    ...(row.visit_id !== null ? { visitId: row.visit_id } : {}),
    ...(row.cancellation_policy_id !== null
      ? { cancellationPolicyId: row.cancellation_policy_id }
      : {}),
    ...(row.cancel_reason !== null ? { cancelReason: row.cancel_reason } : {}),
    ...(row.cancelled_at !== null ? { cancelledAt: new Date(row.cancelled_at) } : {}),
    ...(row.no_show_reason !== null ? { noShowReason: row.no_show_reason } : {}),
    ...(row.notes !== null ? { notes: row.notes } : {}),
  };
}

function toRow(reservation: Reservation): ReservationRow {
  return {
    id: reservation.id,
    tenant_id: reservation.tenantId,
    branch_id: reservation.branchId,
    guest_id: reservation.guestId ?? null,
    party_size: reservation.partySize,
    start_at: reservation.startAt.toISOString(),
    duration_minutes: reservation.durationMinutes,
    source: reservation.source,
    status: reservation.status,
    table_ids: reservation.tableIds ?? null,
    visit_id: reservation.visitId ?? null,
    cancellation_policy_id: reservation.cancellationPolicyId ?? null,
    cancel_reason: reservation.cancelReason ?? null,
    cancelled_at: reservation.cancelledAt ? reservation.cancelledAt.toISOString() : null,
    no_show_reason: reservation.noShowReason ?? null,
    notes: reservation.notes ?? null,
    revision: reservation.revision,
    created_at: reservation.createdAt.toISOString(),
    updated_at: reservation.updatedAt.toISOString(),
  };
}

export class SupabaseReservationRepository implements ReservationRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<Reservation | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as ReservationRow) : null;
  }

  async listByBranch(
    tenantId: string,
    branchId: string,
    filter?: { status?: string; from?: Date; to?: Date },
  ): Promise<Reservation[]> {
    let query = this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("branch_id", branchId);
    if (filter?.status) query = query.eq("status", filter.status);
    if (filter?.from) query = query.gte("start_at", filter.from.toISOString());
    if (filter?.to) query = query.lte("start_at", filter.to.toISOString());
    const { data, error } = await query;
    if (error) throw error;
    return (data as ReservationRow[]).map(fromRow);
  }

  async listByGuest(tenantId: string, guestId: string): Promise<Reservation[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("guest_id", guestId);
    if (error) throw error;
    return (data as ReservationRow[]).map(fromRow);
  }

  async listActiveByBranchWindow(
    tenantId: string,
    branchId: string,
    _from: Date,
    _to: Date,
  ): Promise<Reservation[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("branch_id", branchId);
    if (error) throw error;
    return (data as ReservationRow[]).map(fromRow);
  }

  async save(reservation: Reservation): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(reservation));
    if (error) throw error;
  }
}
