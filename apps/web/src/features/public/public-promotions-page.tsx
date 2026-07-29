import { Link } from "react-router-dom";
import {
  prefetchOnIntent,
  preloadReservationCreationExperience,
} from "../../lib/route-prefetch.js";

const PUBLIC_PROMOTIONS = [
  {
    id: "happy-hour",
    title: "Happy hour de barra",
    summary: "Beneficio ideal para discovery público: deja ver propuesta y momento recomendado de visita.",
    schedule: "Lunes a viernes · 18:00 a 20:00",
    scope: "Participan sucursales adheridas",
    cta: "Ver sucursales",
    to: "/public/branches",
  },
  {
    id: "executive-menu",
    title: "Menú ejecutivo",
    summary: "Formato editorial para comunicar una propuesta acotada de mediodía sin exponer pricing interno sensible.",
    schedule: "Lunes a viernes · mediodía",
    scope: "Sujeto a disponibilidad",
    cta: "Ver menú",
    to: "/public/menu",
  },
  {
    id: "celebrations",
    title: "Reservas para celebraciones",
    summary: "Camino público para detectar intención de reserva con ocasión especial antes del login.",
    schedule: "Todos los días",
    scope: "Coordinación posterior al crear reserva",
    cta: "Reservar",
    to: "/public/reservations/new",
  },
];

export function PublicPromotionsPage() {
  const reservePrefetchProps = prefetchOnIntent(preloadReservationCreationExperience);
  const promotionJourney = [
    "Descubrí una promo o propuesta pública.",
    "Chequeá si te conviene por sede, horario o tipo de visita.",
    "Cuando ya decidiste, pasá a reserva o seguí explorando menú.",
  ];
  const promotionsChecklist = [
    { label: "Hay campañas visibles para discovery", done: PUBLIC_PROMOTIONS.length > 0 },
    { label: "Cada promo deriva a un siguiente paso claro", done: PUBLIC_PROMOTIONS.every((promotion) => Boolean(promotion.to)) },
    {
      label: "Existe una salida directa a reserva",
      done: PUBLIC_PROMOTIONS.some((promotion) => promotion.to === "/public/reservations/new"),
    },
  ];
  const promotionsPending = promotionsChecklist
    .filter((step) => !step.done)
    .map((step) => step.label);
  const promotionRoutes = [
    {
      badge: "Conversión",
      title: "Reservar con intención clara",
      description: "Si la promoción ya convenció al cliente, este es el siguiente paso más corto.",
      to: "/public/reservations/new",
      cta: "Reservar ahora",
      accent: true,
      prefetch: reservePrefetchProps,
    },
    {
      badge: "Comparación",
      title: "Volver al menú",
      description: "Sirve para contrastar la promo con la carta real antes de decidir.",
      to: "/public/menu",
      cta: "Explorar menú",
    },
    {
      badge: "Elección de sede",
      title: "Revisar sucursales",
      description: "Ideal para confirmar en qué sede conviene aprovechar la propuesta.",
      to: "/public/branches",
      cta: "Ver sucursales",
    },
  ];

  return (
    <section className="public-page" aria-labelledby="public-promotions-heading">
      <h1 id="public-promotions-heading">Promociones</h1>
      <p>
        Esta surface pública hoy es editorial: muestra campañas y propuestas de discovery sin depender de login ni de
        APIs internas.
      </p>

      <div className="public-card public-info-card">
        <strong>Cómo funciona hoy</strong>
        <p>
          Las promociones públicas todavía no tienen backend dedicado. Mientras tanto, la experiencia se mantiene
          honesta: informa beneficios posibles y dirige al cliente al siguiente paso correcto.
        </p>
        <div className="public-checklist">
          {promotionJourney.map((step, index) => (
            <div key={step} className={`public-check-item ${index === 0 ? "public-check-item--done" : ""}`}>
              <strong>{index === 0 ? "✓" : index + 1}</strong>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>

      <article className="public-card">
        <h2>Siguiente paso recomendado</h2>
        <div className="public-checklist">
          {promotionsChecklist.map((step) => (
            <div key={step.label} className={`public-check-item ${step.done ? "public-check-item--done" : ""}`}>
              <strong>{step.done ? "✓" : "•"}</strong>
              <span>{step.label}</span>
            </div>
          ))}
        </div>
        <p className="public-field-hint">
          {promotionsPending.length > 0
            ? `Todavía falta cerrar: ${promotionsPending.join(", ")}.`
            : "La experiencia ya deja claro cómo pasar de discovery a comparación o reserva."}
        </p>
      </article>

      <article className="public-card">
        <h2>Cómo avanzar desde una promoción</h2>
        <div className="public-route-grid">
          {promotionRoutes.map((route) => (
            <Link
              key={route.to}
              to={route.to}
              className={`public-route-card ${route.accent ? "public-route-card--accent" : ""}`}
              {...(route.prefetch ?? {})}
            >
              <div className="public-route-meta">
                <span className={`public-route-badge ${route.accent ? "public-route-badge--accent" : ""}`}>
                  {route.badge}
                </span>
                <h3>{route.title}</h3>
              </div>
              <p>{route.description}</p>
              <span className="public-route-link">{route.cta}</span>
            </Link>
          ))}
        </div>
      </article>

      <div className="public-card-grid">
        {PUBLIC_PROMOTIONS.map((promotion) => (
          <article key={promotion.id} className="public-card">
            <div className="public-route-meta">
              <span className="public-route-badge">Editorial pública</span>
              <h2>{promotion.title}</h2>
            </div>
            <p>{promotion.summary}</p>
            <div className="public-detail-list">
              <span>
                <strong>Vigencia:</strong> {promotion.schedule}
              </span>
              <span>
                <strong>Alcance:</strong> {promotion.scope}
              </span>
            </div>
            <Link
              to={promotion.to}
              className="public-secondary-cta"
              {...(promotion.to === "/public/reservations/new" ? reservePrefetchProps : {})}
            >
              {promotion.cta}
            </Link>
          </article>
        ))}
      </div>

      <div className="public-button-row">
        <Link to="/public/reservations/new" className="public-cta" {...reservePrefetchProps}>
          Reservar con promoción
        </Link>
        <Link to="/public/menu" className="public-secondary-cta">
          Explorar menú
        </Link>
      </div>
    </section>
  );
}
