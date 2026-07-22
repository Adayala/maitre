import type { SupabaseClient } from "@supabase/supabase-js";
import type { Table, TableRepositoryPort, TableShape } from "@maitre/organization";

const TABLE = "organization_tables";

interface TableRow {
  id: string;
  tenant_id: string;
  branch_id: string;
  salon_id: string;
  number: string;
  name: string | null;
  capacity: number;
  location_floor: number | null;
  location_zone: string | null;
  feature_wheelchair_accessible: boolean | null;
  feature_power_outlet: boolean | null;
  feature_outdoors: boolean | null;
  shape: string | null;
  min_duration_minutes: number | null;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
}

function fromRow(row: TableRow): Table {
  const hasFeatures =
    row.feature_wheelchair_accessible !== null &&
    row.feature_power_outlet !== null &&
    row.feature_outdoors !== null;

  return {
    id: row.id,
    tenantId: row.tenant_id,
    branchId: row.branch_id,
    salonId: row.salon_id,
    number: row.number,
    capacity: row.capacity,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    ...(row.name !== null ? { name: row.name } : {}),
    ...(row.shape !== null ? { shape: row.shape as TableShape } : {}),
    ...(row.min_duration_minutes !== null
      ? { minDurationMinutes: row.min_duration_minutes }
      : {}),
    ...(row.created_by !== null ? { createdBy: row.created_by } : {}),
    ...(row.updated_by !== null ? { updatedBy: row.updated_by } : {}),
    ...(row.location_floor !== null
      ? {
          location: {
            floor: row.location_floor,
            ...(row.location_zone !== null ? { zone: row.location_zone } : {}),
          },
        }
      : {}),
    ...(hasFeatures
      ? {
          features: {
            isWheelchairAccessible: row.feature_wheelchair_accessible!,
            hasPowerOutlet: row.feature_power_outlet!,
            isOutdoors: row.feature_outdoors!,
          },
        }
      : {}),
  };
}

function toRow(table: Table): TableRow {
  return {
    id: table.id,
    tenant_id: table.tenantId,
    branch_id: table.branchId,
    salon_id: table.salonId,
    number: table.number,
    name: table.name ?? null,
    capacity: table.capacity,
    location_floor: table.location?.floor ?? null,
    location_zone: table.location?.zone ?? null,
    feature_wheelchair_accessible: table.features?.isWheelchairAccessible ?? null,
    feature_power_outlet: table.features?.hasPowerOutlet ?? null,
    feature_outdoors: table.features?.isOutdoors ?? null,
    shape: table.shape ?? null,
    min_duration_minutes: table.minDurationMinutes ?? null,
    created_at: table.createdAt.toISOString(),
    created_by: table.createdBy ?? null,
    updated_at: table.updatedAt.toISOString(),
    updated_by: table.updatedBy ?? null,
  };
}

export class SupabaseTableRepository implements TableRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<Table | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as TableRow) : null;
  }

  async findByNumber(tenantId: string, salonId: string, number: string): Promise<Table | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("salon_id", salonId)
      .eq("number", number)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as TableRow) : null;
  }

  async listBySalon(tenantId: string, salonId: string): Promise<Table[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("salon_id", salonId);
    if (error) throw error;
    return (data as TableRow[]).map(fromRow);
  }

  async save(table: Table): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(table));
    if (error) throw error;
  }
}
