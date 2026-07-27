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
  const setupEntries = data ? Object.entries(data.data.setup) : [];
  const completedItems = setupEntries.filter(([, item]) => item.status === "COMPLETE");
  const incompleteItems = setupEntries.filter(([, item]) => item.status === "INCOMPLETE");
  const blockedItems = setupEntries.filter(([, item]) => item.status === "BLOCKED");
  const summary = getSetupSummary(
    setupEntries.length,
    completedItems.length,
    incompleteItems.length,
    blockedItems.length,
  );
  const checklist = [
    { label: "Base de setup cargada", done: setupEntries.length > 0 },
    { label: "Sin bloqueos críticos", done: blockedItems.length === 0 },
    { label: "Al menos un paso completo", done: completedItems.length > 0 },
    { label: "Próximos pasos visibles", done: (data?.data.nextSteps.length ?? 0) > 0 || incompleteItems.length === 0 },
  ];

  return (
    <section aria-labelledby="setup-heading" className="overview-page">
      <h1 id="setup-heading">Setup Wizard</h1>
      <StateView
        isLoading={isLoading}
        error={error as Error | null}
        onRetry={() => void refetch()}
      >
        {data && (
          <>
            <article className={`overview-priority overview-priority--${summary.tone}`}>
              <div className="overview-priority__copy">
                <span className="overview-priority__eyebrow">Prioridad de setup</span>
                <strong>{summary.title}</strong>
                <p>{summary.message}</p>
              </div>
            </article>

            <dl className="kpi-grid">
              <div>
                <dt>Pasos</dt>
                <dd>{setupEntries.length}</dd>
              </div>
              <div>
                <dt>Completos</dt>
                <dd>{completedItems.length}</dd>
              </div>
              <div>
                <dt>Incompletos</dt>
                <dd>{incompleteItems.length}</dd>
              </div>
              <div>
                <dt>Bloqueados</dt>
                <dd>{blockedItems.length}</dd>
              </div>
            </dl>

            <article className="overview-card">
              <h2>Checklist de preparación</h2>
              <div className="overview-checklist">
                {checklist.map((step) => (
                  <div key={step.label} className={`overview-check ${step.done ? "overview-check--done" : ""}`}>
                    <strong>{step.done ? "✓" : "•"}</strong>
                    <span>{step.label}</span>
                  </div>
                ))}
              </div>
            </article>

            <section className="profile-module-grid" aria-label="Estado del setup">
              {setupEntries.map(([code, item]) => {
                const status = describeSetupStatus(item.status);
                return (
                  <article key={code} className="profile-card">
                    <p className="profile-eyebrow">{status.label}</p>
                    <h2>{LABELS[code] ?? code}</h2>
                    <p>
                      Progreso <strong>{item.count}</strong> de <strong>{item.required}</strong>
                    </p>
                    <p>{status.message}</p>
                  </article>
                );
              })}
            </section>

            <article className="overview-card">
              <h2>Detalle del checklist</h2>
              <ul className="setup-checklist">
                {setupEntries.map(([code, item]) => (
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
            </article>

            {data.data.nextSteps.length > 0 && (
              <article className="overview-card">
                <h2>Próximos pasos</h2>
                <ul>
                  {data.data.nextSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </article>
            )}
          </>
        )}
      </StateView>
    </section>
  );
}

function describeSetupStatus(status: SetupItem["status"]) {
  if (status === "COMPLETE") {
    return {
      label: "Resuelto",
      message: "Este bloque ya alcanzó el mínimo necesario para sostener el onboarding operativo.",
    };
  }

  if (status === "BLOCKED") {
    return {
      label: "Bloqueado",
      message: "Hay una dependencia o faltante que hoy impide cerrar este tramo del setup.",
    };
  }

  return {
    label: "Pendiente",
    message: "Todavía falta completar este paso para consolidar la base funcional del tenant.",
  };
}

function getSetupSummary(total: number, complete: number, incomplete: number, blocked: number) {
  if (total === 0) {
    return {
      tone: "warning" as const,
      title: "Todavía no hay setup relevado",
      message: "Conviene cargar estructura mínima para que el tenant deje de depender de configuración manual dispersa.",
    };
  }

  if (blocked > 0) {
    return {
      tone: "warning" as const,
      title: "El setup tiene bloqueos activos",
      message: `Hay ${blocked} paso(s) bloqueados. Conviene destrabarlos primero para que el resto del onboarding avance con menos fricción.`,
    };
  }

  if (incomplete > 0) {
    return {
      tone: "info" as const,
      title: "El setup está encaminado, pero todavía incompleto",
      message: `${complete} de ${total} pasos ya están resueltos. Queda cerrar la base restante para operar con menos huecos.`,
    };
  }

  return {
    tone: "success" as const,
    title: "El setup base del tenant está completo",
    message: "La configuración mínima visible ya quedó cerrada y el foco puede pasar a pulir operación y experiencia.",
  };
}
