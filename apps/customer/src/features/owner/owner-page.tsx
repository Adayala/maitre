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

export function OwnerPage() {
  const api = useApi();
  const { me, selectedBranch, selectBranch } = useSession();

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

  const branches = me?.tenants.find((tenant) => tenant.id === overviewQuery.data?.data.setup.tenantName)?.branches;
  void branches;

  return (
    <main className="owner-app">
      <AppHeader
        title="Owner"
        subtitle={selectedBranch ? `${selectedBranch.name} · vista filtrada` : "Vista consolidada"}
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
                <h2 className="owner-card-title">Próximos pasos</h2>
                <p className="owner-card-copy">Lo siguiente que conviene completar para operar.</p>
              </div>
            </div>
            <StateView
              isLoading={setupQuery.isLoading}
              error={(setupQuery.error as Error) ?? null}
              onRetry={() => void setupQuery.refetch()}
            >
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
            </StateView>
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
                <h2 className="owner-card-title">Accesos rápidos</h2>
                <p className="owner-card-copy">Atajos a las apps operativas que ya venimos armando.</p>
              </div>
            </div>
            <div className="owner-links">
              <a href="http://localhost:5173" className="owner-link-card">
                <strong>Admin web</strong>
                <span>Configuración general y módulos de backoffice.</span>
              </a>
              <a href="http://localhost:5174" className="owner-link-card">
                <strong>Waiter</strong>
                <span>Toma de pedidos y gestión de visitas.</span>
              </a>
              <a href="http://localhost:5175" className="owner-link-card">
                <strong>Cashier</strong>
                <span>Apertura, movimientos, cierre y conciliación.</span>
              </a>
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
