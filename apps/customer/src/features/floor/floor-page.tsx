import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "../../app/use-api.js";
import { useSession } from "../../app/session-context.js";
import { useNav } from "../../app/nav-context.js";
import { AppHeader } from "../../components/app-header.js";
import { StateView } from "../../components/state-view.js";
import { ApiError } from "../../lib/api-client.js";
import type {
  ApiData,
  Salon,
  Table,
  TableStatusProjection,
  TableStatusValue,
} from "../../lib/waiter-types.js";
import { SeatSheet } from "./seat-sheet.js";

export interface FloorTable {
  id: string;
  number: string;
  name?: string;
  capacity?: number;
  salonName?: string;
  status: TableStatusValue;
  relatedVisitId?: string;
}

interface FloorGroup {
  key: string;
  salonName: string;
  tables: FloorTable[];
}

interface FloorData {
  groups: FloorGroup[];
  limited: boolean; // true when the full table list is not readable (fell back to statuses)
  counts: Record<string, number>;
}

const STATUS_META: Record<TableStatusValue, { label: string; cls: string; icon: string }> = {
  AVAILABLE: { label: "Libre", cls: "s-available", icon: "○" },
  OCCUPIED: { label: "Ocupada", cls: "s-occupied", icon: "●" },
  PAYING: { label: "Pagando", cls: "s-paying", icon: "$" },
  RESERVED: { label: "Reservada", cls: "s-reserved", icon: "◔" },
  CLEANING: { label: "Limpieza", cls: "s-cleaning", icon: "✦" },
  BLOCKED: { label: "Bloqueada", cls: "s-blocked", icon: "✕" },
};

export function FloorPage() {
  const api = useApi();
  const { selectedBranchId, selectedBranch } = useSession();
  const { push } = useNav();
  const [seatTable, setSeatTable] = useState<FloorTable | null>(null);

  const query = useQuery({
    queryKey: ["floor", selectedBranchId],
    enabled: Boolean(selectedBranchId),
    refetchInterval: 15_000,
    queryFn: async (): Promise<FloorData> => {
      const branchId = selectedBranchId!;
      // Status projection is always readable by a waiter (table-status:read).
      const statusRes = await api<ApiData<TableStatusProjection[]>>(
        `/v1/branches/${branchId}/table-statuses`,
      );
      const statusById = new Map<string, TableStatusProjection>();
      for (const s of statusRes.data) statusById.set(s.tableId, s);

      // Full table list needs salon:read/table:read (admin/manager). Waiters may
      // not have it — degrade gracefully to the tables referenced by statuses.
      try {
        const salonRes = await api<{ data: Salon[] }>(`/v1/salons?branchId=${branchId}`);
        const groups: FloorGroup[] = [];
        for (const salon of salonRes.data) {
          const tableRes = await api<{ data: Table[] }>(`/v1/tables?salonId=${salon.id}&limit=200`);
          const tables: FloorTable[] = tableRes.data
            .map((t) => {
              const st = statusById.get(t.id);
              return {
                id: t.id,
                number: t.number,
                ...(t.name ? { name: t.name } : {}),
                capacity: t.capacity,
                salonName: salon.name,
                status: st?.status ?? "AVAILABLE",
                ...(st?.relatedVisitId ? { relatedVisitId: st.relatedVisitId } : {}),
              } satisfies FloorTable;
            })
            .sort((a, b) => a.number.localeCompare(b.number, "es", { numeric: true }));
          if (tables.length > 0) groups.push({ key: salon.id, salonName: salon.name, tables });
        }
        return { groups, limited: false, counts: tallyCounts(groups) };
      } catch (err) {
        if (err instanceof ApiError && (err.status === 403 || err.status === 401)) {
          const tables: FloorTable[] = statusRes.data.map((s) => ({
            id: s.tableId,
            number: s.tableId.slice(0, 4),
            status: s.status,
            ...(s.relatedVisitId ? { relatedVisitId: s.relatedVisitId } : {}),
          }));
          const groups = tables.length
            ? [{ key: "all", salonName: "Mesas activas", tables }]
            : [];
          return { groups, limited: true, counts: tallyCounts(groups) };
        }
        throw err;
      }
    },
  });

  const isEmpty = !query.isLoading && (query.data?.groups.length ?? 0) === 0;
  const counts = query.data?.counts;

  function handleTap(table: FloorTable) {
    if (table.status === "AVAILABLE") {
      setSeatTable(table);
    } else if (table.relatedVisitId) {
      push({ name: "visit", visitId: table.relatedVisitId });
    }
  }

  const availableTables = useMemo(
    () => (query.data?.groups.flatMap((g) => g.tables) ?? []).filter((t) => t.status === "AVAILABLE"),
    [query.data],
  );

  return (
    <div className="screen">
      <AppHeader
        title="Salón"
        subtitle={selectedBranch?.name ?? undefined}
        right={
          counts ? (
            <div className="floor-legend" aria-hidden="true">
              <span className="lg lg--available">{counts["AVAILABLE"] ?? 0}</span>
              <span className="lg lg--occupied">{counts["OCCUPIED"] ?? 0}</span>
              <span className="lg lg--paying">{counts["PAYING"] ?? 0}</span>
            </div>
          ) : undefined
        }
      />

      <main className="screen-body">
        <StateView
          isLoading={query.isLoading}
          error={(query.error as Error) ?? null}
          isEmpty={isEmpty}
          onRetry={() => query.refetch()}
          loadingLabel="Cargando mesas…"
          emptyIcon="🍽️"
          emptyTitle="No hay mesas"
          emptyMessage="Todavía no hay mesas con actividad en esta sucursal."
        >
          {query.data?.limited && (
            <p className="floor-note">
              Mostrando solo mesas con actividad. Para ver todo el salón se necesita permiso de
              lectura de mesas.
            </p>
          )}
          {query.data?.groups.map((group) => (
            <section key={group.key} className="floor-group">
              <h2 className="floor-group-title">{group.salonName}</h2>
              <div className="table-grid">
                {group.tables.map((t) => {
                  const meta = STATUS_META[t.status];
                  const actionable = t.status === "AVAILABLE" || Boolean(t.relatedVisitId);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className={`table-card table-card--${meta.cls}`}
                      disabled={!actionable}
                      onClick={() => handleTap(t)}
                    >
                      <span className="table-card-num">{t.number}</span>
                      <span className="table-card-status">{meta.label}</span>
                      {t.capacity != null && (
                        <span className="table-card-cap">{t.capacity} 👥</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </StateView>
      </main>

      {seatTable && selectedBranchId && (
        <SeatSheet
          branchId={selectedBranchId}
          primaryTable={seatTable}
          otherAvailable={availableTables.filter((t) => t.id !== seatTable.id)}
          onClose={() => setSeatTable(null)}
          onSeated={(visitId) => {
            setSeatTable(null);
            void query.refetch();
            push({ name: "visit", visitId });
          }}
        />
      )}
    </div>
  );
}

function tallyCounts(groups: FloorGroup[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const g of groups) for (const t of g.tables) counts[t.status] = (counts[t.status] ?? 0) + 1;
  return counts;
}
