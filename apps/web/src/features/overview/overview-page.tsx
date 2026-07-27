import { useTenantQuery } from "../../lib/use-tenant-query.js";
import { StateView } from "../../components/state-view.js";
import { Link } from "react-router-dom";

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
  const nextStep = data ? getOverviewNextStep(data.data) : null;
  const quickLinks = data ? getOverviewQuickLinks(data.data) : [];

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

            {nextStep ? (
              <article className="overview-card">
                <h2>Siguiente paso recomendado</h2>
                <p>{nextStep.message}</p>
                <div className="overview-link-grid">
                  <Link className="overview-link-card overview-link-card--primary" to={nextStep.to}>
                    <span>{nextStep.eyebrow}</span>
                    <strong>{nextStep.label}</strong>
                    <p>{nextStep.detail}</p>
                  </Link>
                </div>
              </article>
            ) : null}

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

            {quickLinks.length > 0 ? (
              <article className="overview-card">
                <h2>Atajos de gestión</h2>
                <div className="overview-link-grid">
                  {quickLinks.map((link) => (
                    <Link key={link.to} className="overview-link-card" to={link.to}>
                      <span>{link.eyebrow}</span>
                      <strong>{link.label}</strong>
                      <p>{link.detail}</p>
                    </Link>
                  ))}
                </div>
              </article>
            ) : null}
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

function getOverviewNextStep(payload: OverviewResponse["data"]) {
  if (payload.setup.brandCount === 0) {
    return {
      eyebrow: "Estructura comercial",
      label: "Cargar primera marca",
      detail: "Definí la marca base para ordenar catálogo, sedes y experiencia pública.",
      message: "La base del tenant ya existe; el paso más útil ahora es cargar la primera marca.",
      to: "/brands",
    };
  }

  if (payload.setup.branchCount === 0) {
    return {
      eyebrow: "Expansión operativa",
      label: "Crear primera sucursal",
      detail: "Sin al menos una sede no se habilita la operación real del restaurante.",
      message: "La estructura comercial ya está, pero todavía falta una sucursal para poder operar.",
      to: "/branches",
    };
  }

  if (payload.operations.status === "UNAVAILABLE") {
    return {
      eyebrow: "Checklist de base",
      label: "Revisar setup",
      detail: "Comprobá qué parte del tenant sigue incompleta para habilitar métricas operativas.",
      message: "Todavía no hay snapshot operativo; conviene revisar el setup antes de seguir expandiendo.",
      to: "/setup",
    };
  }

  if ((payload.operations.pendingPayments ?? 0) > 0) {
    return {
      eyebrow: "Operación viva",
      label: "Mirar perfiles operativos",
      detail: "Ya hay actividad en curso; usá esta vista para validar qué apps y perfiles intervienen.",
      message: "Ya hay operación en marcha y aparecen pagos pendientes; conviene revisar cómo se está operando el tenant.",
      to: "/profiles",
    };
  }

  return {
    eyebrow: "Gobierno del tenant",
    label: "Revisar suscripción y límites",
    detail: "Con la base operativa lista, el siguiente control útil es validar capacidades y servicios activos.",
    message: "La operación básica está visible; el siguiente paso natural es revisar capacidades y servicios contratados.",
    to: "/subscription",
  };
}

function getOverviewQuickLinks(payload: OverviewResponse["data"]) {
  const links = [
    {
      to: "/setup",
      eyebrow: "Base",
      label: "Setup",
      detail: "Checklist funcional del tenant y pasos pendientes.",
    },
    {
      to: "/branches",
      eyebrow: "Sedes",
      label: "Sucursales",
      detail: payload.setup.branchCount > 0 ? "Gestioná las sedes cargadas." : "Creá la primera sede operativa.",
    },
    {
      to: "/users",
      eyebrow: "Equipo",
      label: "Usuarios",
      detail: "Revisá quién puede operar el tenant.",
    },
    {
      to: "/subscription",
      eyebrow: "Comercial",
      label: "Suscripción",
      detail: "Validá estado, límites y capacidades activas.",
    },
  ];

  return links;
}
