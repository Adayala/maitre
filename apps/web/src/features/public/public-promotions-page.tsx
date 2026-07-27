import { Link } from "react-router-dom";

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
      </div>

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
            <Link to={promotion.to} className="public-secondary-cta">
              {promotion.cta}
            </Link>
          </article>
        ))}
      </div>

      <div className="public-button-row">
        <Link to="/public/reservations/new" className="public-cta">
          Reservar con promoción
        </Link>
        <Link to="/public/menu" className="public-secondary-cta">
          Explorar menú
        </Link>
      </div>
    </section>
  );
}
