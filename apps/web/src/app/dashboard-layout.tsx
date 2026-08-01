import {
  Navigate,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { OrganizationSidebar } from "../features/organization/organization-sidebar.js";
import {
  organizationNodeFromSearch,
  organizationNodeHref,
} from "../features/organization/org-explorer-model.js";
import { useAuth } from "./auth-context.js";
import { useTenantContext } from "./tenant-context.js";

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
  const { me, selectedTenantId, isLoading } = useTenantContext();
  const location = useLocation();
  const navigate = useNavigate();
  const activeTenant = me?.tenants.find(
    (tenant) => tenant.id === selectedTenantId,
  );
  const selectedOrganizationNode = organizationNodeFromSearch(location.search);

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
            <small>Tenant activo</small>
            {activeTenant?.name ?? "Tenant"}
          </span>
          {me && me.tenants.length > 1 ? (
            <NavLink to="/select-tenant">Cambiar</NavLink>
          ) : null}
        </div>
        <span className="dash-user">{email ?? me?.user.displayName ?? ""}</span>
        <button type="button" onClick={() => void signOut()}>
          Salir
        </button>
      </header>

      <nav aria-label="Navegación principal" className="dash-nav">
        <OrganizationSidebar
          tenantName={activeTenant?.name ?? "Tenant activo"}
          selectedNode={selectedOrganizationNode}
          onSelect={(node) => navigate(organizationNodeHref(node))}
        />
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
