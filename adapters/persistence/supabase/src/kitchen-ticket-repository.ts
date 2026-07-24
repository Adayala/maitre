import type { SupabaseClient } from "@supabase/supabase-js";
import type { KitchenTicket, KitchenTicketLine, KitchenTicketRepositoryPort } from "@maitre/ordering";

const TABLE = "ordering_kitchen_tickets";

interface KitchenTicketRow {
  id: string;
  tenant_id: string;
  branch_id: string;
  visit_id: string;
  order_id: string;
  order_revision: number;
  status: string;
  lines: unknown;
  revision: number;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  ready_at: string | null;
  completed_at: string | null;
}

function fromRow(row: KitchenTicketRow): KitchenTicket {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    branchId: row.branch_id,
    visitId: row.visit_id,
    orderId: row.order_id,
    orderRevision: row.order_revision,
    status: row.status as KitchenTicket["status"],
    lines: (row.lines as KitchenTicketLine[]) ?? [],
    revision: row.revision,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    ...(row.started_at !== null ? { startedAt: new Date(row.started_at) } : {}),
    ...(row.ready_at !== null ? { readyAt: new Date(row.ready_at) } : {}),
    ...(row.completed_at !== null ? { completedAt: new Date(row.completed_at) } : {}),
  };
}

function toRow(ticket: KitchenTicket): KitchenTicketRow {
  return {
    id: ticket.id,
    tenant_id: ticket.tenantId,
    branch_id: ticket.branchId,
    visit_id: ticket.visitId,
    order_id: ticket.orderId,
    order_revision: ticket.orderRevision,
    status: ticket.status,
    lines: ticket.lines,
    revision: ticket.revision,
    created_at: ticket.createdAt.toISOString(),
    updated_at: ticket.updatedAt.toISOString(),
    started_at: ticket.startedAt ? ticket.startedAt.toISOString() : null,
    ready_at: ticket.readyAt ? ticket.readyAt.toISOString() : null,
    completed_at: ticket.completedAt ? ticket.completedAt.toISOString() : null,
  };
}

export class SupabaseKitchenTicketRepository implements KitchenTicketRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<KitchenTicket | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as KitchenTicketRow) : null;
  }

  async findByOrder(tenantId: string, orderId: string): Promise<KitchenTicket | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("order_id", orderId)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as KitchenTicketRow) : null;
  }

  async listByBranch(tenantId: string, branchId: string): Promise<KitchenTicket[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("branch_id", branchId);
    if (error) throw error;
    return (data as KitchenTicketRow[]).map(fromRow);
  }

  async save(ticket: KitchenTicket): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(ticket));
    if (error) throw error;
  }
}
