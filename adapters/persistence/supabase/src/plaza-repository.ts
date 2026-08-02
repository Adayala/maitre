import type { SupabaseClient } from "@supabase/supabase-js";
import type { Plaza, PlazaRepositoryPort } from "@maitre/floor";

interface PlazaRow {
  id: string;
  tenant_id: string;
  branch_id: string;
  salon_id: string;
  service_period_id: string;
  name: string;
  mode: Plaza["mode"];
  source_plaza_id: string | null;
  waiter_employment_id: string | null;
  created_at: string;
  updated_at: string;
}

interface PlazaTableRow {
  plaza_id: string;
  table_id: string;
}

export class SupabasePlazaRepository implements PlazaRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<Plaza | null> {
    const rows = await this.loadRows(tenantId, { id });
    return rows[0] ?? null;
  }

  listBySalon(tenantId: string, salonId: string): Promise<Plaza[]> {
    return this.loadRows(tenantId, { salonId });
  }

  listByServicePeriod(
    tenantId: string,
    servicePeriodId: string,
  ): Promise<Plaza[]> {
    return this.loadRows(tenantId, { servicePeriodId });
  }

  async findByTableInServicePeriod(
    tenantId: string,
    servicePeriodId: string,
    tableId: string,
  ): Promise<Plaza | null> {
    const { data: link, error: linkError } = await this.client
      .from("floor_plaza_tables")
      .select("plaza_id")
      .eq("tenant_id", tenantId)
      .eq("service_period_id", servicePeriodId)
      .eq("table_id", tableId)
      .maybeSingle();
    if (linkError) throw linkError;
    return link
      ? this.findById(tenantId, (link as { plaza_id: string }).plaza_id)
      : null;
  }

  async save(plaza: Plaza): Promise<void> {
    const row: PlazaRow = {
      id: plaza.id,
      tenant_id: plaza.tenantId,
      branch_id: plaza.branchId,
      salon_id: plaza.salonId,
      service_period_id: plaza.servicePeriodId,
      name: plaza.name,
      mode: plaza.mode,
      source_plaza_id: plaza.sourcePlazaId ?? null,
      waiter_employment_id: plaza.waiterEmploymentId ?? null,
      created_at: plaza.createdAt.toISOString(),
      updated_at: plaza.updatedAt.toISOString(),
    };
    const { error } = await this.client.from("floor_plazas").upsert(row);
    if (error) throw error;
    const { error: deleteError } = await this.client
      .from("floor_plaza_tables")
      .delete()
      .eq("tenant_id", plaza.tenantId)
      .eq("plaza_id", plaza.id);
    if (deleteError) throw deleteError;
    if (plaza.tableIds.length === 0) return;
    const links = plaza.tableIds.map((tableId) => ({
      tenant_id: plaza.tenantId,
      plaza_id: plaza.id,
      service_period_id: plaza.servicePeriodId,
      table_id: tableId,
    }));
    const { error: insertError } = await this.client
      .from("floor_plaza_tables")
      .insert(links);
    if (insertError) throw insertError;
  }

  private async loadRows(
    tenantId: string,
    filter: { id?: string; salonId?: string; servicePeriodId?: string },
  ): Promise<Plaza[]> {
    let query = this.client
      .from("floor_plazas")
      .select("*")
      .eq("tenant_id", tenantId);
    if (filter.id) query = query.eq("id", filter.id);
    if (filter.salonId) query = query.eq("salon_id", filter.salonId);
    if (filter.servicePeriodId)
      query = query.eq("service_period_id", filter.servicePeriodId);
    const { data, error } = await query;
    if (error) throw error;
    const rows = data as PlazaRow[];
    if (rows.length === 0) return [];
    const ids = rows.map((row) => row.id);
    const { data: tableData, error: tableError } = await this.client
      .from("floor_plaza_tables")
      .select("plaza_id,table_id")
      .eq("tenant_id", tenantId)
      .in("plaza_id", ids);
    if (tableError) throw tableError;
    const links = tableData as PlazaTableRow[];
    return rows.map((row) => ({
      id: row.id,
      tenantId: row.tenant_id,
      branchId: row.branch_id,
      salonId: row.salon_id,
      servicePeriodId: row.service_period_id,
      name: row.name,
      mode: row.mode,
      sourcePlazaId: row.source_plaza_id,
      waiterEmploymentId: row.waiter_employment_id,
      tableIds: links
        .filter((link) => link.plaza_id === row.id)
        .map((link) => link.table_id),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }
}
