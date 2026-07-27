import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "../../app/auth-context.js";
import { useTenantContext } from "../../app/tenant-context.js";
import { apiRequest } from "../../lib/api-client.js";

interface ReservationResponse {
  data: {
    id: string;
    branchId: string;
    partySize: number;
    startAt: string;
    durationMinutes: number;
    status: string;
    notes?: string;
  };
}

interface AvailabilityResponse {
  data: {
    asOf: string;
    timezone: string;
    freshness: "LIVE";
    startAt: string;
    durationMinutes: number;
    available: boolean;
    freeTableIds: string[];
  };
}

export function CustomerReservationPage() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const { me, selectedTenantId, selectTenant, isLoading } = useTenantContext();
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [partySize, setPartySize] = useState("2");
  const [startAt, setStartAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("90");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const availableTenants = me?.tenants ?? [];
  const resolvedTenantId = selectedTenantId ?? (availableTenants.length === 1 ? availableTenants[0]!.id : "");
  const selectedTenant = availableTenants.find((tenant) => tenant.id === resolvedTenantId) ?? null;
  const availableBranches = selectedTenant?.branches ?? [];
  const selectedBranch = availableBranches.find((branch) => branch.id === selectedBranchId) ?? null;
  const canCheckAvailability =
    Boolean(accessToken) &&
    Boolean(resolvedTenantId) &&
    Boolean(selectedBranchId) &&
    Boolean(startAt) &&
    Number(partySize) > 0 &&
    Number(durationMinutes) > 0;

  useEffect(() => {
    if (!selectedBranchId && availableBranches.length === 1) {
      setSelectedBranchId(availableBranches[0]!.id);
    }
  }, [availableBranches, selectedBranchId]);

  const availabilityQuery = useQuery({
    queryKey: [
      "customer-availability",
      resolvedTenantId,
      selectedBranchId,
      partySize,
      startAt,
      durationMinutes,
    ],
    queryFn: async () => {
      return apiRequest<AvailabilityResponse>(
        `/v1/branches/${selectedBranchId}/availability?partySize=${encodeURIComponent(
          partySize,
        )}&startAt=${encodeURIComponent(new Date(startAt).toISOString())}&durationMinutes=${encodeURIComponent(
          durationMinutes,
        )}`,
        {
          accessToken: accessToken!,
          tenantId: resolvedTenantId,
        },
      );
    },
    enabled: canCheckAvailability,
  });

  const createReservationMutation = useMutation({
    mutationFn: async () => {
      if (!accessToken) throw new Error("Se requiere sesión");
      if (!resolvedTenantId) throw new Error("Seleccioná un tenant");
      if (!selectedBranchId) throw new Error("Seleccioná una sucursal");
      if (!startAt) throw new Error("Seleccioná fecha y hora");
      if (availabilityQuery.data && !availabilityQuery.data.data.available) {
        throw new Error("No hay disponibilidad para ese horario");
      }

      const response = await apiRequest<ReservationResponse>(
        `/v1/branches/${selectedBranchId}/reservations`,
        {
          accessToken,
          tenantId: resolvedTenantId,
          method: "POST",
          body: {
            partySize: Number(partySize),
            startAt: new Date(startAt).toISOString(),
            durationMinutes: Number(durationMinutes),
            ...(notes.trim() ? { notes: notes.trim() } : {}),
            source: "CUSTOMER_APP",
          },
        },
      );
      return response.data;
    },
    onSuccess: (reservation) => {
      navigate("/public/reservations/confirmation", { state: reservation });
    },
    onError: (error) => {
      setFormError(error instanceof Error ? error.message : "No se pudo crear la reserva");
    },
  });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    await createReservationMutation.mutateAsync();
  }

  const reservePriority = getReservationPriority({
    accessToken: Boolean(accessToken),
    resolvedTenantId,
    selectedBranchId,
    canCheckAvailability,
    availability: availabilityQuery.data?.data.available ?? null,
  });

  return (
    <section className="public-page" aria-labelledby="customer-reservation-heading">
      <h1 id="customer-reservation-heading">Nueva reserva</h1>
      <p>Ya con sesión iniciada, podés crear una reserva real sobre la API actual.</p>

      <article className="public-card public-info-card">
        <strong>{reservePriority.title}</strong>
        <p>{reservePriority.message}</p>
        <div className="public-detail-list">
          <span>
            <strong>Tenant:</strong> {selectedTenant?.name ?? "Sin elegir"}
          </span>
          <span>
            <strong>Sucursal:</strong> {selectedBranch ? `${selectedBranch.name} (${selectedBranch.code})` : "Sin elegir"}
          </span>
        </div>
      </article>

      <form className="public-form" onSubmit={handleSubmit}>
        {availableTenants.length > 1 ? (
          <label>
            Tenant
            <select value={resolvedTenantId} onChange={(event) => selectTenant(event.target.value)} required>
              <option value="">Elegí un tenant</option>
              {availableTenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label>
          Sucursal
          <select
            value={selectedBranchId}
            onChange={(event) => setSelectedBranchId(event.target.value)}
            required
            disabled={isLoading || availableBranches.length === 0}
          >
            <option value="">Elegí una sucursal</option>
            {availableBranches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name} ({branch.code})
              </option>
            ))}
          </select>
        </label>

        <label>
          Cantidad de personas
          <input
            type="number"
            min="1"
            step="1"
            value={partySize}
            onChange={(event) => setPartySize(event.target.value)}
            required
          />
        </label>

        <label>
          Fecha y hora
          <input
            type="datetime-local"
            value={startAt}
            onChange={(event) => setStartAt(event.target.value)}
            required
          />
        </label>

        <label>
          Duración estimada (minutos)
          <input
            type="number"
            min="30"
            step="15"
            value={durationMinutes}
            onChange={(event) => setDurationMinutes(event.target.value)}
            required
          />
        </label>

        <label>
          Notas
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={4}
            placeholder="Alergias, preferencia de mesa, cumpleaños, etc."
          />
        </label>

        <section className="public-card" aria-labelledby="availability-preview-heading">
          <h2 id="availability-preview-heading">Disponibilidad</h2>
          {!canCheckAvailability ? (
            <p>Completá sucursal, personas, fecha y duración para consultar disponibilidad.</p>
          ) : availabilityQuery.isLoading ? (
            <p role="status">Consultando disponibilidad…</p>
          ) : availabilityQuery.error ? (
            <p role="alert" className="login-error">
              {availabilityQuery.error instanceof Error
                ? availabilityQuery.error.message
                : "No se pudo consultar disponibilidad"}
            </p>
          ) : availabilityQuery.data ? (
            <div className="availability-panel">
              <p>
                Estado:{" "}
                <strong>{availabilityQuery.data.data.available ? "Disponible" : "Sin disponibilidad"}</strong>
              </p>
              <p>
                Sucursal: <strong>{selectedBranch ? `${selectedBranch.name} (${selectedBranch.code})` : "—"}</strong>
              </p>
              <p>Timezone: {availabilityQuery.data.data.timezone}</p>
              <p>Frescura: {availabilityQuery.data.data.freshness}</p>
              <p>
                Mesas compatibles ahora: {availabilityQuery.data.data.freeTableIds.length}
              </p>
              <p className="availability-note">
                Esta consulta es informativa. La API revalida nuevamente al confirmar la reserva.
              </p>
            </div>
          ) : null}
        </section>

        {formError ? (
          <p role="alert" className="login-error">
            {formError}
          </p>
        ) : null}

        <div className="public-button-row">
          <button
            type="submit"
            className="public-button-primary"
            disabled={
              createReservationMutation.isPending ||
              !canCheckAvailability ||
              availabilityQuery.isLoading ||
              availabilityQuery.data?.data.available === false
            }
          >
            {createReservationMutation.isPending ? "Creando reserva…" : "Crear reserva"}
          </button>
        </div>
      </form>
    </section>
  );
}

function getReservationPriority({
  accessToken,
  resolvedTenantId,
  selectedBranchId,
  canCheckAvailability,
  availability,
}: {
  accessToken: boolean;
  resolvedTenantId: string;
  selectedBranchId: string;
  canCheckAvailability: boolean;
  availability: boolean | null;
}) {
  if (!accessToken) {
    return {
      title: "Primero iniciá sesión",
      message: "La reserva real necesita una sesión activa para guardar contexto y seguimiento.",
    };
  }

  if (!resolvedTenantId) {
    return {
      title: "Elegí un tenant",
      message: "Antes de reservar, necesitás definir para qué tenant querés operar.",
    };
  }

  if (!selectedBranchId) {
    return {
      title: "Elegí una sucursal",
      message: "Definí la sede antes de consultar disponibilidad y confirmar la reserva.",
    };
  }

  if (!canCheckAvailability) {
    return {
      title: "Completá los datos base",
      message: "Faltan personas, horario o duración para consultar disponibilidad real.",
    };
  }

  if (availability === false) {
    return {
      title: "Ese horario no está disponible",
      message: "Probá con otro horario, otra duración o incluso otra sucursal.",
    };
  }

  if (availability === true) {
    return {
      title: "Todo listo para reservar",
      message: "La disponibilidad luce favorable; ya podés confirmar la reserva.",
    };
  }

  return {
    title: "Consultá disponibilidad",
    message: "Cuando completes los datos, esta pantalla te dirá si conviene avanzar.",
  };
}
