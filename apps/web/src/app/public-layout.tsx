import { NavLink, Outlet } from "react-router-dom";

const PUBLIC_NAV_ITEMS = [
  { to: "/public", label: "Inicio", end: true },
  { to: "/public/menu", label: "Menú" },
  { to: "/public/branches", label: "Sucursales" },
  { to: "/public/promotions", label: "Promociones" },
  { to: "/public/availability", label: "Disponibilidad" },
  { to: "/public/reservations", label: "Mis reservas" },
];

export function PublicLayout() {
  return (
    <div className="public-shell">
      <header className="public-header">
        <NavLink to="/public" end className="public-brand">
          Maitre Public
        </NavLink>
        <nav aria-label="Navegación pública" className="public-nav">
          {PUBLIC_NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="public-actions">
          <NavLink to="/login">Ingresar</NavLink>
          <NavLink to="/public/reservations/new" className="public-cta">
            Reservar
          </NavLink>
        </div>
      </header>

      <main id="main-content" className="public-main">
        <Outlet />
      </main>
    </div>
  );
}
