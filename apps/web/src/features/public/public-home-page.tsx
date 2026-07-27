import { Link } from "react-router-dom";
import {
  prefetchOnIntent,
  preloadReservationCreationExperience,
  preloadReservationManagementExperience,
} from "../../lib/route-prefetch.js";

export function PublicHomePage() {
  const reservePrefetchProps = prefetchOnIntent(preloadReservationCreationExperience);
  const reservationsPrefetchProps = prefetchOnIntent(preloadReservationManagementExperience);
  const journeySteps = [
    { label: "Explorar", value: "Menú, promos y sucursales" },
    { label: "Evaluar", value: "Disponibilidad y sede" },
    { label: "Reservar", value: "Con login y seguimiento" },
    { label: "Gestionar", value: "Mis reservas" },
  ];
  const guestRoutes = [
    {
      title: "Menú",
      description: "Explorar categorías, productos y precios visibles sin iniciar sesión.",
      to: "/public/menu",
      cta: "Ver menú",
    },
    {
      title: "Sucursales",
      description: "Comparar sedes, contactos y disponibilidad resumida por ubicación.",
      to: "/public/branches",
      cta: "Ver sucursales",
    },
    {
      title: "Promociones",
      description: "Descubrir campañas, editoriales o beneficios públicos activos.",
      to: "/public/promotions",
      cta: "Ver promos",
    },
    {
      title: "Disponibilidad",
      description: "Consultar el estado público antes de empezar una reserva.",
      to: "/public/availability",
      cta: "Consultar",
    },
  ];

  const authenticatedRoutes = [
    {
      title: "Reservar",
      description: "Crear una reserva con tus datos, preferencias y seguimiento posterior.",
      to: "/public/reservations/new",
      cta: "Empezar reserva",
    },
    {
      title: "Mis reservas",
      description: "Ver, confirmar o cancelar reservas ya creadas desde tu perfil.",
      to: "/public/reservations",
      cta: "Ver mis reservas",
    },
  ];

  return (
    <section className="public-page" aria-labelledby="public-home-heading">
      <div className="public-hero-card">
        <p className="profile-eyebrow">Experiencia pública</p>
        <h1 id="public-home-heading">Descubrí el restaurante antes de iniciar sesión</h1>
        <p>
          Esta app pública separa discovery y operación: acá el cliente puede ver menú, sucursales,
          promociones y luego iniciar el flujo de reserva.
        </p>
        <div className="public-button-row">
          <Link to="/public/menu" className="public-cta">
            Ver menú
          </Link>
          <Link to="/public/reservations/new" className="public-secondary-cta" {...reservePrefetchProps}>
            Reservar
          </Link>
        </div>
        <div className="public-journey-strip" aria-label="Recorrido sugerido">
          {journeySteps.map((step) => (
            <div key={step.label} className="public-journey-pill">
              <span>{step.label}</span>
              <strong>{step.value}</strong>
            </div>
          ))}
        </div>
      </div>

      <article className="public-card public-info-card">
        <strong>Siguiente paso sugerido</strong>
        <p>
          Si la persona todavía está decidiendo, conviene empezar por menú o sucursales. La
          reserva entra recién cuando ya eligió sede y horario probable.
        </p>
        <div className="public-detail-list">
          <span><strong>Primer clic sugerido:</strong> Ver menú</span>
          <span><strong>Segundo paso:</strong> Comparar sucursales</span>
          <span><strong>Tercer paso:</strong> Pasar a reserva autenticada</span>
        </div>
      </article>

      <article className="public-card">
        <h2>Qué podés hacer sin login</h2>
        <p>
          La parte pública funciona como vidriera operativa: permite descubrir la propuesta y evaluar si querés avanzar.
        </p>
        <div className="public-route-grid">
          {guestRoutes.map((route) => (
            <Link key={route.to} to={route.to} className="public-route-card">
              <div className="public-route-meta">
                <span className="public-route-badge">Sin login</span>
                <h3>{route.title}</h3>
              </div>
              <p>{route.description}</p>
              <span className="public-route-link">{route.cta}</span>
            </Link>
          ))}
        </div>
      </article>

      <article className="public-card">
        <h2>Cuándo pasás a experiencia autenticada</h2>
        <p>
          Cuando querés operar sobre tu reserva, el sistema te pide identidad para guardar contexto, historial y cambios.
        </p>
        <div className="public-route-grid">
          {authenticatedRoutes.map((route) => (
            <Link
              key={route.to}
              to={route.to}
              className="public-route-card public-route-card--accent"
              {...(route.to.endsWith("/new") ? reservePrefetchProps : reservationsPrefetchProps)}
            >
              <div className="public-route-meta">
                <span className="public-route-badge public-route-badge--accent">Requiere login</span>
                <h3>{route.title}</h3>
              </div>
              <p>{route.description}</p>
              <span className="public-route-link">{route.cta}</span>
            </Link>
          ))}
        </div>
      </article>

      <article className="public-card">
        <h2>Recorrido recomendado</h2>
        <div className="public-checklist">
          <div className="public-check-item public-check-item--done">
            <strong>1</strong>
            <span>Explorá menú, sucursales y promos.</span>
          </div>
          <div className="public-check-item public-check-item--done">
            <strong>2</strong>
            <span>Chequeá disponibilidad pública.</span>
          </div>
          <div className="public-check-item">
            <strong>3</strong>
            <span>Si querés reservar, avanzá con login y creación de reserva.</span>
          </div>
          <div className="public-check-item">
            <strong>4</strong>
            <span>Después administrás tus reservas desde la experiencia autenticada.</span>
          </div>
        </div>
      </article>
    </section>
  );
}
