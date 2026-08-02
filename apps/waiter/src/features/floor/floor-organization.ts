import type {
  OperationalPlaza,
  TableStatusValue,
} from "../../lib/waiter-types.js";

export interface FloorTable {
  id: string;
  number: string;
  name?: string;
  capacity?: number;
  salonName?: string;
  status: TableStatusValue;
  relatedVisitId?: string;
}

export interface FloorGroup {
  key: string;
  salonName: string;
  tables: FloorTable[];
  organization?: "MINE" | "OTHER" | "REST";
}

export function organizeFloorGroups(
  physicalGroups: FloorGroup[],
  plazas: OperationalPlaza[],
): FloorGroup[] {
  if (plazas.length === 0) return physicalGroups;
  const tableById = new Map(
    physicalGroups.flatMap((group) =>
      group.tables.map((table) => [table.id, table] as const),
    ),
  );
  const assigned = new Set<string>();
  const plazaGroups = plazas
    .map((plaza) => {
      const tables = plaza.tableIds
        .map((tableId) => tableById.get(tableId))
        .filter((table): table is FloorTable => Boolean(table));
      tables.forEach((table) => assigned.add(table.id));
      return {
        key: `plaza-${plaza.id}`,
        salonName: `${plaza.isMine ? "Mi plaza" : "Otra plaza"} · ${plaza.name}`,
        tables,
        organization: plaza.isMine ? ("MINE" as const) : ("OTHER" as const),
      };
    })
    .filter((group) => group.tables.length > 0)
    .sort((left, right) =>
      left.organization === right.organization
        ? left.salonName.localeCompare(right.salonName)
        : left.organization === "MINE"
          ? -1
          : 1,
    );
  const remaining = physicalGroups.flatMap((group) =>
    group.tables.filter((table) => !assigned.has(table.id)),
  );
  return remaining.length > 0
    ? [
        ...plazaGroups,
        {
          key: "unassigned",
          salonName: "Resto del salón",
          tables: remaining,
          organization: "REST",
        },
      ]
    : plazaGroups;
}
