import { useTenantQuery } from "../../lib/use-tenant-query.js";
import { StateView } from "../../components/state-view.js";
import { Link } from "react-router-dom";

interface Branch {
  id: string;
  name: string;
  code: string;
  status: string;
  timezone: string;
}

export function BranchesPage() {
  const { data, isLoading, error, refetch } = useTenantQuery<{ data: Branch[] }>(
    "branches",
    "/v1/branches",
  );
  const branches = data?.data ?? [];
  const activeBranches = branches.filter((branch) => isBranchActive(branch.status));
  const inactiveBranches = branches.filter((branch) => !isBranchActive(branch.status));
  const uniqueTimezones = new Set(branches.map((branch) => branch.timezone));
  const summary = getBranchesSummary(branches.length, activeBranches.length, inactiveBranches.length);
  const checklist = [
    { label: "Al menos una sucursal creada", done: branches.length > 0 },
    { label: "Código visible por sucursal", done: branches.every((branch) => branch.code.trim().length > 0) && branches.length > 0 },
    { label: "Zona horaria definida", done: branches.every((branch) => branch.timezone.trim().length > 0) && branches.length > 0 },
    { label: "Sucursal operable", done: activeBranches.length > 0 },
  ];
  const pendingChecklist = checklist.filter((step) => !step.done).map((step) => step.label);
  const nextStep = getBranchesNextStep({
    total: branches.length,
    active: activeBranches.length,
    inactive: inactiveBranches.length,
  });
  const branchQuickLinks = [
    {
      eyebrow: "Base",
      label: "Resumen · Puesta en marcha",
      detail: "Revisar si la estructura del tenant ya soporta abrir y operar sedes reales.",
      to: "/setup",
    },
    {
      eyebrow: "Equipo",
      label: "Usuarios · Perfiles",
      detail: "Validar qué personas y perfiles van a usar cada sucursal en operación.",
      to: "/users",
    },
    {
      eyebrow: "Experiencia",
      label: "Cliente · Host",
      detail: "Cruzar si las sucursales visibles ya sostienen discovery público y recepción operativa.",
      to: "/profiles",
    },
  ];
  const branchStageCards = [
    {
      label: "Crear",
      title: branches.length > 0 ? `${branches.length} sede(s) visible(s)` : "Falta primera sede",
      detail:
        branches.length > 0
          ? "La red de sucursales ya existe dentro del tenant."
          : "Sin una sede cargada no hay dónde aterrizar la operación real.",
      tone: branches.length > 0 ? "success" : "warning",
      to: "/branches",
    },
    {
      label: "Habilitar",
      title: activeBranches.length > 0 ? `${activeBranches.length} operable(s)` : "Ninguna activa",
      detail:
        activeBranches.length > 0
          ? "Ya hay al menos una sucursal lista para soportar flujo operativo."
          : "Conviene habilitar una sede antes de abrir más superficies.",
      tone: activeBranches.length > 0 ? "success" : "warning",
      to: "/branches",
    },
    {
      label: "Asignar",
      title: "Equipo por sede",
      detail: "El siguiente control útil es validar qué perfiles y personas usan cada sucursal.",
      tone: "info",
      to: "/users",
    },
    {
      label: "Operar",
      title: "Apps y experiencia",
      detail: "Después toca cruzar sedes con customer, host y superficies operativas.",
      tone: "info",
      to: "/profiles",
    },
  ] as const;

  return (
    <section aria-labelledby="branches-heading" className="overview-page">
      <h1 id="branches-heading">Sucursales</h1>
      <StateView
        isLoading={isLoading}
        error={error as Error | null}
        isEmpty={branches.length === 0}
        emptyMessage="Todavía no hay sucursales creadas."
        onRetry={() => void refetch()}
      >
        {branches.length > 0 && (
          <>
            <article className={`overview-priority overview-priority--${summary.tone}`}>
              <div className="overview-priority__copy">
                <span className="overview-priority__eyebrow">Estado de sedes</span>
                <strong>{summary.title}</strong>
                <p>{summary.message}</p>
              </div>
            </article>

            <dl className="kpi-grid">
              <div>
                <dt>Sucursales</dt>
                <dd>{branches.length}</dd>
              </div>
              <div>
                <dt>Activas</dt>
                <dd>{activeBranches.length}</dd>
              </div>
              <div>
                <dt>A revisar</dt>
                <dd>{inactiveBranches.length}</dd>
              </div>
              <div>
                <dt>Zonas horarias</dt>
                <dd>{uniqueTimezones.size}</dd>
              </div>
            </dl>

            <article className="overview-card">
              <h2>Checklist operacional</h2>
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
                  : "La lectura base de sedes ya está completa y lista para seguir afinando operación y experiencia pública."}
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
              <h2>Ciclo de sedes</h2>
              <div className="owner-stage-grid">
                {branchStageCards.map((card) => (
                  <Link key={card.label} className={`owner-stage-card owner-stage-card--${card.tone}`} to={card.to}>
                    <span>{card.label}</span>
                    <strong>{card.title}</strong>
                    <p>{card.detail}</p>
                  </Link>
                ))}
              </div>
            </article>

            <section className="profile-module-grid" aria-label="Resumen de sucursales">
              {branches.map((branch) => {
                const status = describeBranchStatus(branch.status);
                return (
                  <article key={branch.id} className="profile-card">
                    <p className="profile-eyebrow">{status.label}</p>
                    <h2>{branch.name}</h2>
                    <p>
                      Código <strong>{branch.code}</strong>
                    </p>
                    <p>
                      Zona horaria <strong>{branch.timezone}</strong>
                    </p>
                    <p>{status.message}</p>
                  </article>
                );
              })}
            </section>

            <article className="overview-card">
              <h2>Atajos relacionados</h2>
              <div className="overview-link-grid">
                {branchQuickLinks.map((link) => (
                  <Link key={link.label} className="overview-link-card" to={link.to}>
                    <span>{link.eyebrow}</span>
                    <strong>{link.label}</strong>
                    <p>{link.detail}</p>
                  </Link>
                ))}
              </div>
            </article>

            <article className="overview-card">
              <h2>Detalle tabular</h2>
              <table>
                <caption className="sr-only">Listado de sucursales</caption>
                <thead>
                  <tr>
                    <th scope="col">Nombre</th>
                    <th scope="col">Código</th>
                    <th scope="col">Zona horaria</th>
                    <th scope="col">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {branches.map((branch) => (
                    <tr key={branch.id}>
                      <td>{branch.name}</td>
                      <td>{branch.code}</td>
                      <td>{branch.timezone}</td>
                      <td>{branch.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>
          </>
        )}
      </StateView>
    </section>
  );
}

function normalizeBranchStatus(status: string) {
  return status.trim().toUpperCase();
}

function isBranchActive(status: string) {
  const normalized = normalizeBranchStatus(status);
  return normalized === "ACTIVE" || normalized === "OPEN" || normalized === "ENABLED";
}

function describeBranchStatus(status: string) {
  if (isBranchActive(status)) {
    return {
      label: "Operable",
      message: "La sucursal aparece en estado apto para formar parte del circuito operativo visible.",
    };
  }

  return {
    label: "Revisar habilitación",
    message: "Conviene validar setup, publicación o disponibilidad antes de tomarla como sede operativa.",
  };
}

function getBranchesSummary(total: number, active: number, inactive: number) {
  if (total === 0) {
    return {
      tone: "warning" as const,
      title: "Faltan sucursales para operar",
      message: "Sin al menos una sede cargada no hay base real para reservas, floor, host ni operación diaria.",
    };
  }

  if (active === 0) {
    return {
      tone: "warning" as const,
      title: "Hay sucursales creadas, pero ninguna activa",
      message: "La estructura existe, aunque todavía no se ve una sede plenamente lista para operar.",
    };
  }

  if (inactive > 0) {
    return {
      tone: "info" as const,
      title: "Red de sucursales visible con pendientes",
      message: `Hay ${inactive} sucursal(es) para revisar antes de considerarlas operativas en todos los flujos.`,
    };
  }

  return {
    tone: "success" as const,
    title: "Estructura de sucursales lista",
    message: "Las sedes visibles ya muestran base suficiente para seguir afinando experiencia pública y operación interna.",
  };
}

function getBranchesNextStep({
  total,
  active,
  inactive,
}: {
  total: number;
  active: number;
  inactive: number;
}) {
  if (total === 0) {
    return {
      eyebrow: "Expansión",
      label: "Crear primera sucursal",
      detail: "Sin una sede cargada no se puede conectar discovery, reservas, host, floor ni caja con una operación real.",
      to: "/branches",
    };
  }

  if (active === 0) {
    return {
      eyebrow: "Habilitación",
      label: "Activar una sede operable",
      detail: "La estructura existe, pero todavía falta que al menos una sucursal quede lista para soportar operación visible.",
      to: "/branches",
    };
  }

  if (inactive > 0) {
    return {
      eyebrow: "Normalización",
      label: "Revisar sedes pendientes",
      detail: "Conviene resolver estados incompletos antes de tratarlas como sedes usables por apps operativas o customer.",
      to: "/branches",
    };
  }

  return {
    eyebrow: "Siguiente control",
    label: "Cruzar sedes con perfiles y apps",
    detail: "Con las sucursales operables, el próximo paso útil es validar qué perfiles y superficies van a consumir cada sede.",
    to: "/profiles",
  };
}
