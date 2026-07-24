import type { SupabaseClient } from "@supabase/supabase-js";
import type { Order, OrderAdjustment, OrderItem, OrderRepositoryPort } from "@maitre/ordering";

const TABLE = "ordering_orders";

interface OrderRow {
  id: string;
  tenant_id: string;
  branch_id: string;
  visit_id: string;
  currency: string;
  items: unknown;
  adjustments: unknown;
  status: string;
  catalog_revision_id: string | null;
  notes: string | null;
  subtotal_minor_units: number;
  tax_total_minor_units: number;
  grand_total_minor_units: number;
  revision: number;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  cancelled_at: string | null;
}

// Items and adjustments are JSONB — their Date fields round-trip as ISO strings,
// so they are revived here (mirrors the Floor Check JSONB precedent, extended
// for the nested Date fields Order carries).
function reviveItem(raw: OrderItem): OrderItem {
  return {
    ...raw,
    ...(raw.cancelledAt ? { cancelledAt: new Date(raw.cancelledAt) } : {}),
  };
}

function reviveAdjustment(raw: OrderAdjustment): OrderAdjustment {
  return { ...raw, createdAt: new Date(raw.createdAt) };
}

function fromRow(row: OrderRow): Order {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    branchId: row.branch_id,
    visitId: row.visit_id,
    currency: row.currency,
    items: ((row.items as OrderItem[]) ?? []).map(reviveItem),
    adjustments: ((row.adjustments as OrderAdjustment[]) ?? []).map(reviveAdjustment),
    status: row.status as Order["status"],
    subtotalMinorUnits: row.subtotal_minor_units,
    taxTotalMinorUnits: row.tax_total_minor_units,
    grandTotalMinorUnits: row.grand_total_minor_units,
    revision: row.revision,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    ...(row.catalog_revision_id !== null ? { catalogRevisionId: row.catalog_revision_id } : {}),
    ...(row.notes !== null ? { notes: row.notes } : {}),
    ...(row.submitted_at !== null ? { submittedAt: new Date(row.submitted_at) } : {}),
    ...(row.cancelled_at !== null ? { cancelledAt: new Date(row.cancelled_at) } : {}),
  };
}

function toRow(order: Order): OrderRow {
  return {
    id: order.id,
    tenant_id: order.tenantId,
    branch_id: order.branchId,
    visit_id: order.visitId,
    currency: order.currency,
    items: order.items,
    adjustments: order.adjustments,
    status: order.status,
    catalog_revision_id: order.catalogRevisionId ?? null,
    notes: order.notes ?? null,
    subtotal_minor_units: order.subtotalMinorUnits,
    tax_total_minor_units: order.taxTotalMinorUnits,
    grand_total_minor_units: order.grandTotalMinorUnits,
    revision: order.revision,
    created_at: order.createdAt.toISOString(),
    updated_at: order.updatedAt.toISOString(),
    submitted_at: order.submittedAt ? order.submittedAt.toISOString() : null,
    cancelled_at: order.cancelledAt ? order.cancelledAt.toISOString() : null,
  };
}

export class SupabaseOrderRepository implements OrderRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<Order | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as OrderRow) : null;
  }

  async listByVisit(tenantId: string, visitId: string): Promise<Order[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("visit_id", visitId);
    if (error) throw error;
    return (data as OrderRow[]).map(fromRow);
  }

  async save(order: Order): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(order));
    if (error) throw error;
  }
}
