import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "../../components/app-header.js";
import { StateView } from "../../components/state-view.js";
import { useApi } from "../../app/use-api.js";
import { useSession } from "../../app/session-context.js";

interface DashboardSetupResponse {
  data: {
    setup: Record<
      string,
      {
        status: "COMPLETE" | "INCOMPLETE" | "BLOCKED";
        count: number;
        required: number;
        actionLink?: string;
      }
    >;
    nextSteps: string[];
  };
}

interface DashboardOverviewResponse {
  data: {
    setup: {
      status: string;
      asOf: string;
      tenantName: string | null;
      brandCount: number;
      branchCount: number;
    };
    operations: {
      status: "AVAILABLE" | "UNAVAILABLE";
      asOf: string;
      reason?: string;
      openVisits: number | null;
      occupiedTables: number | null;
      activeOrders: number | null;
      pendingPayments: number | null;
    };
    lastUpdated: string;
  };
}

const setupLabels: Record<string, string> = {
  tenant: "Tenant",
  brands: "Marcas",
  branches: "Sucursales",
  users: "Usuarios",
  menus: "Menús",
  products: "Productos",
};

const APP_LAUNCHERS = [
  {
    label: "Admin web",
    href: "http://localhost:5173/",
    audience: "Backoffice",
    summary: "Configuración general, módulos administrativos y panel base.",
  },
  {
    label: "Cashier",
    href: "http://localhost:5174/",
    audience: "Caja",
    summary: "Apertura/cierre, movimientos, settlement y reconciliación.",
  },
  {
    label: "Kitchen",
    href: "http://localhost:5175/",
    audience: "Producción",
    summary: "KDS y ejecución de comandas para cocina.",
  },
  {
    label: "Waiter",
    href: "http://localhost:5176/",
    audience: "Servicio",
    summary: "Mesas, pedidos, entrega y cierre operativo de visitas.",
  },
  {
    label: "Host / Maître",
    href: "http://localhost:5178/",
    audience: "Recepción",
    summary: "Reservas, waitlist, seating y snapshot de mesas.",
  },
  {
    label: "Customer",
    href: "http://localhost:5179/",
    audience: "Cliente",
    summary: "Discovery, menú, sucursales, reserva y mis reservas.",
  },
  {
    label: "Staff shell",
    href: "http://localhost:5180/",
    audience: "Launcher",
    summary: "Hub táctil para lanzar apps por rol y dispositivo.",
  },
];

const ROLE_COVERAGE = [
  { role: "Owner/Admin", app: "Owner + Admin web", scope: "Control, setup, seguimiento y acceso cruzado" },
  { role: "Maître/Host", app: "Host", scope: "Reservas, lista de espera, seating y visión de salón" },
  { role: "Waiter", app: "Waiter", scope: "Pedidos, cuenta y entrega de mesa" },
  { role: "Cashier", app: "Cashier", scope: "Caja y conciliación" },
  { role: "Kitchen", app: "Kitchen", scope: "Producción y handoff" },
  { role: "Customer", app: "Customer", scope: "Discovery, reserva y seguimiento" },
];

export function OwnerPage() {
  const api = useApi();
  const { me, selectedTenantId, selectedBranch, selectBranch } = useSession();

  const setupQuery = useQuery({
    queryKey: ["owner-setup-status"],
    queryFn: () => api<DashboardSetupResponse>("/v1/dashboard/setup-status"),
    refetchInterval: 30_000,
  });

  const overviewQuery = useQuery({
    queryKey: ["owner-overview"],
    queryFn: () => api<DashboardOverviewResponse>("/v1/dashboard/overview"),
    refetchInterval: 20_000,
  });

  const setupItems = useMemo(() => {
    const record = setupQuery.data?.data.setup ?? {};
    return Object.entries(record).map(([code, item]) => ({
      code,
      label: setupLabels[code] ?? code,
      ...item,
    }));
  }, [setupQuery.data]);

  const completion = setupItems.length
    ? Math.round((setupItems.filter((item) => item.status === "COMPLETE").length / setupItems.length) * 100)
    : 0;
  const selectedTenant = me?.tenants.find((tenant) => tenant.id === selectedTenantId) ?? null;
  const nextStepMessage =
    setupQuery.data?.data.nextSteps[0] ??
    (overviewQuery.data?.data.operations.status === "UNAVAILABLE"
      ? "Usar las apps operativas por rol mientras consolidamos métricas transversales."
      : "La operación base está lista.");
  const coveragePercent = Math.round((ROLE_COVERAGE.length / 6) * 100);

  return (
    <main className="owner-app">
      <AppHeader
        title="Owner"
        subtitle={
          selectedBranch
            ? `${selectedBranch.name} · vista filtrada`
            : selectedTenant
              ? `${selectedTenant.name} · vista consolidada`
              : "Vista consolidada"
        }
        right={
          <button type="button" className="btn btn--ghost" onClick={() => selectBranch("")}>
            Ver todas
          </button>
        }
      />

      <section className="cashier-shell cashier-grid">
        <section className="cashier-card cashier-card--hero">
          <div className="cashier-hero-row">
            <div>
              <div className="cashier-eyebrow">Estado general</div>
              <h2 className="owner-hero-title">
                {overviewQuery.data?.data.setup.tenantName ?? "Tu operación"}
              </h2>
              <p className="owner-hero-copy">
                Seguimiento de setup, operación y accesos rápidos del owner.
              </p>
            </div>
            <div className="cashier-balance-block">
              <span className="cashier-balance-label">Setup completo</span>
              <strong>{completion}%</strong>
            </div>
          </div>
        </section>

        <StateView
          isLoading={overviewQuery.isLoading}
          error={(overviewQuery.error as Error) ?? null}
          onRetry={() => void overviewQuery.refetch()}
        >
          {overviewQuery.data ? (
            <section className="cashier-kpi-strip">
              <article className="cashier-kpi-card">
                <span>Marcas</span>
                <strong>{overviewQuery.data.data.setup.brandCount}</strong>
              </article>
              <article className="cashier-kpi-card">
                <span>Sucursales</span>
                <strong>{overviewQuery.data.data.setup.branchCount}</strong>
              </article>
              <article className="cashier-kpi-card">
                <span>Visitas abiertas</span>
                <strong>{overviewQuery.data.data.operations.openVisits ?? "—"}</strong>
              </article>
              <article className="cashier-kpi-card">
                <span>Órdenes activas</span>
                <strong>{overviewQuery.data.data.operations.activeOrders ?? "—"}</strong>
              </article>
              <article className="cashier-kpi-card">
                <span>Apps / roles cubiertos</span>
                <strong>{coveragePercent}%</strong>
              </article>
              <article className="cashier-kpi-card">
                <span>Apps vivas</span>
                <strong>{APP_LAUNCHERS.length}</strong>
              </article>
            </section>
          ) : null}
        </StateView>

        <div className="owner-grid">
          <section className="cashier-card">
            <div className="cashier-card-head">
              <div>
                <h2 className="owner-card-title">Checklist de puesta en marcha</h2>
                <p className="owner-card-copy">Estado derivado de la configuración real.</p>
              </div>
            </div>

            <StateView
              isLoading={setupQuery.isLoading}
              error={(setupQuery.error as Error) ?? null}
              onRetry={() => void setupQuery.refetch()}
            >
              <div className="owner-checklist">
                {setupItems.map((item) => (
                  <article key={item.code} className={`owner-check owner-check--${item.status.toLowerCase()}`}>
                    <div>
                      <strong>{item.label}</strong>
                      <p>
                        {item.count}/{item.required}
                      </p>
                    </div>
                    <span className="owner-check-status">{ownerStatusLabel(item.status)}</span>
                  </article>
                ))}
              </div>
            </StateView>
          </section>

          <section className="cashier-card">
            <div className="cashier-card-head">
              <div>
                <h2 className="owner-card-title">Próximo foco</h2>
                <p className="owner-card-copy">Qué conviene hacer ahora según el estado actual.</p>
              </div>
            </div>
            <div className="cashier-banner cashier-banner--info">
              <span>{nextStepMessage}</span>
            </div>
            <div className="owner-action-list">
              {(setupQuery.data?.data.nextSteps ?? []).length > 0 ? (
                setupQuery.data?.data.nextSteps.map((step) => (
                  <div key={step} className="owner-action-item">
                    <span>→</span>
                    <strong>{step}</strong>
                  </div>
                ))
              ) : (
                <div className="cashier-banner cashier-banner--success">
                  <span>Todo el setup mínimo está completo.</span>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="owner-grid">
          <section className="cashier-card">
            <div className="cashier-card-head">
              <div>
                <h2 className="owner-card-title">Operación</h2>
                <p className="owner-card-copy">Snapshot transversal para seguir el local.</p>
              </div>
            </div>
            {overviewQuery.data?.data.operations.status === "UNAVAILABLE" ? (
              <div className="cashier-banner cashier-banner--warning">
                <span>{overviewQuery.data.data.operations.reason ?? "Métricas operativas no disponibles."}</span>
              </div>
            ) : (
              <dl className="owner-metric-list">
                <div>
                  <dt>Mesas ocupadas</dt>
                  <dd>{overviewQuery.data?.data.operations.occupiedTables ?? "—"}</dd>
                </div>
                <div>
                  <dt>Pagos pendientes</dt>
                  <dd>{overviewQuery.data?.data.operations.pendingPayments ?? "—"}</dd>
                </div>
              </dl>
            )}
          </section>

          <section className="cashier-card">
            <div className="cashier-card-head">
              <div>
                <h2 className="owner-card-title">Launchpad multiapp</h2>
                <p className="owner-card-copy">Atajos corregidos a las apps por rol que ya están vivas.</p>
              </div>
            </div>
            <div className="owner-links">
              {APP_LAUNCHERS.map((app) => (
                <a key={app.label} href={app.href} className="owner-link-card">
                  <strong>{app.label}</strong>
                  <span>{app.audience}</span>
                  <span>{app.summary}</span>
                  <em>{app.href}</em>
                </a>
              ))}
            </div>
          </section>
        </div>

        <div className="owner-grid">
          <section className="cashier-card">
            <div className="cashier-card-head">
              <div>
                <h2 className="owner-card-title">Cobertura por rol</h2>
                <p className="owner-card-copy">Mapa simple de qué experiencia ya quedó separada por actor.</p>
              </div>
            </div>
            <div className="owner-role-grid">
              {ROLE_COVERAGE.map((item) => (
                <article key={item.role} className="owner-role-card">
                  <strong>{item.role}</strong>
                  <span>{item.app}</span>
                  <p>{item.scope}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="cashier-card">
            <div className="cashier-card-head">
              <div>
                <h2 className="owner-card-title">Limitaciones honestas</h2>
                <p className="owner-card-copy">Lo que todavía no consolidamos a nivel transversal.</p>
              </div>
            </div>
            <div className="owner-action-list">
              <div className="owner-action-item">
                <span>•</span>
                <strong>Overview operativo del backend sigue marcado UNAVAILABLE.</strong>
              </div>
              <div className="owner-action-item">
                <span>•</span>
                <strong>El seguimiento cross-app hoy se hace mejor entrando a cada app de rol.</strong>
              </div>
              <div className="owner-action-item">
                <span>•</span>
                <strong>Falta consolidar métricas transversales reales de floor + ordering + payments.</strong>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function ownerStatusLabel(status: "COMPLETE" | "INCOMPLETE" | "BLOCKED") {
  switch (status) {
    case "COMPLETE":
      return "Completo";
    case "BLOCKED":
      return "Bloqueado";
    default:
      return "Pendiente";
  }
}
