import type { SupabaseClient } from "@supabase/supabase-js";
import type { FiscalPrinter, FiscalPrinterHealthSnapshot, FiscalPrinterRepositoryPort } from "@maitre/fiscal";

const TABLE = "fiscal_printers";

interface PrinterRow {
  id: string;
  tenant_id: string;
  branch_id: string;
  provider: string;
  model: string;
  device_id: string;
  capabilities: unknown;
  config_secret_ref: string | null;
  config_version: number;
  health_snapshot: unknown;
  status: string;
  revision: number;
  created_at: string;
  updated_at: string;
}

function healthFromRow(raw: unknown): FiscalPrinterHealthSnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  const h = raw as { checkedAt?: string; ok?: boolean; detail?: string | null };
  if (!h.checkedAt) return null;
  return { checkedAt: new Date(h.checkedAt), ok: !!h.ok, detail: h.detail ?? null };
}

function fromRow(row: PrinterRow): FiscalPrinter {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    branchId: row.branch_id,
    provider: row.provider,
    model: row.model,
    deviceId: row.device_id,
    capabilities: (row.capabilities as string[]) ?? [],
    configSecretRef: row.config_secret_ref,
    configVersion: row.config_version,
    healthSnapshot: healthFromRow(row.health_snapshot),
    status: row.status as FiscalPrinter["status"],
    revision: row.revision,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function toRow(printer: FiscalPrinter): PrinterRow {
  return {
    id: printer.id,
    tenant_id: printer.tenantId,
    branch_id: printer.branchId,
    provider: printer.provider,
    model: printer.model,
    device_id: printer.deviceId,
    capabilities: printer.capabilities,
    config_secret_ref: printer.configSecretRef ?? null,
    config_version: printer.configVersion,
    health_snapshot: printer.healthSnapshot
      ? {
          checkedAt: printer.healthSnapshot.checkedAt.toISOString(),
          ok: printer.healthSnapshot.ok,
          detail: printer.healthSnapshot.detail ?? null,
        }
      : null,
    status: printer.status,
    revision: printer.revision,
    created_at: printer.createdAt.toISOString(),
    updated_at: printer.updatedAt.toISOString(),
  };
}

export class SupabaseFiscalPrinterRepository implements FiscalPrinterRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<FiscalPrinter | null> {
    const { data, error } = await this.client.from(TABLE).select("*").eq("tenant_id", tenantId).eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as PrinterRow) : null;
  }

  async listByBranch(tenantId: string, branchId: string): Promise<FiscalPrinter[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("branch_id", branchId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data as PrinterRow[]).map(fromRow);
  }

  async save(printer: FiscalPrinter): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(printer));
    if (error) throw error;
  }
}
