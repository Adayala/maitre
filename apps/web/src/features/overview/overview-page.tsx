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

  return (
    <section aria-labelledby="overview-heading">
      <h1 id="overview-heading">Overview</h1>
      <StateView
        isLoading={isLoading}
        error={error as Error | null}
        onRetry={() => void refetch()}
      >
        {data && (
          <>
            <dl className="kpi-grid">
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
              <p role="status">
                Métricas operativas no disponibles todavía: {data.data.operations.reason}
              </p>
            ) : (
              <dl className="kpi-grid">
                <div>
                  <dt>Visitas abiertas</dt>
                  <dd>{data.data.operations.openVisits}</dd>
                </div>
                <div>
                  <dt>Mesas ocupadas</dt>
                  <dd>{data.data.operations.occupiedTables}</dd>
                </div>
              </dl>
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
