import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../app/auth-context.js";
import { useTenantContext } from "../../app/tenant-context.js";
import { apiRequest } from "../../lib/api-client.js";
import {
  prefetchOnIntent,
  preloadReservationCreationExperience,
  preloadReservationManagementExperience,
} from "../../lib/route-prefetch.js";

interface ReservationListItem {
  id: string;
  branchId: string;
  partySize: number;
  startAt: string;
  durationMinutes: number;
  status: string;
  notes?: string;
}

interface ReservationListResponse {
  data: ReservationListItem[];
}

export function CustomerReservationsPage() {
  const reservePrefetchProps = prefetchOnIntent(preloadReservationCreationExperience);
  const detailPrefetchProps = prefetchOnIntent(preloadReservationManagementExperience);
  const { accessToken } = useAuth();
  const { me, selectedTenantId } = useTenantContext();
  const selectedTenant = me?.tenants.find((tenant) => tenant.id === selectedTenantId) ?? null;
  const branches = selectedTenant?.branches ?? [];
  const branchNameById = new Map(branches.map((branch) => [branch.id, `${branch.name} (${branch.code})`] as const));

  const reservationsQuery = useQuery({
    queryKey: ["customer-reservations", selectedTenantId],
    queryFn: async () => {
      const response = await apiRequest<ReservationListResponse>("/v1/my/reservations", {
        accessToken: accessToken!,
        tenantId: selectedTenantId!,
      });
      return response.data;
    },
    enabled: Boolean(accessToken && selectedTenantId),
  });

  const sortedReservations = (reservationsQuery.data ?? [])
    .slice()
    .sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt));
  const upcomingReservations = sortedReservations.filter(
    (reservation) =>
      Date.parse(reservation.startAt) >= Date.now() &&
      reservation.status !== "CANCELLED" &&
      reservation.status !== "NO_SHOW",
  );
  const historyReservations = sortedReservations
    .filter(
      (reservation) =>
        Date.parse(reservation.startAt) < Date.now() ||
        reservation.status === "CANCELLED" ||
        reservation.status === "NO_SHOW",
    )
    .reverse();
  const nextReservation = upcomingReservations[0] ?? null;
  const reservationsNextAction = getReservationsNextAction({
    hasUpcoming: upcomingReservations.length > 0,
    hasHistory: historyReservations.length > 0,
    nextReservationStatus: nextReservation?.status ?? null,
  });
  const reservationsChecklist = [
    { label: "Hay una próxima reserva para seguir", done: Boolean(nextReservation) },
    { label: "La próxima reserva quedó identificada", done: Boolean(nextReservation?.id) },
    { label: "Existe historial para reutilizar contexto", done: historyReservations.length > 0 },
  ];
  const reservationsPending = reservationsChecklist
    .filter((step) => !step.done)
    .map((step) => step.label);
  const reservationRoutes = [
    nextReservation
      ? {
          badge: "Seguimiento inmediato",
          title: "Abrir la próxima reserva",
          description:
            nextReservation.status === "PENDING"
              ? "Conviene revisar si cambió de estado antes de la visita."
              : "Entrá al detalle para reconfirmar fecha, sede y notas cargadas.",
          to: `/public/reservations/${nextReservation.id}`,
          cta: "Ver próxima reserva",
          accent: true,
          prefetch: detailPrefetchProps,
        }
      : {
          badge: "Sin próxima visita",
          title: "Crear una nueva reserva",
          description: "Si querés volver a planificar una visita, este es el siguiente paso natural.",
          to: "/public/reservations/new",
          cta: "Reservar ahora",
          accent: true,
          prefetch: reservePrefetchProps,
        },
    {
      badge: "Planificación",
      title: "Ver disponibilidad pública",
      description: "Útil si querés comparar horarios antes de confirmar una nueva salida.",
      to: "/public/availability",
      cta: "Consultar disponibilidad",
    },
    {
      badge: "Contexto",
      title: "Explorar sucursales",
      description: "Si cambió el plan, podés volver a revisar sedes y elegir una mejor opción.",
      to: "/public/branches",
      cta: "Ver sucursales",
    },
  ];

  return (
    <section className="public-page" aria-labelledby="customer-reservations-heading">
      <h1 id="customer-reservations-heading">Mis reservas</h1>
      <p>
        Vista customer-facing usando el scope actual de la sesión. Cuando exista ownership estricto
        por cliente, esta pantalla se reducirá automáticamente a sus reservas propias.
      </p>

      <article className="public-card public-info-card">
        <strong>{reservationsNextAction.title}</strong>
        <p>{reservationsNextAction.message}</p>
        <div className="public-detail-list">
          <span>
            <strong>Próximas:</strong> {upcomingReservations.length}
          </span>
          <span>
            <strong>Historial:</strong> {historyReservations.length}
          </span>
          <span>
            <strong>Estado próximo:</strong> {nextReservation ? reservationStatusLabel(nextReservation.status) : "Sin próxima reserva"}
          </span>
        </div>
      </article>

      <article className="public-card">
        <h2>Siguiente paso recomendado</h2>
        <div className="public-detail-list">
          <span>
            <strong>{reservationsNextAction.title}</strong>
          </span>
          <span>{reservationsNextAction.message}</span>
        </div>
        <div className="public-checklist">
          {reservationsChecklist.map((step) => (
            <div key={step.label} className={`public-check-item ${step.done ? "public-check-item--done" : ""}`}>
              <strong>{step.done ? "✓" : "•"}</strong>
              <span>{step.label}</span>
            </div>
          ))}
        </div>
        <p className="public-field-hint">
          {reservationsPending.length > 0
            ? `Todavía no está resuelto: ${reservationsPending.join(", ")}.`
            : "Ya tenés contexto suficiente para seguir una reserva o decidir la próxima visita."}
        </p>
      </article>

      <article className="public-card">
        <h2>Atajos según tu situación</h2>
        <div className="public-route-grid">
          {reservationRoutes.map((route) => (
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

      {reservationsQuery.isLoading ? <p role="status">Cargando reservas…</p> : null}
      {reservationsQuery.error ? (
        <p role="alert" className="login-error">
          {reservationsQuery.error instanceof Error ? reservationsQuery.error.message : "No se pudieron cargar las reservas"}
        </p>
      ) : null}

      {!reservationsQuery.isLoading && !reservationsQuery.error && reservationsQuery.data?.length === 0 ? (
        <div className="public-card">
          <p>Todavía no hay reservas para este contexto.</p>
          <Link to="/public/reservations/new" className="public-cta" {...reservePrefetchProps}>
            Crear una reserva
          </Link>
        </div>
      ) : null}

      {reservationsQuery.data?.length ? (
        <div className="public-reservations-layout">
          <article className="public-card">
            <div className="public-section-head">
              <h2>Próximas</h2>
              <span className="public-section-count">{upcomingReservations.length}</span>
            </div>
            <div className="public-reservation-list">
              {upcomingReservations.length === 0 ? (
                <div className="public-reservation-empty">
                  <strong>No tenés reservas próximas.</strong>
                  <span>Cuando generes una nueva reserva futura, la vas a ver primero acá.</span>
                </div>
              ) : (
                upcomingReservations.map((reservation) => (
                  <article key={reservation.id} className="public-reservation-card public-reservation-card--upcoming">
                    <div className="public-reservation-main">
                      <div className="public-reservation-top">
                        <strong>{new Date(reservation.startAt).toLocaleString("es-AR")}</strong>
                        <span className={`public-status-pill public-status-pill--${reservation.status.toLowerCase()}`}>
                          {reservationStatusLabel(reservation.status)}
                        </span>
                      </div>
                      <p>{reservation.partySize} pax · {reservation.durationMinutes} min</p>
                      <p>Sucursal: {branchNameById.get(reservation.branchId) ?? reservation.branchId.slice(0, 8)}</p>
                      {reservation.notes ? <p>Notas: {reservation.notes}</p> : null}
                    </div>
                    <div className="public-button-row">
                      <Link
                        to={`/public/reservations/${reservation.id}`}
                        className="public-secondary-cta"
                        {...detailPrefetchProps}
                      >
                        Ver detalle
                      </Link>
                    </div>
                  </article>
                ))
              )}
            </div>
          </article>

          <article className="public-card">
            <div className="public-section-head">
              <h2>Historial</h2>
              <span className="public-section-count">{historyReservations.length}</span>
            </div>
            <div className="public-reservation-list">
              {historyReservations.length === 0 ? (
                <div className="public-reservation-empty">
                  <strong>Sin historial todavía.</strong>
                  <span>Tus reservas pasadas o canceladas van a quedar visibles acá.</span>
                </div>
              ) : (
                historyReservations.map((reservation) => (
                  <article key={reservation.id} className="public-reservation-card public-reservation-card--history">
                    <div className="public-reservation-main">
                      <div className="public-reservation-top">
                        <strong>{new Date(reservation.startAt).toLocaleString("es-AR")}</strong>
                        <span className={`public-status-pill public-status-pill--${reservation.status.toLowerCase()}`}>
                          {reservationStatusLabel(reservation.status)}
                        </span>
                      </div>
                      <p>{reservation.partySize} pax · {reservation.durationMinutes} min</p>
                      <p>Sucursal: {branchNameById.get(reservation.branchId) ?? reservation.branchId.slice(0, 8)}</p>
                    </div>
                    <div className="public-button-row">
                      <Link
                        to={`/public/reservations/${reservation.id}`}
                        className="public-secondary-cta"
                        {...detailPrefetchProps}
                      >
                        Ver detalle
                      </Link>
                    </div>
                  </article>
                ))
              )}
            </div>
          </article>
        </div>
      ) : null}
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

function getReservationsNextAction({
  hasUpcoming,
  hasHistory,
  nextReservationStatus,
}: {
  hasUpcoming: boolean;
  hasHistory: boolean;
  nextReservationStatus: string | null;
}) {
  if (hasUpcoming) {
    return {
      title: "Ya tenés una próxima reserva",
      message:
        nextReservationStatus === "PENDING"
          ? "Conviene revisar el detalle y seguir si cambia de estado antes de la visita."
          : "Podés entrar al detalle para confirmar fecha, sucursal y cualquier nota cargada.",
    };
  }

  if (hasHistory) {
    return {
      title: "No hay próximas reservas",
      message: "Podés revisar tu historial o crear una nueva reserva para una próxima visita.",
    };
  }

  return {
    title: "Todavía no tenés reservas",
    message: "El siguiente paso natural es crear tu primera reserva desde esta experiencia pública.",
  };
}
