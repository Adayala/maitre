import { useTenantQuery } from "../../lib/use-tenant-query.js";
import { StateView } from "../../components/state-view.js";
import { Link } from "react-router-dom";

interface UserListItem {
  id: string;
  email: string | null;
  name: string;
  status: string;
  roleIds: string[];
}

export function UsersPage() {
  const { data, isLoading, error, refetch } = useTenantQuery<{ data: UserListItem[] }>(
    "users",
    "/v1/users",
  );
  const users = data?.data ?? [];
  const activeUsers = users.filter((user) => isActiveStatus(user.status));
  const pendingUsers = users.filter((user) => isPendingStatus(user.status));
  const usersWithoutRoles = users.filter((user) => user.roleIds.length === 0);
  const uniqueRoles = new Set(users.flatMap((user) => user.roleIds));
  const summary = getUsersSummary(users.length, activeUsers.length, pendingUsers.length, usersWithoutRoles.length);
  const checklist = [
    { label: "Equipo invitado", done: users.length > 0 },
    { label: "Al menos un usuario activo", done: activeUsers.length > 0 },
    { label: "Roles asignados", done: usersWithoutRoles.length === 0 && users.length > 0 },
    { label: "Invitaciones visibles", done: users.length === 0 || pendingUsers.length >= 0 },
  ];
  const pendingChecklist = checklist.filter((step) => !step.done).map((step) => step.label);
  const nextStep = getUsersNextStep({
    total: users.length,
    active: activeUsers.length,
    pending: pendingUsers.length,
    withoutRoles: usersWithoutRoles.length,
  });
  const userQuickLinks = [
    {
      eyebrow: "Perfiles",
      label: "Profiles",
      detail: "Cruzar el equipo actual con las superficies y roles operativos definidos para el tenant.",
      to: "/profiles",
    },
    {
      eyebrow: "Estructura",
      label: "Branches",
      detail: "Verificar si ya existen las sedes donde este equipo va a operar.",
      to: "/branches",
    },
    {
      eyebrow: "Gobierno",
      label: "Settings / Subscription",
      detail: "Alinear quién opera el tenant con capacidades y configuración activas.",
      to: "/settings",
    },
  ];
  const userStageCards = [
    {
      label: "Invitar",
      title: users.length > 0 ? "Equipo cargado" : "Falta invitar equipo",
      detail:
        users.length > 0
          ? "Ya existe una base de personas para el tenant."
          : "El owner todavía necesita sumar las primeras personas clave.",
      tone: users.length > 0 ? "success" : "warning",
      to: "/users",
    },
    {
      label: "Activar",
      title: activeUsers.length > 0 ? `${activeUsers.length} activo(s)` : "Nadie operativo todavía",
      detail:
        activeUsers.length > 0
          ? "Ya hay usuarios que pueden entrar al backoffice o a las apps."
          : "Todavía falta que alguien complete activación para operar.",
      tone: activeUsers.length > 0 ? "success" : "warning",
      to: "/users",
    },
    {
      label: "Asignar",
      title: usersWithoutRoles.length > 0 ? `${usersWithoutRoles.length} sin rol` : "Roles cubiertos",
      detail:
        usersWithoutRoles.length > 0
          ? "Conviene completar roles antes de desplegar apps por perfil."
          : "La asignación de responsabilidades ya es consistente.",
      tone: usersWithoutRoles.length > 0 ? "warning" : "success",
      to: "/profiles",
    },
    {
      label: "Distribuir",
      title: "Perfiles y sucursales",
      detail: "El siguiente control útil es validar cómo se reparte el equipo por app y sede.",
      tone: "info",
      to: "/branches",
    },
  ] as const;

  return (
    <section aria-labelledby="users-heading" className="overview-page">
      <h1 id="users-heading">Usuarios</h1>
      <StateView
        isLoading={isLoading}
        error={error as Error | null}
        isEmpty={users.length === 0}
        emptyMessage="Todavía no hay usuarios invitados."
        onRetry={() => void refetch()}
      >
        {users.length > 0 && (
          <>
            <article className={`overview-priority overview-priority--${summary.tone}`}>
              <div className="overview-priority__copy">
                <span className="overview-priority__eyebrow">Estado del equipo</span>
                <strong>{summary.title}</strong>
                <p>{summary.message}</p>
              </div>
            </article>

            <dl className="kpi-grid">
              <div>
                <dt>Usuarios</dt>
                <dd>{users.length}</dd>
              </div>
              <div>
                <dt>Activos</dt>
                <dd>{activeUsers.length}</dd>
              </div>
              <div>
                <dt>Invitaciones pendientes</dt>
                <dd>{pendingUsers.length}</dd>
              </div>
              <div>
                <dt>Roles distintos</dt>
                <dd>{uniqueRoles.size}</dd>
              </div>
            </dl>

            <article className="overview-card">
              <h2>Checklist de habilitación</h2>
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
                  : "La base del equipo ya está visible y lista para seguir afinando acceso por perfil."}
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
              <h2>Ciclo del equipo</h2>
              <div className="owner-stage-grid">
                {userStageCards.map((card) => (
                  <Link key={card.label} className={`owner-stage-card owner-stage-card--${card.tone}`} to={card.to}>
                    <span>{card.label}</span>
                    <strong>{card.title}</strong>
                    <p>{card.detail}</p>
                  </Link>
                ))}
              </div>
            </article>

            <section className="profile-module-grid" aria-label="Resumen de usuarios">
              {users.map((user) => {
                const status = describeUserStatus(user.status);
                return (
                  <article key={user.id} className="profile-card">
                    <p className="profile-eyebrow">{status.label}</p>
                    <h2>{user.name}</h2>
                    <p>{user.email ?? "Sin email visible"}</p>
                    <p>
                      Roles: <strong>{user.roleIds.length > 0 ? user.roleIds.join(", ") : "Sin roles asignados"}</strong>
                    </p>
                    <p>{status.message}</p>
                  </article>
                );
              })}
            </section>

            <article className="overview-card">
              <h2>Atajos relacionados</h2>
              <div className="overview-link-grid">
                {userQuickLinks.map((link) => (
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
                <caption className="sr-only">Listado de usuarios</caption>
                <thead>
                  <tr>
                    <th scope="col">Nombre</th>
                    <th scope="col">Email</th>
                    <th scope="col">Roles</th>
                    <th scope="col">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email ?? "—"}</td>
                      <td>{user.roleIds.length > 0 ? user.roleIds.join(", ") : "—"}</td>
                      <td>{user.status}</td>
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

function normalizeStatus(status: string) {
  return status.trim().toUpperCase();
}

function isActiveStatus(status: string) {
  const normalized = normalizeStatus(status);
  return normalized === "ACTIVE" || normalized === "ENABLED";
}

function isPendingStatus(status: string) {
  const normalized = normalizeStatus(status);
  return normalized === "INVITED" || normalized === "PENDING";
}

function describeUserStatus(status: string) {
  if (isActiveStatus(status)) {
    return {
      label: "Operativo",
      message: "Este usuario ya puede participar del flujo de trabajo según sus roles asignados.",
    };
  }

  if (isPendingStatus(status)) {
    return {
      label: "Pendiente",
      message: "Todavía falta que complete activación o aceptación para empezar a operar.",
    };
  }

  return {
    label: "Revisar acceso",
    message: "El estado no parece plenamente operativo; conviene validar invitación, baja o permisos.",
  };
}

function getUsersSummary(total: number, active: number, pending: number, withoutRoles: number) {
  if (total === 0) {
    return {
      tone: "warning" as const,
      title: "Todavía no hay equipo cargado",
      message: "Antes de operar conviene invitar al menos a quienes van a administrar, atender sala o ejecutar caja/cocina.",
    };
  }

  if (active === 0) {
    return {
      tone: "warning" as const,
      title: "Hay usuarios, pero nadie activo",
      message: "El tenant tiene personas registradas, aunque todavía no aparece ningún usuario listo para operar.",
    };
  }

  if (withoutRoles > 0) {
    return {
      tone: "info" as const,
      title: "El equipo existe, pero faltan roles",
      message: `Hay ${withoutRoles} usuario(s) sin roles asignados. Conviene completar eso antes de usar apps por perfil.`,
    };
  }

  if (pending > 0) {
    return {
      tone: "info" as const,
      title: "Equipo casi listo",
      message: `Quedan ${pending} invitación(es) pendientes de activación para cerrar el armado del equipo.`,
    };
  }

  return {
    tone: "success" as const,
    title: "Equipo cargado y visible",
    message: "Ya se ve una base de usuarios operativa con roles asignados para seguir afinando el backoffice.",
  };
}

function getUsersNextStep({
  total,
  active,
  pending,
  withoutRoles,
}: {
  total: number;
  active: number;
  pending: number;
  withoutRoles: number;
}) {
  if (total === 0) {
    return {
      eyebrow: "Onboarding",
      label: "Invitar primer equipo",
      detail: "Antes de operar conviene cargar al menos las personas clave de owner/admin y los primeros perfiles operativos.",
      to: "/profiles",
    };
  }

  if (active === 0) {
    return {
      eyebrow: "Activación",
      label: "Conseguir primer usuario activo",
      detail: "El equipo existe, pero todavía falta que alguien complete activación para poder operar el tenant.",
      to: "/users",
    };
  }

  if (withoutRoles > 0) {
    return {
      eyebrow: "RBAC operativo",
      label: "Asignar roles faltantes",
      detail: "Completá roles para evitar usuarios visibles sin superficie o responsabilidad clara dentro de las apps.",
      to: "/profiles",
    };
  }

  if (pending > 0) {
    return {
      eyebrow: "Cierre de onboarding",
      label: "Completar invitaciones pendientes",
      detail: "Queda equipo por activar; conviene cerrar ese pendiente antes de considerar el tenant plenamente armado.",
      to: "/users",
    };
  }

  return {
    eyebrow: "Siguiente control",
    label: "Cruzar equipo con perfiles y sedes",
    detail: "Con el equipo visible y activo, el próximo paso útil es validar cómo se distribuye por app, perfil y sucursal.",
    to: "/branches",
  };
}
