import { Navigate, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "./auth-context.js";
import { useTenantContext } from "./tenant-context.js";

const NAV_ITEMS = [
  { to: "/", label: "Overview", end: true },
  { to: "/setup", label: "Setup" },
  { to: "/brands", label: "Marcas" },
  { to: "/branches", label: "Sucursales" },
  { to: "/users", label: "Usuarios" },
  { to: "/subscription", label: "Suscripción" },
  { to: "/profiles", label: "Perfiles" },
  { to: "/audit", label: "Auditoría" },
  { to: "/settings", label: "Configuración" },
];

export function DashboardLayout() {
  const { accessToken, email, signOut } = useAuth();
  const { me, selectedTenantId, selectTenant, isLoading } = useTenantContext();
  const tenantChecklist = [
    { label: "Sesión iniciada", done: Boolean(accessToken) },
    { label: "Tenant disponible", done: (me?.tenants.length ?? 0) > 0 },
    { label: "Tenant seleccionado", done: Boolean(selectedTenantId) },
  ];

  if (!accessToken) return <Navigate to="/login" replace />;

  return (
    <div className="dash-shell">
      <header className="dash-header">
        <span className="dash-brand">Maitre Dash</span>
        {me && me.tenants.length > 1 && (
          <label>
            Tenant:
            <select
              value={selectedTenantId ?? ""}
              onChange={(e) => selectTenant(e.target.value)}
            >
              <option value="" disabled>
                Elegir tenant
              </option>
              {me.tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <span className="dash-user">{email ?? me?.user.displayName ?? ""}</span>
        <button type="button" onClick={() => void signOut()}>
          Salir
        </button>
      </header>

      <nav aria-label="Navegación principal" className="dash-nav">
        <ul>
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} end={item.end}>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <main id="main-content" className="dash-main">
        {isLoading ? (
          <p role="status">Cargando contexto…</p>
        ) : !selectedTenantId ? (
          <section className="overview-page" aria-label="Contexto pendiente">
            <article className="overview-priority overview-priority--info">
              <div className="overview-priority__copy">
                <span className="overview-priority__eyebrow">Contexto pendiente</span>
                <strong>No hay un tenant seleccionado</strong>
                <p>
                  El backoffice ya está listo, pero todavía falta elegir con qué tenant querés operar esta sesión.
                </p>
              </div>
            </article>

            <article className="overview-card">
              <h2>Qué falta para entrar al dashboard</h2>
              <div className="overview-checklist">
                {tenantChecklist.map((step) => (
                  <div key={step.label} className={`overview-check ${step.done ? "overview-check--done" : ""}`}>
                    <strong>{step.done ? "✓" : "•"}</strong>
                    <span>{step.label}</span>
                  </div>
                ))}
              </div>
              <p>
                Si arriba ves más de un tenant, elegí uno desde el selector para habilitar Overview, Setup y el resto del backoffice.
              </p>
            </article>
          </section>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}
