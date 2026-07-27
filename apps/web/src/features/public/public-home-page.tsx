import { Link } from "react-router-dom";

export function PublicHomePage() {
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
          <Link to="/public/reservations/new" className="public-secondary-cta">
            Reservar
          </Link>
        </div>
      </div>

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
            <Link key={route.to} to={route.to} className="public-route-card public-route-card--accent">
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
        <ol className="public-route-list">
          <li>Explorá menú, sucursales y promos.</li>
          <li>Chequeá disponibilidad pública.</li>
          <li>Si querés reservar, avanzá con login y creación de reserva.</li>
          <li>Después administrás tus reservas desde la experiencia autenticada.</li>
        </ol>
      </article>
    </section>
  );
}
