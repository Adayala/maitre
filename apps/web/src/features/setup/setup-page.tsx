import { useTenantQuery } from "../../lib/use-tenant-query.js";
import { StateView } from "../../components/state-view.js";
import { Link } from "react-router-dom";

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
  const pendingChecklist = checklist.filter((step) => !step.done).map((step) => step.label);
  const nextStep = getSetupNextStep({
    total: setupEntries.length,
    complete: completedItems.length,
    incomplete: incompleteItems.length,
    blocked: blockedItems.length,
  });
  const setupQuickLinks = [
    {
      eyebrow: "Base",
      label: "Resumen · Sucursales",
      detail: "Cruzar el estado del setup con la estructura real de sedes y visibilidad operativa.",
      to: "/branches",
    },
    {
      eyebrow: "Equipo",
      label: "Usuarios · Perfiles",
      detail: "Validar si el tenant ya tiene personas y perfiles para consumir lo que se configura.",
      to: "/users",
    },
    {
      eyebrow: "Comercial",
      label: "Suscripción · Configuración",
      detail: "Revisar capacidades y dominios de configuración que pueden destrabar el onboarding.",
      to: "/subscription",
    },
  ];
  const setupStageCards = getSetupStageCards({
    total: setupEntries.length,
    complete: completedItems.length,
    incomplete: incompleteItems.length,
    blocked: blockedItems.length,
  });

  return (
    <section aria-labelledby="setup-heading" className="overview-page">
      <h1 id="setup-heading">Puesta en marcha</h1>
      <StateView
        isLoading={isLoading}
        error={error as Error | null}
        onRetry={() => void refetch()}
      >
        {data && (
          <>
            <article className={`overview-priority overview-priority--${summary.tone}`}>
              <div className="overview-priority__copy">
                <span className="overview-priority__eyebrow">Prioridad de puesta en marcha</span>
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
              <p>
                {pendingChecklist.length > 0
                  ? `Todavía conviene resolver: ${pendingChecklist.join(", ")}.`
                  : "La base del onboarding ya está suficientemente visible para pasar a operación y afinado funcional."}
              </p>
            </article>

            <article className="overview-card">
              <h2>Siguiente paso recomendado</h2>
              <div className="overview-link-grid">
                <Link className="overview-link-card overview-link-card--primary" to={nextStep.to}>
                  <span>{nextStep.eyebrow}</span>
                  <strong>{nextStep.label}</strong>
                  <p>{nextStep.detail}</p>
                </Link>
              </div>
            </article>

            <article className="overview-card">
              <h2>Ciclo de onboarding</h2>
              <div className="owner-stage-grid">
                {setupStageCards.map((card) => (
                  <Link key={card.label} className={`owner-stage-card owner-stage-card--${card.tone}`} to={card.to}>
                    <span>{card.label}</span>
                    <strong>{card.title}</strong>
                    <p>{card.detail}</p>
                  </Link>
                ))}
              </div>
            </article>

            <section className="profile-module-grid" aria-label="Estado del setup">
              {setupEntries.map(([code, item]) => {
                const status = describeSetupStatus(item.status);
                return (
                  <Link
                    key={code}
                    className="profile-card owner-module-link"
                    to={item.actionLink ?? defaultSetupRoute(code)}
                  >
                    <p className="profile-eyebrow">{status.label}</p>
                    <h2>{LABELS[code] ?? code}</h2>
                    <p>
                      Progreso <strong>{item.count}</strong> de <strong>{item.required}</strong>
                    </p>
                    <p>{status.message}</p>
                  </Link>
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
                    <Link className="setup-item__link" to={item.actionLink ?? defaultSetupRoute(code)}>
                      Ir
                    </Link>
                  </li>
                ))}
              </ul>
            </article>

            <article className="overview-card">
              <h2>Atajos relacionados</h2>
              <div className="overview-link-grid">
                {setupQuickLinks.map((link) => (
                  <Link key={link.label} className="overview-link-card" to={link.to}>
                    <span>{link.eyebrow}</span>
                    <strong>{link.label}</strong>
                    <p>{link.detail}</p>
                  </Link>
                ))}
              </div>
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
      message: "Hay una dependencia o faltante que hoy impide cerrar este tramo de la puesta en marcha.",
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
      title: "Todavía no hay puesta en marcha relevada",
      message: "Conviene cargar estructura mínima para que el tenant deje de depender de configuración manual dispersa.",
    };
  }

  if (blocked > 0) {
    return {
      tone: "warning" as const,
      title: "La puesta en marcha tiene bloqueos activos",
      message: `Hay ${blocked} paso(s) bloqueados. Conviene destrabarlos primero para que el resto del onboarding avance con menos fricción.`,
    };
  }

  if (incomplete > 0) {
    return {
      tone: "info" as const,
      title: "La puesta en marcha está encaminada, pero todavía incompleta",
      message: `${complete} de ${total} pasos ya están resueltos. Queda cerrar la base restante para operar con menos huecos.`,
    };
  }

  return {
    tone: "success" as const,
    title: "La puesta en marcha base del tenant está completa",
    message: "La configuración mínima visible ya quedó cerrada y el foco puede pasar a pulir operación y experiencia.",
  };
}

function getSetupNextStep({
  total,
  complete,
  incomplete,
  blocked,
}: {
  total: number;
  complete: number;
  incomplete: number;
  blocked: number;
}) {
  if (total === 0) {
    return {
      eyebrow: "Onboarding",
      label: "Cargar base mínima del tenant",
      detail: "Primero conviene materializar la estructura inicial para que el tenant deje de depender de configuración manual dispersa.",
      to: "/overview",
    };
  }

  if (blocked > 0) {
    return {
      eyebrow: "Desbloqueo",
      label: "Resolver pasos bloqueados",
      detail: "Los bloqueos activos hoy frenan el resto del onboarding, así que conviene atacarlos primero.",
      to: "/settings",
    };
  }

  if (incomplete > 0) {
    return {
      eyebrow: "Cierre de base",
      label: "Completar puesta en marcha pendiente",
      detail: `Ya hay ${complete} pasos resueltos, pero todavía faltan tramos de base antes de considerar al tenant listo para operar.`,
      to: "/branches",
    };
  }

  return {
    eyebrow: "Siguiente control",
    label: "Cruzar puesta en marcha con operación real",
    detail: "Con la base completa, el próximo paso útil es validar cómo se refleja en usuarios, sedes y apps operativas.",
    to: "/profiles",
  };
}

function getSetupStageCards({
  total,
  complete,
  incomplete,
  blocked,
}: {
  total: number;
  complete: number;
  incomplete: number;
  blocked: number;
}) {
  return [
    {
      label: "Materializar",
      title: total > 0 ? `${total} bloque(s) relevado(s)` : "Falta base inicial",
      detail:
        total > 0
          ? "Ya existe una lectura estructurada de la puesta en marcha del tenant."
          : "Sin una puesta en marcha visible, el owner todavía depende de contexto disperso.",
      tone: total > 0 ? "success" : "warning",
      to: "/overview",
    },
    {
      label: "Destrabar",
      title: blocked > 0 ? `${blocked} bloqueo(s) activo(s)` : "Sin bloqueos críticos",
      detail:
        blocked > 0
          ? "Conviene resolver estos bloqueos primero para que el onboarding vuelva a avanzar."
          : "No aparecen impedimentos estructurales en la puesta en marcha base.",
      tone: blocked > 0 ? "warning" : "success",
      to: "/settings",
    },
    {
      label: "Completar",
      title: incomplete > 0 ? `${incomplete} pendiente(s)` : "Base completa",
      detail:
        incomplete > 0
          ? `Ya hay ${complete} bloques resueltos, pero todavía faltan tramos de base.`
          : "La estructura mínima visible ya quedó resuelta.",
      tone: incomplete > 0 ? "info" : "success",
      to: "/branches",
    },
    {
      label: "Operar",
      title: complete > 0 ? "Cruzar con operación real" : "Falta masa crítica",
      detail:
        complete > 0
          ? "El siguiente control útil es validar usuarios, sedes y apps contra esta base."
          : "Antes de pensar operación real, hace falta cerrar mejor el onboarding.",
      tone: complete > 0 ? "info" : "warning",
      to: "/profiles",
    },
  ] as const;
}

function defaultSetupRoute(code: string) {
  switch (code) {
    case "tenant":
      return "/overview";
    case "brands":
      return "/brands";
    case "branches":
      return "/branches";
    case "users":
      return "/users";
    case "menus":
      return "/settings";
    case "products":
      return "/settings";
    default:
      return "/setup";
  }
}
