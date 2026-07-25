import type { SupabaseClient } from "@supabase/supabase-js";
import type { Command, CommandPayload, TransferRecord, CommandRepositoryPort } from "@maitre/kitchen";
import { NON_TERMINAL_STATUSES } from "@maitre/kitchen";

const TABLE = "kitchen_commands";

interface CommandRow {
  id: string;
  tenant_id: string;
  brand_id: string;
  branch_id: string;
  visit_id: string;
  order_id: string;
  order_item_id: string;
  station_id: string;
  status: string;
  priority: number;
  owner_actor_ref: string | null;
  payload: unknown;
  cancel_reason: string | null;
  transfer_history: unknown;
  revision: number;
  received_at: string;
  created_at: string;
  updated_at: string;
  claimed_at: string | null;
  started_at: string | null;
  ready_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
}

function reviveTransfer(raw: TransferRecord): TransferRecord {
  return { ...raw, at: new Date(raw.at) };
}

function fromRow(row: CommandRow): Command {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    brandId: row.brand_id,
    branchId: row.branch_id,
    visitId: row.visit_id,
    orderId: row.order_id,
    orderItemId: row.order_item_id,
    stationId: row.station_id,
    status: row.status as Command["status"],
    priority: row.priority,
    ownerActorRef: row.owner_actor_ref,
    payload: (row.payload as CommandPayload) ?? { displayName: "", quantity: 0, allergenFlags: [] },
    cancelReason: row.cancel_reason,
    transferHistory: ((row.transfer_history as TransferRecord[]) ?? []).map(reviveTransfer),
    revision: row.revision,
    receivedAt: new Date(row.received_at),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    claimedAt: row.claimed_at ? new Date(row.claimed_at) : null,
    startedAt: row.started_at ? new Date(row.started_at) : null,
    readyAt: row.ready_at ? new Date(row.ready_at) : null,
    completedAt: row.completed_at ? new Date(row.completed_at) : null,
    cancelledAt: row.cancelled_at ? new Date(row.cancelled_at) : null,
  };
}

function toRow(command: Command): CommandRow {
  return {
    id: command.id,
    tenant_id: command.tenantId,
    brand_id: command.brandId,
    branch_id: command.branchId,
    visit_id: command.visitId,
    order_id: command.orderId,
    order_item_id: command.orderItemId,
    station_id: command.stationId,
    status: command.status,
    priority: command.priority,
    owner_actor_ref: command.ownerActorRef ?? null,
    payload: command.payload,
    cancel_reason: command.cancelReason ?? null,
    transfer_history: command.transferHistory,
    revision: command.revision,
    received_at: command.receivedAt.toISOString(),
    created_at: command.createdAt.toISOString(),
    updated_at: command.updatedAt.toISOString(),
    claimed_at: command.claimedAt ? command.claimedAt.toISOString() : null,
    started_at: command.startedAt ? command.startedAt.toISOString() : null,
    ready_at: command.readyAt ? command.readyAt.toISOString() : null,
    completed_at: command.completedAt ? command.completedAt.toISOString() : null,
    cancelled_at: command.cancelledAt ? command.cancelledAt.toISOString() : null,
  };
}

export class SupabaseCommandRepository implements CommandRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<Command | null> {
    const { data, error } = await this.client.from(TABLE).select("*").eq("tenant_id", tenantId).eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as CommandRow) : null;
  }

  async listByStation(tenantId: string, stationId: string): Promise<Command[]> {
    const { data, error } = await this.client.from(TABLE).select("*").eq("tenant_id", tenantId).eq("station_id", stationId);
    if (error) throw error;
    return (data as CommandRow[]).map(fromRow);
  }

  async listByOrder(tenantId: string, orderId: string): Promise<Command[]> {
    const { data, error } = await this.client.from(TABLE).select("*").eq("tenant_id", tenantId).eq("order_id", orderId);
    if (error) throw error;
    return (data as CommandRow[]).map(fromRow);
  }

  async listByBranch(tenantId: string, branchId: string): Promise<Command[]> {
    const { data, error } = await this.client.from(TABLE).select("*").eq("tenant_id", tenantId).eq("branch_id", branchId);
    if (error) throw error;
    return (data as CommandRow[]).map(fromRow);
  }

  async countNonTerminalByStation(tenantId: string, stationId: string): Promise<number> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("station_id", stationId)
      .in("status", [...NON_TERMINAL_STATUSES]);
    if (error) throw error;
    return (data as unknown[]).length;
  }

  async save(command: Command): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(command));
    if (error) throw error;
  }
}
