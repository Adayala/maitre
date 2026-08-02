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
  ActivePlazasPayload,
  Salon,
  Table,
  TableStatusProjection,
  TableStatusValue,
} from "../../lib/waiter-types.js";
import { SeatSheet } from "./seat-sheet.js";
import {
  organizeFloorGroups,
  type FloorGroup,
  type FloorTable,
} from "./floor-organization.js";

interface FloorData {
  groups: FloorGroup[];
  limited: boolean; // true when the full table list is not readable (fell back to statuses)
  counts: Record<string, number>;
  servicePeriodName?: string;
  ownPlazaCount: number;
  organizationUnavailable: boolean;
}

interface FloorPriority {
  tone: "success" | "warning" | "info";
  title: string;
  message: string;
  cta: string;
  onAction: () => void;
}

interface FloorFocusCard {
  label: string;
  value: number;
  detail: string;
  active: boolean;
  onClick: () => void;
}

const STATUS_META: Record<
  TableStatusValue,
  { label: string; cls: string; icon: string }
> = {
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
  const [statusFilter, setStatusFilter] = useState<TableStatusValue | "ALL">(
    "ALL",
  );

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
      let activePlazas: ActivePlazasPayload = {
        servicePeriod: null,
        plazas: [],
      };
      let organizationUnavailable = false;
      try {
        activePlazas = (
          await api<ApiData<ActivePlazasPayload>>(
            `/v1/branches/${branchId}/active-plazas`,
          )
        ).data;
      } catch {
        organizationUnavailable = true;
      }
      const statusById = new Map<string, TableStatusProjection>();
      for (const s of statusRes.data) statusById.set(s.tableId, s);

      // Full table list needs salon:read/table:read (admin/manager). Waiters may
      // not have it — degrade gracefully to the tables referenced by statuses.
      try {
        const salonRes = await api<{ data: Salon[] }>(
          `/v1/salons?branchId=${branchId}`,
        );
        const groups: FloorGroup[] = [];
        for (const salon of salonRes.data) {
          const tableRes = await api<{ data: Table[] }>(
            `/v1/tables?salonId=${salon.id}&limit=200`,
          );
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
                ...(st?.relatedVisitId
                  ? { relatedVisitId: st.relatedVisitId }
                  : {}),
              } satisfies FloorTable;
            })
            .sort((a, b) =>
              a.number.localeCompare(b.number, "es", { numeric: true }),
            );
          if (tables.length > 0)
            groups.push({ key: salon.id, salonName: salon.name, tables });
        }
        const organized = organizeFloorGroups(groups, activePlazas.plazas);
        return {
          groups: organized,
          limited: false,
          counts: tallyCounts(organized),
          ...(activePlazas.servicePeriod
            ? { servicePeriodName: activePlazas.servicePeriod.name }
            : {}),
          ownPlazaCount: activePlazas.plazas.filter((plaza) => plaza.isMine)
            .length,
          organizationUnavailable,
        };
      } catch (err) {
        if (
          err instanceof ApiError &&
          (err.status === 403 || err.status === 401)
        ) {
          const tables: FloorTable[] = statusRes.data.map((s) => ({
            id: s.tableId,
            number: s.tableId.slice(0, 4),
            status: s.status,
            ...(s.relatedVisitId ? { relatedVisitId: s.relatedVisitId } : {}),
          }));
          const groups = tables.length
            ? [{ key: "all", salonName: "Mesas activas", tables }]
            : [];
          const organized = organizeFloorGroups(groups, activePlazas.plazas);
          return {
            groups: organized,
            limited: true,
            counts: tallyCounts(organized),
            ...(activePlazas.servicePeriod
              ? { servicePeriodName: activePlazas.servicePeriod.name }
              : {}),
            ownPlazaCount: activePlazas.plazas.filter((plaza) => plaza.isMine)
              .length,
            organizationUnavailable,
          };
        }
        throw err;
      }
    },
  });

  const isEmpty = !query.isLoading && (query.data?.groups.length ?? 0) === 0;
  const counts = query.data?.counts;
  const payingCount = counts?.["PAYING"] ?? 0;
  const occupiedCount = counts?.["OCCUPIED"] ?? 0;
  const reservedCount = counts?.["RESERVED"] ?? 0;
  const availableCount = counts?.["AVAILABLE"] ?? 0;

  function handleTap(table: FloorTable) {
    if (table.status === "AVAILABLE") {
      setSeatTable(table);
    } else if (table.relatedVisitId) {
      push({ name: "visit", visitId: table.relatedVisitId });
    }
  }

  const availableTables = useMemo(
    () =>
      (query.data?.groups.flatMap((g) => g.tables) ?? []).filter(
        (t) => t.status === "AVAILABLE",
      ),
    [query.data],
  );

  const filteredGroups = useMemo(() => {
    const groups = query.data?.groups ?? [];
    if (statusFilter === "ALL") return groups;
    return groups
      .map((group) => ({
        ...group,
        tables: group.tables.filter((table) => table.status === statusFilter),
      }))
      .filter((group) => group.tables.length > 0);
  }, [query.data, statusFilter]);

  const floorPriority = getFloorPriority({
    payingCount,
    occupiedCount,
    reservedCount,
    availableCount,
    statusFilter,
    setStatusFilter,
  });
  const floorChecklist = [
    { label: "Pagos bajo control", done: payingCount === 0 },
    {
      label: "Mesas ocupadas monitoreadas",
      done: occupiedCount === 0 || statusFilter === "OCCUPIED",
    },
    {
      label: "Reservas anticipadas revisadas",
      done: reservedCount === 0 || statusFilter === "RESERVED",
    },
    { label: "Capacidad libre visible", done: availableCount > 0 },
  ];
  const floorPending = floorChecklist
    .filter((step) => !step.done)
    .map((step) => step.label);
  const floorFocusCards: FloorFocusCard[] = [
    {
      label: "Pagando",
      value: payingCount,
      detail: "Cerrar y liberar rotación",
      active: statusFilter === "PAYING",
      onClick: () =>
        setStatusFilter((current) => (current === "PAYING" ? "ALL" : "PAYING")),
    },
    {
      label: "Ocupadas",
      value: occupiedCount,
      detail: "Seguir servicio en curso",
      active: statusFilter === "OCCUPIED",
      onClick: () =>
        setStatusFilter((current) =>
          current === "OCCUPIED" ? "ALL" : "OCCUPIED",
        ),
    },
    {
      label: "Reservadas",
      value: reservedCount,
      detail: "Preparar próximas llegadas",
      active: statusFilter === "RESERVED",
      onClick: () =>
        setStatusFilter((current) =>
          current === "RESERVED" ? "ALL" : "RESERVED",
        ),
    },
    {
      label: "Libres",
      value: availableCount,
      detail: "Capacidad para sentar ya",
      active: statusFilter === "AVAILABLE",
      onClick: () =>
        setStatusFilter((current) =>
          current === "AVAILABLE" ? "ALL" : "AVAILABLE",
        ),
    },
  ];

  return (
    <div className="screen">
      <AppHeader
        title="Salón"
        subtitle={selectedBranch?.name ?? undefined}
        right={
          counts ? (
            <div className="floor-legend" aria-hidden="true">
              <span className="lg lg--available">
                {counts["AVAILABLE"] ?? 0}
              </span>
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
          {floorPriority ? (
            <div
              className={`waiter-banner waiter-banner--${floorPriority.tone}`}
            >
              <div className="waiter-banner-copy">
                <strong>{floorPriority.title}</strong>
                <span>{floorPriority.message}</span>
              </div>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={floorPriority.onAction}
              >
                {floorPriority.cta}
              </button>
            </div>
          ) : null}

          <section
            className="plaza-context"
            aria-label="Organización de plazas"
          >
            <div>
              <span>Organización de jornada</span>
              <strong>
                {query.data?.servicePeriodName ?? "Sin jornada activa"}
              </strong>
            </div>
            <p>
              {query.data?.organizationUnavailable
                ? "No pudimos cargar las plazas. El mapa completo sigue disponible."
                : query.data?.servicePeriodName
                  ? query.data.ownPlazaCount > 0
                    ? `${query.data.ownPlazaCount} plaza(s) a tu cargo. También podés operar el resto del salón.`
                    : "No tenés una plaza asignada. Podés operar el salón normalmente."
                  : "Cuando abra una jornada vas a ver acá la distribución organizativa."}
            </p>
            {query.data?.organizationUnavailable ? (
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => query.refetch()}
              >
                Reintentar
              </button>
            ) : null}
          </section>

          <section
            className="waiter-kpi-strip"
            aria-label="Resumen operativo del salón"
          >
            <button
              type="button"
              className="waiter-kpi-card"
              onClick={() =>
                setStatusFilter((current) =>
                  current === "PAYING" ? "ALL" : "PAYING",
                )
              }
            >
              <span>Pagando</span>
              <strong>{payingCount}</strong>
            </button>
            <button
              type="button"
              className="waiter-kpi-card"
              onClick={() =>
                setStatusFilter((current) =>
                  current === "OCCUPIED" ? "ALL" : "OCCUPIED",
                )
              }
            >
              <span>Ocupadas</span>
              <strong>{occupiedCount}</strong>
            </button>
            <button
              type="button"
              className="waiter-kpi-card"
              onClick={() =>
                setStatusFilter((current) =>
                  current === "AVAILABLE" ? "ALL" : "AVAILABLE",
                )
              }
            >
              <span>Libres</span>
              <strong>{availableCount}</strong>
            </button>
            <button
              type="button"
              className="waiter-kpi-card"
              onClick={() =>
                setStatusFilter((current) =>
                  current === "RESERVED" ? "ALL" : "RESERVED",
                )
              }
            >
              <span>Reservadas</span>
              <strong>{reservedCount}</strong>
            </button>
          </section>

          <section
            className="waiter-guidance"
            aria-label="Guía operativa del salón"
          >
            <article className="waiter-guidance-card">
              <span className="waiter-guidance-eyebrow">
                Chequeo de recorrido
              </span>
              <strong>Qué conviene revisar ahora</strong>
              <div className="waiter-checklist">
                {floorChecklist.map((step) => (
                  <div
                    key={step.label}
                    className={`waiter-check ${step.done ? "waiter-check--done" : ""}`}
                  >
                    <strong>{step.done ? "✓" : "•"}</strong>
                    <span>{step.label}</span>
                  </div>
                ))}
              </div>
              <p className="waiter-guidance-note">
                {floorPending.length > 0
                  ? `Todavía conviene pasar por: ${floorPending.join(", ")}.`
                  : "El salón está balanceado para seguir servicio normal."}
              </p>
            </article>

            <article className="waiter-guidance-card">
              <span className="waiter-guidance-eyebrow">Atajos de piso</span>
              <strong>Entrá directo al frente más útil</strong>
              <div className="waiter-focus-grid">
                {floorFocusCards.map((card) => (
                  <button
                    key={card.label}
                    type="button"
                    className={`waiter-focus-card ${card.active ? "waiter-focus-card--active" : ""}`}
                    onClick={card.onClick}
                  >
                    <span>{card.label}</span>
                    <strong>{card.value}</strong>
                    <p>{card.detail}</p>
                  </button>
                ))}
              </div>
            </article>
          </section>

          {query.data?.limited && (
            <p className="floor-note">
              Mostrando solo mesas con actividad. Para ver todo el salón se
              necesita permiso de lectura de mesas.
            </p>
          )}

          <div className="waiter-toolbar">
            <div className="waiter-segmented">
              {(
                ["ALL", "AVAILABLE", "OCCUPIED", "PAYING", "RESERVED"] as const
              ).map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`waiter-seg-btn ${statusFilter === value ? "waiter-seg-btn--active" : ""}`}
                  onClick={() => setStatusFilter(value)}
                >
                  {value === "ALL" ? "Todas" : STATUS_META[value].label}
                </button>
              ))}
            </div>
          </div>

          {filteredGroups.map((group) => (
            <section key={group.key} className="floor-group">
              <h2 className="floor-group-title">{group.salonName}</h2>
              <div className="table-grid">
                {group.tables.map((t) => {
                  const meta = STATUS_META[t.status];
                  const actionable =
                    t.status === "AVAILABLE" || Boolean(t.relatedVisitId);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className={`table-card table-card--${meta.cls}`}
                      data-table-id={t.id}
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

          {!query.isLoading && filteredGroups.length === 0 ? (
            <div className="empty-inline">
              <span aria-hidden="true">🔎</span>
              <p>No hay mesas para ese filtro.</p>
            </div>
          ) : null}
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
  for (const g of groups)
    for (const t of g.tables) counts[t.status] = (counts[t.status] ?? 0) + 1;
  return counts;
}

function getFloorPriority({
  payingCount,
  occupiedCount,
  reservedCount,
  availableCount,
  statusFilter,
  setStatusFilter,
}: {
  payingCount: number;
  occupiedCount: number;
  reservedCount: number;
  availableCount: number;
  statusFilter: TableStatusValue | "ALL";
  setStatusFilter: React.Dispatch<
    React.SetStateAction<TableStatusValue | "ALL">
  >;
}): FloorPriority | null {
  if (payingCount > 0) {
    return {
      tone: "warning",
      title: `${payingCount} mesa${payingCount === 1 ? "" : "s"} cobrando ahora`,
      message:
        "Conviene resolver primero las mesas en pago para liberar rotación y evitar esperas.",
      cta: statusFilter === "PAYING" ? "Ver todas" : "Ir a pagando",
      onAction: () =>
        setStatusFilter((current) => (current === "PAYING" ? "ALL" : "PAYING")),
    };
  }

  if (occupiedCount > 0) {
    return {
      tone: "info",
      title: `${occupiedCount} mesa${occupiedCount === 1 ? "" : "s"} en servicio`,
      message:
        "Revisá rápido las ocupadas para seguir pedidos, entregas o próximos cierres.",
      cta: statusFilter === "OCCUPIED" ? "Ver todas" : "Ir a ocupadas",
      onAction: () =>
        setStatusFilter((current) =>
          current === "OCCUPIED" ? "ALL" : "OCCUPIED",
        ),
    };
  }

  if (reservedCount > 0) {
    return {
      tone: "info",
      title: `${reservedCount} mesa${reservedCount === 1 ? "" : "s"} reservada${reservedCount === 1 ? "" : "s"}`,
      message:
        "Chequeá preparación de mesas reservadas para anticiparte a próximas llegadas.",
      cta: statusFilter === "RESERVED" ? "Ver todas" : "Ir a reservadas",
      onAction: () =>
        setStatusFilter((current) =>
          current === "RESERVED" ? "ALL" : "RESERVED",
        ),
    };
  }

  if (availableCount > 0) {
    return {
      tone: "success",
      title: `${availableCount} mesa${availableCount === 1 ? "" : "s"} libre${availableCount === 1 ? "" : "s"}`,
      message:
        "Hay capacidad para sentar una nueva visita enseguida si entra un grupo.",
      cta: statusFilter === "AVAILABLE" ? "Ver todas" : "Ir a libres",
      onAction: () =>
        setStatusFilter((current) =>
          current === "AVAILABLE" ? "ALL" : "AVAILABLE",
        ),
    };
  }

  return null;
}
