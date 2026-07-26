import { Link } from "react-router-dom";

export function PublicHomePage() {
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
    </section>
  );
}
