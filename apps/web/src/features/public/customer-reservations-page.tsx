import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../app/auth-context.js";
import { useTenantContext } from "../../app/tenant-context.js";
import { apiRequest } from "../../lib/api-client.js";

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

      {reservationsQuery.isLoading ? <p role="status">Cargando reservas…</p> : null}
      {reservationsQuery.error ? (
        <p role="alert" className="login-error">
          {reservationsQuery.error instanceof Error ? reservationsQuery.error.message : "No se pudieron cargar las reservas"}
        </p>
      ) : null}

      {!reservationsQuery.isLoading && !reservationsQuery.error && reservationsQuery.data?.length === 0 ? (
        <div className="public-card">
          <p>Todavía no hay reservas para este contexto.</p>
          <Link to="/public/reservations/new" className="public-cta">
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
