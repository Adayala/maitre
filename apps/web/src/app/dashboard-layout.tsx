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
          <p role="alert">No hay un tenant seleccionado.</p>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}
