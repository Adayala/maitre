import { Navigate, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "./auth-context.js";
import { useTenantContext } from "./tenant-context.js";

const NAV_ITEMS = [
  { to: "/organizacion", label: "Organización" },
  { to: "/overview", label: "Overview" },
  { to: "/setup", label: "Setup" },
  { to: "/subscription", label: "Suscripción" },
  { to: "/fiscal", label: "Fiscal / ARCA" },
  { to: "/audit", label: "Auditoría" },
  { to: "/settings", label: "Configuración" },
];

export function DashboardLayout() {
  const { accessToken, email, signOut } = useAuth();
  const { me, selectedTenantId, isLoading } = useTenantContext();
  const activeTenant = me?.tenants.find((tenant) => tenant.id === selectedTenantId);

  if (!accessToken) return <Navigate to="/login" replace />;
  if (isLoading) return <p role="status" className="state-view state-view--loading">Cargando contexto…</p>;
  if (!selectedTenantId) return <Navigate to="/select-tenant" replace />;

  return (
    <div className="dash-shell">
      <header className="dash-header">
        <span className="dash-brand">Maitre Dash</span>
        <div className="dash-tenant-context">
          <span><small>Tenant activo</small>{activeTenant?.name ?? "Tenant"}</span>
          {me && me.tenants.length > 1 ? <NavLink to="/select-tenant">Cambiar</NavLink> : null}
        </div>
        <span className="dash-user">{email ?? me?.user.displayName ?? ""}</span>
        <button type="button" onClick={() => void signOut()}>
          Salir
        </button>
      </header>

      <nav aria-label="Navegación principal" className="dash-nav">
        <ul>
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to}>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <main id="main-content" className="dash-main">
        <Outlet />
      </main>
    </div>
  );
}
