import { useEffect, useState } from "react";
import { Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./auth-context.js";
import { useTenantContext } from "./tenant-context.js";
import { useBrandSelection } from "./brand-selection-context.js";
import { useBrandPresentation } from "@maitre/brand-presentation";
import {
  DASHBOARD_SIDEBAR_STORAGE_KEY,
  dashboardSidebarPreference,
  resolveDashboardSidebarCollapsed,
} from "./dashboard-sidebar-model.js";

const NAV_GROUPS = [
  {
    index: "02",
    label: "Control operativo",
    defaultOpen: true,
    items: [
      { to: "/overview", label: "Overview", glyph: "OV" },
      { to: "/setup", label: "Setup", glyph: "ST" },
    ],
  },
  {
    index: "03",
    label: "Gobierno",
    defaultOpen: false,
    items: [
      { to: "/subscription", label: "Suscripción", glyph: "SU" },
      { to: "/fiscal", label: "Fiscal / ARCA", glyph: "AR" },
      { to: "/audit", label: "Auditoría", glyph: "AU" },
      { to: "/settings", label: "Configuración", glyph: "CO" },
    ],
  },
];

export function DashboardLayout() {
  const { accessToken, email, signOut } = useAuth();
  const { me, selectedTenantId, clearTenant, isLoading } = useTenantContext();
  const { selectedBrandId, clearBrand } = useBrandSelection();
  const presentation = useBrandPresentation();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() =>
    resolveDashboardSidebarCollapsed(
      window.localStorage.getItem(DASHBOARD_SIDEBAR_STORAGE_KEY),
    ),
  );
  const activeTenant = me?.tenants.find(
    (tenant) => tenant.id === selectedTenantId,
  );

  useEffect(() => {
    window.localStorage.setItem(
      DASHBOARD_SIDEBAR_STORAGE_KEY,
      dashboardSidebarPreference(isSidebarCollapsed),
    );
  }, [isSidebarCollapsed]);

  if (!accessToken) return <Navigate to="/login" replace />;
  if (isLoading)
    return (
      <p role="status" className="state-view state-view--loading">
        Cargando contexto…
      </p>
    );
  if (!selectedTenantId) return <Navigate to="/select-tenant" replace />;

  return (
    <div
      className={`dash-shell${isSidebarCollapsed ? " dash-shell--nav-collapsed" : ""}`}
    >
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
        <button
          type="button"
          className="dash-nav__collapse"
          aria-expanded={!isSidebarCollapsed}
          aria-controls="dashboard-navigation-content"
          title={isSidebarCollapsed ? "Expandir panel" : "Contraer panel"}
          onClick={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
        >
          <span aria-hidden="true">{isSidebarCollapsed ? "›" : "‹"}</span>
          <strong>
            {isSidebarCollapsed ? "Expandir panel" : "Contraer panel"}
          </strong>
        </button>
        <div id="dashboard-navigation-content">
          <NavLink
            aria-label="Organización"
            className="dash-nav__organization-link"
            title={isSidebarCollapsed ? "Organización" : undefined}
            to="/organizacion"
          >
            <span className="dash-nav__organization-glyph" aria-hidden="true">
              OR
            </span>
            <span className="dash-nav__organization-copy">
              <span>01 / Configuración</span>
              <strong>Organización</strong>
              <small>Marcas, sucursales, salones y equipo</small>
            </span>
          </NavLink>
          <ul className="dash-nav__groups">
            {NAV_GROUPS.map((group) => (
              <li key={group.label}>
                <details
                  className="dash-nav__group"
                  open={
                    isSidebarCollapsed ||
                    group.defaultOpen ||
                    group.items.some((item) => item.to === location.pathname)
                  }
                >
                  <summary title={isSidebarCollapsed ? group.label : undefined}>
                    <span>{group.index}</span>
                    <strong>{group.label}</strong>
                  </summary>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item.to}>
                        <NavLink
                          aria-label={item.label}
                          title={isSidebarCollapsed ? item.label : undefined}
                          to={item.to}
                        >
                          <span
                            className="dash-nav__item-glyph"
                            aria-hidden="true"
                          >
                            {item.glyph}
                          </span>
                          <span className="dash-nav__item-label">
                            {item.label}
                          </span>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <main id="main-content" className="dash-main">
        <Outlet />
      </main>
    </div>
  );
}
