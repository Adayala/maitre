import { useTenantQuery } from "../../lib/use-tenant-query.js";
import { StateView } from "../../components/state-view.js";

interface OverviewResponse {
  data: {
    setup: { status: string; tenantName: string | null; brandCount: number; branchCount: number };
    operations: {
      status: string;
      reason?: string;
      openVisits: number | null;
      occupiedTables: number | null;
      activeOrders: number | null;
      pendingPayments: number | null;
    };
    lastUpdated: string;
  };
}

export function OverviewPage() {
  const { data, isLoading, error, refetch } = useTenantQuery<OverviewResponse>(
    "dashboard-overview",
    "/v1/dashboard/overview",
  );
  const overviewPriority = data ? getOverviewPriority(data.data) : null;
  const setupChecklist = data
    ? [
        { label: "Tenant identificado", done: Boolean(data.data.setup.tenantName) },
        { label: "Marca cargada", done: data.data.setup.brandCount > 0 },
        { label: "Sucursal cargada", done: data.data.setup.branchCount > 0 },
        { label: "Operación disponible", done: data.data.operations.status !== "UNAVAILABLE" },
      ]
    : [];

  return (
    <section aria-labelledby="overview-heading" className="overview-page">
      <h1 id="overview-heading">Overview</h1>
      <StateView
        isLoading={isLoading}
        error={error as Error | null}
        onRetry={() => void refetch()}
      >
        {data && (
          <>
            {overviewPriority ? (
              <article className={`overview-priority overview-priority--${overviewPriority.tone}`}>
                <div className="overview-priority__copy">
                  <span className="overview-priority__eyebrow">Prioridad actual</span>
                  <strong>{overviewPriority.title}</strong>
                  <p>{overviewPriority.message}</p>
                </div>
              </article>
            ) : null}

            <article className="overview-card">
              <h2>Estado del tenant</h2>
              <div className="overview-checklist">
                {setupChecklist.map((step) => (
                  <div key={step.label} className={`overview-check ${step.done ? "overview-check--done" : ""}`}>
                    <strong>{step.done ? "✓" : "•"}</strong>
                    <span>{step.label}</span>
                  </div>
                ))}
              </div>
            </article>

            <dl className="kpi-grid">
              <div>
                <dt>Tenant</dt>
                <dd>{data.data.setup.tenantName ?? "Sin nombre"}</dd>
              </div>
              <div>
                <dt>Estado setup</dt>
                <dd>{data.data.setup.status}</dd>
              </div>
              <div>
                <dt>Marcas</dt>
                <dd>{data.data.setup.brandCount}</dd>
              </div>
              <div>
                <dt>Sucursales</dt>
                <dd>{data.data.setup.branchCount}</dd>
              </div>
            </dl>

            {data.data.operations.status === "UNAVAILABLE" ? (
              <article className="overview-card">
                <h2>Operación</h2>
                <p role="status">
                  Métricas operativas no disponibles todavía: {data.data.operations.reason}
                </p>
              </article>
            ) : (
              <article className="overview-card">
                <h2>Snapshot operativo</h2>
                <dl className="kpi-grid">
                  <div>
                    <dt>Visitas abiertas</dt>
                    <dd>{data.data.operations.openVisits}</dd>
                  </div>
                  <div>
                    <dt>Mesas ocupadas</dt>
                    <dd>{data.data.operations.occupiedTables}</dd>
                  </div>
                  <div>
                    <dt>Órdenes activas</dt>
                    <dd>{data.data.operations.activeOrders}</dd>
                  </div>
                  <div>
                    <dt>Pagos pendientes</dt>
                    <dd>{data.data.operations.pendingPayments}</dd>
                  </div>
                </dl>
              </article>
            )}
            <p className="dash-freshness">
              Actualizado: {new Date(data.data.lastUpdated).toLocaleString("es-AR")}
            </p>
          </>
        )}
      </StateView>
    </section>
  );
}

function getOverviewPriority(payload: OverviewResponse["data"]) {
  if (payload.setup.branchCount === 0) {
    return {
      tone: "warning" as const,
      title: "Faltan sucursales para operar",
      message: "El tenant ya existe, pero todavía no tiene sucursales listas para habilitar operación real.",
    };
  }

  if (payload.setup.brandCount === 0) {
    return {
      tone: "warning" as const,
      title: "Falta completar la estructura comercial",
      message: "Antes de operar conviene definir al menos una marca visible para ordenar catálogo y sedes.",
    };
  }

  if (payload.operations.status === "UNAVAILABLE") {
    return {
      tone: "info" as const,
      title: "El setup existe, pero la operación todavía no expone métricas",
      message: payload.operations.reason ?? "Todavía no hay snapshot operativo disponible para este tenant.",
    };
  }

  if ((payload.operations.pendingPayments ?? 0) > 0) {
    return {
      tone: "warning" as const,
      title: "Hay pagos pendientes en operación",
      message: "Conviene revisar caja o checks abiertos porque ya aparecen pagos sin resolver.",
    };
  }

  return {
    tone: "success" as const,
    title: "Tenant listo y con operación visible",
    message: "La estructura básica está cargada y ya tenés snapshot operativo para seguir el negocio.",
  };
}
