import { useTenantQuery } from "../../lib/use-tenant-query.js";
import { StateView } from "../../components/state-view.js";

interface SetupItem {
  status: "COMPLETE" | "INCOMPLETE" | "BLOCKED";
  count: number;
  required: number;
  actionLink?: string;
}

interface SetupStatusResponse {
  data: {
    setup: Record<string, SetupItem>;
    nextSteps: string[];
  };
}

const LABELS: Record<string, string> = {
  tenant: "Tenant",
  brands: "Marcas",
  branches: "Sucursales",
  users: "Usuarios",
  menus: "Menús",
  products: "Productos",
};

export function SetupPage() {
  const { data, isLoading, error, refetch } = useTenantQuery<SetupStatusResponse>(
    "dashboard-setup-status",
    "/v1/dashboard/setup-status",
  );

  return (
    <section aria-labelledby="setup-heading">
      <h1 id="setup-heading">Setup Wizard</h1>
      <StateView
        isLoading={isLoading}
        error={error as Error | null}
        onRetry={() => void refetch()}
      >
        {data && (
          <>
            <ul className="setup-checklist">
              {Object.entries(data.data.setup).map(([code, item]) => (
                <li key={code} className={`setup-item setup-item--${item.status.toLowerCase()}`}>
                  <span aria-hidden="true">
                    {item.status === "COMPLETE" ? "✓" : item.status === "BLOCKED" ? "✕" : "○"}
                  </span>
                  <span>{LABELS[code] ?? code}</span>
                  <span>
                    {item.count}/{item.required}
                  </span>
                </li>
              ))}
            </ul>
            {data.data.nextSteps.length > 0 && (
              <div>
                <h2>Próximos pasos</h2>
                <ul>
                  {data.data.nextSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </StateView>
    </section>
  );
}
