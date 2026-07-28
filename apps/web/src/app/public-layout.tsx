import { NavLink, Outlet } from "react-router-dom";
import {
  prefetchOnIntent,
  preloadLoginExperience,
  preloadReservationCreationExperience,
  preloadReservationManagementExperience,
} from "../lib/route-prefetch.js";

const PUBLIC_NAV_ITEMS = [
  { to: "/public", label: "Inicio", end: true },
  { to: "/public/menu", label: "Menú" },
  { to: "/public/branches", label: "Sucursales" },
  { to: "/public/promotions", label: "Promociones" },
  { to: "/public/availability", label: "Disponibilidad" },
  {
    to: "/public/reservations",
    label: "Mis reservas",
    prefetchProps: prefetchOnIntent(preloadReservationManagementExperience),
  },
];

export function PublicLayout() {
  const loginPrefetchProps = prefetchOnIntent(preloadLoginExperience);
  const reservePrefetchProps = prefetchOnIntent(preloadReservationCreationExperience);

  return (
    <div className="public-shell">
      <header className="public-header">
        <NavLink to="/public" end className="public-brand">
          Maitre Public
        </NavLink>
        <nav aria-label="Navegación pública" className="public-nav">
          {PUBLIC_NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} {...item.prefetchProps}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="public-actions">
          <NavLink to="/login" {...loginPrefetchProps}>
            Ingresar
          </NavLink>
          <NavLink to="/public/reservations/new" className="public-cta" {...reservePrefetchProps}>
            Reservar
          </NavLink>
        </div>
      </header>

      <main id="main-content" className="public-main">
        <section className="public-access-strip" aria-label="Cómo usar la experiencia pública">
          <article className="public-access-card">
            <span>Sin login</span>
            <strong>Menú, promociones y sucursales</strong>
            <p>La experiencia pública sirve para explorar antes de decidir.</p>
          </article>
          <article className="public-access-card">
            <span>Con login</span>
            <strong>Reservar y gestionar tu visita</strong>
            <p>Cuando el cliente quiere avanzar a una reserva, recién ahí pedimos sesión.</p>
          </article>
        </section>
        <Outlet />
      </main>
    </div>
  );
}
