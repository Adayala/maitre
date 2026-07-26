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

  const reservationsQuery = useQuery({
    queryKey: ["customer-reservations", selectedTenantId, branches.map((branch) => branch.id).join(",")],
    queryFn: async () => {
      const responses = await Promise.all(
        branches.map((branch) =>
          apiRequest<ReservationListResponse>(`/v1/branches/${branch.id}/reservations`, {
            accessToken: accessToken!,
            tenantId: selectedTenantId!,
          }),
        ),
      );
      return responses.flatMap((response) => response.data);
    },
    enabled: Boolean(accessToken && selectedTenantId && branches.length > 0),
  });

  return (
    <section className="public-page" aria-labelledby="customer-reservations-heading">
      <h1 id="customer-reservations-heading">Mis reservas</h1>
      <p>
        Vista customer-facing usando el scope actual de la sesión. Cuando exista ownership estricto
        por cliente, esta pantalla se reducirá automáticamente a sus reservas propias.
      </p>

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

      <div className="public-card-grid">
        {reservationsQuery.data
          ?.slice()
          .sort((a, b) => Date.parse(b.startAt) - Date.parse(a.startAt))
          .map((reservation) => (
            <article key={reservation.id} className="public-card">
              <h2>{new Date(reservation.startAt).toLocaleString("es-AR")}</h2>
              <p>Estado: {reservation.status}</p>
              <p>Comensales: {reservation.partySize}</p>
              <p>Duración: {reservation.durationMinutes} min</p>
              <div className="public-button-row">
                <Link
                  to={`/public/reservations/${reservation.id}`}
                  className="public-secondary-cta"
                >
                  Ver detalle
                </Link>
              </div>
            </article>
          ))}
      </div>
    </section>
  );
}
