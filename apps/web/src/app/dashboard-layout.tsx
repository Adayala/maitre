import { Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./auth-context.js";
import { useTenantContext } from "./tenant-context.js";
import { useBrandSelection } from "./brand-selection-context.js";
import { useBrandPresentation } from "@maitre/brand-presentation";

const NAV_GROUPS = [
  {
    index: "02",
    label: "Control operativo",
    defaultOpen: true,
    items: [
      { to: "/overview", label: "Overview" },
      { to: "/setup", label: "Setup" },
    ],
  },
  {
    index: "03",
    label: "Gobierno",
    defaultOpen: false,
    items: [
      { to: "/subscription", label: "Suscripción" },
      { to: "/fiscal", label: "Fiscal / ARCA" },
      { to: "/audit", label: "Auditoría" },
      { to: "/settings", label: "Configuración" },
    ],
  },
];

export function DashboardLayout() {
  const { accessToken, email, signOut } = useAuth();
  const { me, selectedTenantId, clearTenant, isLoading } = useTenantContext();
  const { selectedBrandId, clearBrand } = useBrandSelection();
  const presentation = useBrandPresentation();
  const location = useLocation();
  const activeTenant = me?.tenants.find(
    (tenant) => tenant.id === selectedTenantId,
  );

  if (!accessToken) return <Navigate to="/login" replace />;
  if (isLoading)
    return (
      <p role="status" className="state-view state-view--loading">
        Cargando contexto…
      </p>
    );
  if (!selectedTenantId) return <Navigate to="/select-tenant" replace />;

  return (
    <div className="dash-shell">
      <header className="dash-header">
        <span className="dash-brand">Maitre Dash</span>
        <div className="dash-tenant-context">
          <span>
            <small>Trabajando en</small>
            {activeTenant?.name ?? "Tenant"}
          </span>
          <NavLink to="/select-tenant">Cambiar tenant</NavLink>
        </div>
        <div
          className="dash-theme-context"
          role="group"
          aria-label="Apariencia activa"
        >
          <span>
            <small>Apariencia</small>
            <strong>
              {selectedBrandId
                ? (presentation.identity.shortName ??
                  presentation.identity.displayName ??
                  "Marca seleccionada")
                : "Maitre base"}
            </strong>
          </span>
          {selectedBrandId ? (
            <button type="button" onClick={clearBrand}>
              Usar tema base
            </button>
          ) : null}
        </div>
        <span className="dash-user">{email ?? me?.user.displayName ?? ""}</span>
        <button
          type="button"
          onClick={() => {
            clearTenant();
            void signOut();
          }}
        >
          Salir
        </button>
      </header>

      <nav aria-label="Navegación principal" className="dash-nav">
        <NavLink className="dash-nav__organization-link" to="/organizacion">
          <span>01 / Configuración</span>
          <strong>Organización</strong>
          <small>Marcas, sucursales, salones y equipo</small>
        </NavLink>
        <ul className="dash-nav__groups">
          {NAV_GROUPS.map((group) => (
            <li key={group.label}>
              <details
                className="dash-nav__group"
                open={
                  group.defaultOpen ||
                  group.items.some((item) => item.to === location.pathname)
                }
              >
                <summary>
                  <span>{group.index}</span>
                  {group.label}
                </summary>
                <ul>
                  {group.items.map((item) => (
                    <li key={item.to}>
                      <NavLink to={item.to}>{item.label}</NavLink>
                    </li>
                  ))}
                </ul>
              </details>
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
