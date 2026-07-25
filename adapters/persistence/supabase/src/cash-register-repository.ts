import type { SupabaseClient } from "@supabase/supabase-js";
import type { CashRegister, CashRegisterRepositoryPort } from "@maitre/cash";

const TABLE = "cash_registers";

interface CashRegisterRow {
  id: string;
  tenant_id: string;
  branch_id: string;
  code: string;
  display_name: string;
  allowed_currencies: unknown;
  status: string;
  revision: number;
  created_at: string;
  updated_at: string;
}

function fromRow(row: CashRegisterRow): CashRegister {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    branchId: row.branch_id,
    code: row.code,
    displayName: row.display_name,
    allowedCurrencies: (row.allowed_currencies as string[]) ?? [],
    status: row.status as CashRegister["status"],
    revision: row.revision,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function toRow(register: CashRegister): CashRegisterRow {
  return {
    id: register.id,
    tenant_id: register.tenantId,
    branch_id: register.branchId,
    code: register.code,
    display_name: register.displayName,
    allowed_currencies: register.allowedCurrencies,
    status: register.status,
    revision: register.revision,
    created_at: register.createdAt.toISOString(),
    updated_at: register.updatedAt.toISOString(),
  };
}

export class SupabaseCashRegisterRepository implements CashRegisterRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<CashRegister | null> {
    const { data, error } = await this.client.from(TABLE).select("*").eq("tenant_id", tenantId).eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as CashRegisterRow) : null;
  }

  async findByCode(tenantId: string, branchId: string, code: string): Promise<CashRegister | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("branch_id", branchId)
      .eq("code", code)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as CashRegisterRow) : null;
  }

  async listByBranch(tenantId: string, branchId: string): Promise<CashRegister[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("branch_id", branchId)
      .order("code", { ascending: true });
    if (error) throw error;
    return (data as CashRegisterRow[]).map(fromRow);
  }

  async save(register: CashRegister): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(register));
    if (error) throw error;
  }
}
