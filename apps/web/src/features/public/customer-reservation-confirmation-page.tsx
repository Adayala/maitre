import { Link, Navigate, useLocation } from "react-router-dom";
import {
  prefetchOnIntent,
  preloadReservationCreationExperience,
  preloadReservationManagementExperience,
} from "../../lib/route-prefetch.js";

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
  const reservePrefetchProps = prefetchOnIntent(preloadReservationCreationExperience);
  const reservationsPrefetchProps = prefetchOnIntent(preloadReservationManagementExperience);
  const location = useLocation();
  const reservation = location.state as ReservationDetail | undefined;
  const confirmationNextAction = getConfirmationNextAction(reservation?.status ?? "");

  if (!reservation) {
    return <Navigate to="/public/reservations/new" replace />;
  }

  return (
    <section className="public-page" aria-labelledby="customer-reservation-confirmation-heading">
      <h1 id="customer-reservation-confirmation-heading">Reserva creada</h1>
      <p>Tu solicitud de reserva quedó creada correctamente.</p>

      <article className="public-card public-info-card">
        <strong>{confirmationNextAction.title}</strong>
        <p>{confirmationNextAction.message}</p>
        <div className="public-checklist">
          {confirmationNextAction.steps.map((step) => (
            <div key={step} className="public-check-item public-check-item--done">
              <strong>✓</strong>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </article>

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
        <Link to="/public/reservations" className="public-secondary-cta" {...reservationsPrefetchProps}>
          Ver mis reservas
        </Link>
        <Link to="/public" className="public-secondary-cta">
          Volver al inicio
        </Link>
        <Link to="/public/menu" className="public-cta" {...reservePrefetchProps}>
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

function getConfirmationNextAction(status: string) {
  if (status === "CONFIRMED") {
    return {
      title: "La reserva ya quedó confirmada",
      message: "Ahora conviene revisar el detalle, guardar la información y seguir el estado desde Mis reservas.",
      steps: ["Guardá fecha y hora", "Revisá el detalle de la reserva", "Volvé a Mis reservas para seguimiento"],
    };
  }

  return {
    title: "La reserva quedó creada y en seguimiento",
    message: "Dependiendo del flujo del local, puede requerir confirmación posterior. Desde Mis reservas vas a poder ver cambios o cancelarla.",
    steps: ["Verificá fecha, cantidad y notas", "Entrá a Mis reservas para seguir el estado", "Si hace falta, creá otra reserva"],
  };
}
