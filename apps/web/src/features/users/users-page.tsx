import { useState, type FormEvent } from "react";
import { useTenantQuery } from "../../lib/use-tenant-query.js";
import { StateView } from "../../components/state-view.js";
import { apiRequest } from "../../lib/api-client.js";
import { useAuth } from "../../app/auth-context.js";
import { useTenantContext } from "../../app/tenant-context.js";

interface UserListItem {
  id: string;
  email: string | null;
  name: string;
  status: string;
  roleIds: string[];
}

interface RoleListItem {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export function UsersPage() {
  const { accessToken } = useAuth();
  const { selectedTenantId } = useTenantContext();
  const { data, isLoading, error, refetch } = useTenantQuery<{ data: UserListItem[] }>(
    "users",
    "/v1/users",
  );
  const { data: rolesData } = useTenantQuery<{ data: RoleListItem[] }>("roles", "/v1/roles");
  const roles = rolesData?.data ?? [];
  const users = data?.data ?? [];
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("role_employee");
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
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

  async function inviteUser(e: FormEvent) {
    e.preventDefault();
    if (!accessToken || !selectedTenantId) return;
    setMutationError(null);
    setIsSaving(true);
    try {
      await apiRequest("/v1/users", {
        accessToken,
        tenantId: selectedTenantId,
        method: "POST",
        body: { name, email, roleIds: [roleId] },
      });
      setName("");
      setEmail("");
      await refetch();
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : "No se pudo crear la invitación");
    } finally {
      setIsSaving(false);
    }
  }

  async function updateUser(user: UserListItem, membershipStatus: "ACTIVE" | "SUSPENDED" | "REVOKED") {
    if (!accessToken || !selectedTenantId) return;
    setMutationError(null);
    setIsSaving(true);
    try {
      await apiRequest(`/v1/users/${user.id}`, {
        accessToken,
        tenantId: selectedTenantId,
        method: "PATCH",
        body: { membershipStatus },
      });
      await refetch();
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : "No se pudo actualizar el usuario");
    } finally {
      setIsSaving(false);
    }
  }

  async function updateUserRole(user: UserListItem, nextRoleId: string) {
    if (!accessToken || !selectedTenantId) return;
    setMutationError(null);
    setIsSaving(true);
    try {
      await apiRequest(`/v1/users/${user.id}`, {
        accessToken,
        tenantId: selectedTenantId,
        method: "PATCH",
        body: { roleIds: [nextRoleId] },
      });
      await refetch();
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : "No se pudo actualizar el perfil");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section aria-labelledby="users-heading" className="overview-page">
      <div>
        <h1 id="users-heading">Usuarios y perfiles</h1>
        <p>Invitá personas, revisá sus accesos y consultá qué puede hacer cada perfil operativo.</p>
      </div>
      <StateView
        isLoading={isLoading}
        error={error as Error | null}
        onRetry={() => void refetch()}
      >
        <>
            <article className="overview-card">
              <h2>Invitar usuario</h2>
              <form className="user-management-form" onSubmit={inviteUser}>
                <label>
                  Nombre
                  <input required value={name} onChange={(event) => setName(event.target.value)} />
                </label>
                <label>
                  Email
                  <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                </label>
                <label>
                  Perfil inicial
                  <select value={roleId} onChange={(event) => setRoleId(event.target.value)}>
                    {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
                  </select>
                </label>
                <button type="submit" disabled={isSaving}>{isSaving ? "Guardando…" : "Crear invitación"}</button>
              </form>
              <p>El acceso al tenant se habilita al aceptar la invitación; iniciar con Google no asigna permisos automáticamente.</p>
              {mutationError ? <p role="alert" className="login-error">{mutationError}</p> : null}
            </article>

          {users.length > 0 ? (
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
              <h2>Detalle tabular</h2>
              <table>
                <caption className="sr-only">Listado de usuarios</caption>
                <thead>
                  <tr>
                    <th scope="col">Nombre</th>
                    <th scope="col">Email</th>
                    <th scope="col">Roles</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Gestionar acceso</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email ?? "—"}</td>
                      <td>{user.roleIds.length > 0 ? user.roleIds.map((id) => roles.find((role) => role.id === id)?.name ?? id).join(", ") : "—"}</td>
                      <td>{user.status}</td>
                      <td>
                        <div className="user-table-actions">
                          <select
                            aria-label={`Perfil de ${user.name}`}
                            value={user.roleIds[0] ?? ""}
                            disabled={isSaving || normalizeStatus(user.status) === "REVOKED"}
                            onChange={(event) => void updateUserRole(user, event.target.value)}
                          >
                            <option value="" disabled>Elegir perfil</option>
                            {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
                          </select>
                          <select
                            aria-label={`Estado de ${user.name}`}
                            value={normalizeEditableStatus(user.status)}
                            disabled={isSaving || normalizeStatus(user.status) === "REVOKED"}
                            onChange={(event) => void updateUser(user, event.target.value as "ACTIVE" | "SUSPENDED" | "REVOKED")}
                          >
                            {isPendingStatus(user.status) ? <option value="INVITED">Invitado</option> : null}
                            <option value="ACTIVE">Activo</option>
                            {normalizeStatus(user.status) !== "INVITED" ? <option value="SUSPENDED">Suspendido</option> : null}
                            <option value="REVOKED">Revocado</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>
          </>
          ) : (
            <article className="overview-priority overview-priority--warning">
              <div className="overview-priority__copy">
                <span className="overview-priority__eyebrow">Equipo pendiente</span>
                <strong>Todavía no hay usuarios invitados</strong>
                <p>Creá la primera invitación para comenzar a asignar accesos operativos.</p>
              </div>
            </article>
          )}

          <article className="overview-card">
            <h2>Catálogo de perfiles</h2>
            <p>Estos perfiles agrupan permisos; la autorización efectiva también considera tenant y sucursal.</p>
            <div className="profile-module-grid">
              {roles.map((role) => (
                <article className="profile-card" key={role.id}>
                  <p className="profile-eyebrow">{role.id}</p>
                  <h3>{role.name}</h3>
                  <p>{translateRoleDescription(role)}</p>
                  <p><strong>{role.permissions.includes("*") ? "Acceso total" : `${role.permissions.length} capacidades`}</strong></p>
                </article>
              ))}
            </div>
          </article>
        </>
      </StateView>
    </section>
  );
}

function normalizeEditableStatus(status: string) {
  const normalized = normalizeStatus(status);
  if (normalized === "INVITED" || normalized === "PENDING") return "INVITED";
  if (normalized === "SUSPENDED") return "SUSPENDED";
  if (normalized === "REVOKED") return "REVOKED";
  return "ACTIVE";
}

function translateRoleDescription(role: RoleListItem) {
  const descriptions: Record<string, string> = {
    role_owner: "Control completo del negocio, configuración y operación.",
    role_admin: "Gestiona estructura, usuarios, catálogo y operación diaria.",
    role_manager: "Supervisa la operación y resuelve excepciones del turno.",
    role_maitre: "Coordina salón, mesas, reservas y lista de espera.",
    role_waiter: "Atiende mesas, toma pedidos y sigue el servicio.",
    role_cashier: "Opera caja, cobros y conciliación del turno.",
    role_cook: "Gestiona la preparación y entrega desde cocina.",
    role_customer: "Acceso del cliente a sus experiencias y reservas.",
  };
  return descriptions[role.id] ?? role.description;
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
