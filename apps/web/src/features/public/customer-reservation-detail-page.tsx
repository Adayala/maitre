import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../app/auth-context.js";
import { useTenantContext } from "../../app/tenant-context.js";
import { apiRequest } from "../../lib/api-client.js";
import {
  prefetchOnIntent,
  preloadReservationCreationExperience,
  preloadReservationManagementExperience,
} from "../../lib/route-prefetch.js";

interface ReservationDetail {
  data: {
    id: string;
    branchId: string;
    partySize: number;
    startAt: string;
    durationMinutes: number;
    status: string;
    notes?: string;
    visitId?: string;
  };
}

export function CustomerReservationDetailPage() {
  const reservePrefetchProps = prefetchOnIntent(preloadReservationCreationExperience);
  const reservationsPrefetchProps = prefetchOnIntent(preloadReservationManagementExperience);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const { me, selectedTenantId } = useTenantContext();
  const selectedTenant = me?.tenants.find((tenant) => tenant.id === selectedTenantId) ?? null;
  const branches = selectedTenant?.branches ?? [];
  const branchNameById = new Map(branches.map((branch) => [branch.id, `${branch.name} (${branch.code})`] as const));

  const reservationQuery = useQuery({
    queryKey: ["customer-reservation-detail", selectedTenantId, id],
    queryFn: () =>
      apiRequest<ReservationDetail>(`/v1/my/reservations/${id}`, {
        accessToken: accessToken!,
        tenantId: selectedTenantId!,
      }),
    enabled: Boolean(accessToken && selectedTenantId && id),
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      return apiRequest<ReservationDetail>(`/v1/reservations/${id}/cancel`, {
        accessToken: accessToken!,
        tenantId: selectedTenantId!,
        method: "POST",
        body: { reasonCode: "GUEST_REQUEST" },
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["customer-reservations"] });
      await queryClient.invalidateQueries({ queryKey: ["customer-reservation-detail", selectedTenantId, id] });
    },
  });

  const reservation = reservationQuery.data?.data;
  const detailNextAction = reservation ? getReservationDetailNextAction(reservation.status, Boolean(reservation.visitId)) : null;
  const detailChecklist = reservation
    ? [
        { label: "La reserva quedó ubicada", done: Boolean(reservation.id) },
        { label: "La fecha y hora están claras", done: Boolean(reservation.startAt) },
        { label: "La sucursal está identificada", done: Boolean(reservation.branchId) },
        {
          label: "La reserva todavía admite cancelación",
          done: reservation.status === "PENDING" || reservation.status === "CONFIRMED",
        },
      ]
    : [];
  const detailPending = detailChecklist.filter((step) => !step.done).map((step) => step.label);
  const detailRoutes = reservation
    ? [
        {
          badge: "Volver al seguimiento",
          title: "Ver todas mis reservas",
          description: "Ideal para revisar próximas visitas, historial y cambios recientes en un solo lugar.",
          to: "/public/reservations",
          cta: "Ir a mis reservas",
          prefetch: reservationsPrefetchProps,
        },
        {
          badge: "Nueva planificación",
          title: "Crear otra reserva",
          description: "Útil si querés organizar otra visita o reemplazar una reserva cancelada.",
          to: "/public/reservations/new",
          cta: "Nueva reserva",
          accent: reservation.status === "CANCELLED" || reservation.status === "COMPLETED",
          prefetch: reservePrefetchProps,
        },
        {
          badge: "Contexto adicional",
          title: "Explorar sucursales",
          description: "Si cambió la sede o querés comparar otra opción, podés volver al listado público.",
          to: "/public/branches",
          cta: "Ver sucursales",
        },
      ]
    : [];

  return (
    <section className="public-page" aria-labelledby="customer-reservation-detail-heading">
      <div className="public-button-row">
        <Link to="/public/reservations" className="public-secondary-cta" {...reservationsPrefetchProps}>
          Volver a mis reservas
        </Link>
      </div>

      <h1 id="customer-reservation-detail-heading">Detalle de reserva</h1>

      {reservationQuery.isLoading ? <p role="status">Cargando detalle…</p> : null}
      {reservationQuery.error ? (
        <p role="alert" className="login-error">
          {reservationQuery.error instanceof Error ? reservationQuery.error.message : "No se pudo cargar la reserva"}
        </p>
      ) : null}

      {reservation ? (
        <>
          {detailNextAction ? (
            <article className="public-card public-info-card">
              <strong>{detailNextAction.title}</strong>
              <p>{detailNextAction.message}</p>
              <div className="public-detail-list">
                {detailNextAction.items.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </article>
          ) : null}

          <article className="public-card">
            <h2>Qué revisar antes de salir de esta pantalla</h2>
            <div className="public-checklist">
              {detailChecklist.map((step) => (
                <div key={step.label} className={`public-check-item ${step.done ? "public-check-item--done" : ""}`}>
                  <strong>{step.done ? "✓" : "•"}</strong>
                  <span>{step.label}</span>
                </div>
              ))}
            </div>
            <p className="public-field-hint">
              {detailPending.length > 0
                ? `Ya no aplica o quedó pendiente revisar: ${detailPending.join(", ")}.`
                : "El detalle ya tiene todo lo necesario para seguir o cerrar esta gestión con claridad."}
            </p>
          </article>

          <article className="public-card">
            <h2>Atajos relacionados</h2>
            <div className="public-route-grid">
              {detailRoutes.map((route) => (
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
            <article className="public-card">
              <h2>Sucursal</h2>
              <p>{branchNameById.get(reservation.branchId) ?? reservation.branchId.slice(0, 8)}</p>
            </article>
          </div>

          {reservation.notes ? (
            <article className="public-card">
              <h2>Notas</h2>
              <p>{reservation.notes}</p>
            </article>
          ) : null}

          <div className="public-button-row">
            <Link to="/public/reservations/new" className="public-secondary-cta" {...reservePrefetchProps}>
              Crear otra
            </Link>
            {reservation.status === "PENDING" || reservation.status === "CONFIRMED" ? (
              <button
                type="button"
                className="public-button-danger"
                disabled={cancelMutation.isPending}
                onClick={() => void cancelMutation.mutateAsync()}
              >
                {cancelMutation.isPending ? "Cancelando…" : "Cancelar reserva"}
              </button>
            ) : null}
            <button
              type="button"
              className="public-button-primary"
              {...reservationsPrefetchProps}
              onClick={() => navigate("/public/reservations")}
            >
              Ver todas
            </button>
          </div>

          {cancelMutation.error ? (
            <p role="alert" className="login-error">
              {cancelMutation.error instanceof Error ? cancelMutation.error.message : "No se pudo cancelar la reserva"}
            </p>
          ) : null}
        </>
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

function getReservationDetailNextAction(status: string, hasVisit: boolean) {
  if (status === "PENDING") {
    return {
      title: "La reserva sigue pendiente",
      message: "Todavía puede cambiar de estado. Conviene seguirla desde Mis reservas y conservar los datos de fecha y sucursal.",
      items: ["Revisar el estado antes de la visita", "Conservar fecha, hora y sucursal", "Cancelar sólo si ya no la necesitás"],
    };
  }

  if (status === "CONFIRMED") {
    return {
      title: "La reserva está confirmada",
      message: "Ahora el foco pasa a presentarte a horario y usar este detalle como referencia rápida.",
      items: ["Verificar hora y comensales", "Usar este detalle como referencia", "Cancelar sólo si cambió el plan"],
    };
  }

  if (status === "SEATED") {
    return {
      title: "La visita ya fue tomada por el local",
      message: hasVisit
        ? "La reserva ya derivó en una visita activa dentro del restaurante."
        : "La reserva ya fue tomada por el local y debería estar en curso.",
      items: ["La gestión ya pasó al local", "No hace falta cancelar", "Conservá este registro como referencia"],
    };
  }

  if (status === "CANCELLED") {
    return {
      title: "La reserva está cancelada",
      message: "Si querés volver a visitar el restaurante, el siguiente paso natural es crear una nueva reserva.",
      items: ["Podés crear otra reserva", "Revisá historial para contexto", "Volvé a explorar menú o sucursales"],
    };
  }

  return {
    title: "Seguimiento de reserva",
    message: "Esta pantalla te sirve para consultar el estado actual y decidir si necesitás crear otra reserva.",
    items: ["Revisar estado actual", "Consultar historial si hace falta", "Crear otra reserva cuando corresponda"],
  };
}
