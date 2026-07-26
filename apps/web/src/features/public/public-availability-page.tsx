import { Link } from "react-router-dom";

export function PublicAvailabilityPage() {
  return (
    <section className="public-page" aria-labelledby="public-availability-heading">
      <h1 id="public-availability-heading">Disponibilidad</h1>
      <p>
        Consulta pública resumida. Esta pantalla prepara la future surface de availability sin
        exponer mesas internas ni datos sensibles.
      </p>
      <div className="public-card">
        <p>
          Estado actual del shell: aún no consulta backend público; cuando se materialice, mostrará
          slots o disponibilidad resumida por sucursal.
        </p>
      </div>
      <Link to="/public/reservations/new" className="public-cta">
        Continuar con reserva
      </Link>
    </section>
  );
}
