import { Link } from "react-router-dom";
import {
  prefetchOnIntent,
  preloadReservationCreationExperience,
} from "../../lib/route-prefetch.js";

export function PublicAvailabilityPage() {
  const reservePrefetchProps = prefetchOnIntent(preloadReservationCreationExperience);
  const nextSteps = [
    "Elegí primero una sucursal si todavía no la definiste.",
    "Si ya sabés cuándo querés ir, avanzá a reserva para validar capacidad real.",
    "Si todavía estás comparando, volvés a menú o sucursales sin perder contexto.",
  ];
  const availabilitySignals = [
    {
      title: "Disponibilidad resumida",
      description: "La capa pública no expone mesas internas; comunica si conviene avanzar con la reserva.",
    },
    {
      title: "Revalidación al reservar",
      description: "Cuando el cliente crea la reserva, el sistema vuelve a verificar capacidad y reglas vivas.",
    },
    {
      title: "Sin datos sensibles",
      description: "No se publican IDs de mesa, layout operativo ni estado interno del salón.",
    },
  ];
  const decisionRoutes = [
    {
      badge: "Ya sabés que querés ir",
      title: "Pasá a reserva autenticada",
      description: "La forma correcta de validar capacidad real hoy es iniciar la reserva y dejar que la API revalide en vivo.",
      to: "/public/reservations/new",
      cta: "Ir a reservar",
      prefetch: reservePrefetchProps,
    },
    {
      badge: "Todavía comparás sedes",
      title: "Volvé a sucursales",
      description: "Si la decisión depende más de ubicación o contacto, conviene resolver eso antes de reservar.",
      to: "/public/branches",
      cta: "Ver sucursales",
    },
    {
      badge: "Seguís explorando",
      title: "Revisá el menú",
      description: "Si todavía estás evaluando propuesta o estilo del lugar, podés volver al menú público sin fricción.",
      to: "/public/menu",
      cta: "Volver al menú",
    },
  ];

  return (
    <section className="public-page" aria-labelledby="public-availability-heading">
      <h1 id="public-availability-heading">Disponibilidad</h1>
      <p>
        Consulta pública resumida. Esta pantalla prepara la futura surface pública de availability sin exponer mesas
        internas ni datos sensibles.
      </p>

      <div className="public-card-grid">
        {availabilitySignals.map((signal) => (
          <article key={signal.title} className="public-card">
            <h2>{signal.title}</h2>
            <p>{signal.description}</p>
          </article>
        ))}
      </div>

      <article className="public-card public-info-card">
        <h2>Estado actual del producto</h2>
        <p>
          Hoy esta página funciona como guía previa a la reserva. El endpoint público dedicado de availability todavía
          no está materializado, así que el siguiente paso correcto es iniciar la reserva y dejar que la API valide en
          tiempo real.
        </p>
        <div className="public-checklist">
          {nextSteps.map((step, index) => (
            <div key={step} className={`public-check-item ${index === 0 ? "public-check-item--done" : ""}`}>
              <strong>{index === 0 ? "✓" : index + 1}</strong>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </article>

      <article className="public-card">
        <h2>Qué conviene hacer después</h2>
        <div className="public-route-grid">
          {decisionRoutes.map((route) => (
            <Link
              key={route.to}
              to={route.to}
              className={`public-route-card ${route.to.includes("/reservations/") ? "public-route-card--accent" : ""}`}
              {...(route.prefetch ?? {})}
            >
              <div className="public-route-meta">
                <span className={`public-route-badge ${route.to.includes("/reservations/") ? "public-route-badge--accent" : ""}`}>
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

      <div className="public-button-row">
        <Link to="/public/reservations/new" className="public-cta" {...reservePrefetchProps}>
          Continuar con reserva
        </Link>
        <Link to="/public/branches" className="public-secondary-cta">
          Ver sucursales
        </Link>
      </div>
    </section>
  );
}
