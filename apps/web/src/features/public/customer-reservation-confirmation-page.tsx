import { Link, Navigate, useLocation } from "react-router-dom";

interface ReservationDetail {
  id: string;
  branchId: string;
  partySize: number;
  startAt: string;
  durationMinutes: number;
  status: string;
  notes?: string;
}

export function CustomerReservationConfirmationPage() {
  const location = useLocation();
  const reservation = location.state as ReservationDetail | undefined;

  if (!reservation) {
    return <Navigate to="/public/reservations/new" replace />;
  }

  return (
    <section className="public-page" aria-labelledby="customer-reservation-confirmation-heading">
      <h1 id="customer-reservation-confirmation-heading">Reserva creada</h1>
      <p>Tu solicitud de reserva quedó creada correctamente.</p>

      <div className="public-card-grid">
        <article className="public-card">
          <h2>Estado</h2>
          <p>{reservationStatusLabel(reservation.status)}</p>
        </article>
        <article className="public-card">
          <h2>Fecha y hora</h2>
          <p>{new Date(reservation.startAt).toLocaleString("es-AR")}</p>
        </article>
        <article className="public-card">
          <h2>Comensales</h2>
          <p>{reservation.partySize}</p>
        </article>
        <article className="public-card">
          <h2>Duración</h2>
          <p>{reservation.durationMinutes} minutos</p>
        </article>
      </div>

      {reservation.notes ? (
        <article className="public-card">
          <h2>Notas</h2>
          <p>{reservation.notes}</p>
        </article>
      ) : null}

      <div className="public-button-row">
        <Link to="/public/reservations" className="public-secondary-cta">
          Ver mis reservas
        </Link>
        <Link to="/public" className="public-secondary-cta">
          Volver al inicio
        </Link>
        <Link to="/public/menu" className="public-cta">
          Seguir explorando
        </Link>
      </div>
    </section>
  );
}

function reservationStatusLabel(status: string) {
  switch (status) {
    case "PENDING":
      return "Pendiente";
    case "CONFIRMED":
      return "Confirmada";
    case "SEATED":
      return "Sentada";
    case "COMPLETED":
      return "Completada";
    case "CANCELLED":
      return "Cancelada";
    case "NO_SHOW":
      return "No-show";
    default:
      return status;
  }
}
