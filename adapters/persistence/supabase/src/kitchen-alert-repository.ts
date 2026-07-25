import type { SupabaseClient } from "@supabase/supabase-js";
import type { KitchenAlert, KitchenAlertRepositoryPort } from "@maitre/kitchen";

const TABLE = "kitchen_alerts";

interface AlertRow {
  id: string;
  tenant_id: string;
  brand_id: string | null;
  branch_id: string;
  station_id: string | null;
  command_id: string;
  rule_code: string;
  severity: string;
  status: string;
  escalation_level: number | null;
  resolution_reason: string | null;
  opened_at: string;
  acknowledged_at: string | null;
  resolved_at: string | null;
  revision: number;
  created_at: string;
  updated_at: string;
}

function fromRow(row: AlertRow): KitchenAlert {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    branchId: row.branch_id,
    commandId: row.command_id,
    ruleCode: row.rule_code,
    severity: row.severity as KitchenAlert["severity"],
    status: row.status as KitchenAlert["status"],
    escalationLevel: row.escalation_level,
    resolutionReason: row.resolution_reason,
    openedAt: new Date(row.opened_at),
    acknowledgedAt: row.acknowledged_at ? new Date(row.acknowledged_at) : null,
    resolvedAt: row.resolved_at ? new Date(row.resolved_at) : null,
    revision: row.revision,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    ...(row.brand_id !== null ? { brandId: row.brand_id } : {}),
    ...(row.station_id !== null ? { stationId: row.station_id } : {}),
  };
}

function toRow(alert: KitchenAlert): AlertRow {
  return {
    id: alert.id,
    tenant_id: alert.tenantId,
    brand_id: alert.brandId ?? null,
    branch_id: alert.branchId,
    station_id: alert.stationId ?? null,
    command_id: alert.commandId,
    rule_code: alert.ruleCode,
    severity: alert.severity,
    status: alert.status,
    escalation_level: alert.escalationLevel ?? null,
    resolution_reason: alert.resolutionReason ?? null,
    opened_at: alert.openedAt.toISOString(),
    acknowledged_at: alert.acknowledgedAt ? alert.acknowledgedAt.toISOString() : null,
    resolved_at: alert.resolvedAt ? alert.resolvedAt.toISOString() : null,
    revision: alert.revision,
    created_at: alert.createdAt.toISOString(),
    updated_at: alert.updatedAt.toISOString(),
  };
}

export class SupabaseKitchenAlertRepository implements KitchenAlertRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<KitchenAlert | null> {
    const { data, error } = await this.client.from(TABLE).select("*").eq("tenant_id", tenantId).eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as AlertRow) : null;
  }

  async findOpenByCommandAndRule(tenantId: string, commandId: string, ruleCode: string): Promise<KitchenAlert | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("command_id", commandId)
      .eq("rule_code", ruleCode)
      .neq("status", "RESOLVED")
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as AlertRow) : null;
  }

  async listByBranch(tenantId: string, branchId: string): Promise<KitchenAlert[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("branch_id", branchId)
      .order("opened_at", { ascending: false });
    if (error) throw error;
    return (data as AlertRow[]).map(fromRow);
  }

  async save(alert: KitchenAlert): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(alert));
    if (error) throw error;
  }
}
