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
  const confirmationChecklist = reservation
    ? [
        { label: "La reserva se creó correctamente", done: Boolean(reservation.id) },
        { label: "La fecha y hora quedaron registradas", done: Boolean(reservation.startAt) },
        { label: "La cantidad de comensales quedó definida", done: reservation.partySize > 0 },
        {
          label: "La reserva ya está confirmada por el local",
          done: reservation.status === "CONFIRMED",
        },
      ]
    : [];
  const confirmationPending = confirmationChecklist
    .filter((step) => !step.done)
    .map((step) => step.label);

  if (!reservation) {
    return <Navigate to="/public/reservations/new" replace />;
  }

  const confirmationRoutes = [
    {
      badge: "Seguimiento",
      title: "Ver mis reservas",
      description: "Ahí vas a poder seguir el estado, abrir el detalle o cancelar si todavía aplica.",
      to: "/public/reservations",
      cta: "Ir a mis reservas",
      accent: true,
      prefetch: reservationsPrefetchProps,
    },
    {
      badge: "Exploración",
      title: "Seguir viendo el menú",
      description: "Podés aprovechar para revisar platos, promos o definir mejor la próxima visita.",
      to: "/public/menu",
      cta: "Explorar menú",
    },
    {
      badge: "Otra visita",
      title: "Crear otra reserva",
      description: "Útil si querés organizar otra salida sin tener que volver a empezar desde cero.",
      to: "/public/reservations/new",
      cta: "Nueva reserva",
      prefetch: reservePrefetchProps,
    },
  ];

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

      <article className="public-card">
        <h2>Siguiente paso recomendado</h2>
        <div className="public-checklist">
          {confirmationChecklist.map((step) => (
            <div key={step.label} className={`public-check-item ${step.done ? "public-check-item--done" : ""}`}>
              <strong>{step.done ? "✓" : "•"}</strong>
              <span>{step.label}</span>
            </div>
          ))}
        </div>
        <p className="public-field-hint">
          {confirmationPending.length > 0
            ? `Todavía no quedó resuelto: ${confirmationPending.join(", ")}. Lo mejor ahora es seguir la reserva desde Mis reservas.`
            : "La reserva ya quedó bien armada y lista para seguimiento."}
        </p>
      </article>

      <article className="public-card">
        <h2>Qué podés hacer ahora</h2>
        <div className="public-route-grid">
          {confirmationRoutes.map((route) => (
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
