import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppHeader } from "../../components/app-header.js";
import { StateView } from "../../components/state-view.js";
import { useApi } from "../../app/use-api.js";
import { useNow } from "../../app/use-now.js";
import { useSession } from "../../app/session-context.js";

interface ApiData<T> {
  data: T;
}

interface GuestProfile {
  id: string;
  displayName: string;
  email?: string | null;
  phone?: string | null;
}

interface ReservationListItem {
  id: string;
  branchId: string;
  guestId?: string | null;
  partySize: number;
  startAt: string;
  durationMinutes: number;
  notes?: string | null;
  cancellationPolicyId?: string | null;
  status: "PENDING" | "CONFIRMED" | "EXPIRED" | "SEATED" | "CANCELLED" | "NO_SHOW" | "COMPLETED";
  tableIds?: string[] | null;
  createdAt: string;
  updatedAt: string;
}

interface WaitlistEntry {
  id: string;
  branchId: string;
  guestId?: string | null;
  partySize: number;
  quotedMinutes?: number | null;
  notes?: string | null;
  status: "WAITING" | "NOTIFIED" | "SEATED" | "CANCELLED" | "EXPIRED";
  priorityOverride?: number | null;
  visitId?: string | null;
  createdAt: string;
  updatedAt: string;
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

interface TableStatus {
  tableId: string;
  status: "AVAILABLE" | "OCCUPIED" | "PAYING" | "BLOCKED" | "CLEANING" | "RESERVED";
  occupancy: null | { visitId: string };
}

interface SalonSummary {
  id: string;
  branchId: string;
  name: string;
  capacity: number;
}

interface SalonDetail extends SalonSummary {
  tables: Array<{
    id: string;
    salonId: string;
    branchId: string;
    number: string;
    name?: string | null;
    capacity: number;
  }>;
}

type HostTab = "reservations" | "waitlist" | "availability";
type TimePreset = { label: string; value: string };
type TimePresetConfig =
  | { label: string; hoursOffset: number }
  | { label: string; dayOffset?: number; fixedHour: number; fixedMinute: number };

const reservationStatuses: Array<ReservationListItem["status"] | "ALL"> = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "SEATED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
  "EXPIRED",
];

const PARTY_SIZE_PRESETS = ["2", "4", "6", "8"];
const DURATION_PRESETS = ["60", "90", "120"];

export function HostPage() {
  const api = useApi();
  const queryClient = useQueryClient();
  const { selectedBranch, selectedBranchId } = useSession();
  const now = useNow();

  const [tab, setTab] = useState<HostTab>("reservations");
  const [reservationStatus, setReservationStatus] = useState<ReservationListItem["status"] | "ALL">("ALL");
  const [availabilityPartySize, setAvailabilityPartySize] = useState("2");
  const [availabilityStartAt, setAvailabilityStartAt] = useState(defaultDateTimeLocal());
  const [availabilityDurationMinutes, setAvailabilityDurationMinutes] = useState("90");
  const [newReservationPartySize, setNewReservationPartySize] = useState("2");
  const [newReservationStartAt, setNewReservationStartAt] = useState(defaultDateTimeLocal());
  const [newReservationDurationMinutes, setNewReservationDurationMinutes] = useState("90");
  const [newReservationGuestName, setNewReservationGuestName] = useState("");
  const [newReservationGuestEmail, setNewReservationGuestEmail] = useState("");
  const [newReservationGuestPhone, setNewReservationGuestPhone] = useState("");
  const [newReservationNotes, setNewReservationNotes] = useState("");
  const [newWaitlistPartySize, setNewWaitlistPartySize] = useState("2");
  const [newWaitlistQuotedMinutes, setNewWaitlistQuotedMinutes] = useState("20");
  const [newWaitlistGuestName, setNewWaitlistGuestName] = useState("");
  const [newWaitlistGuestEmail, setNewWaitlistGuestEmail] = useState("");
  const [newWaitlistGuestPhone, setNewWaitlistGuestPhone] = useState("");
  const [newWaitlistNotes, setNewWaitlistNotes] = useState("");
  const [waitlistSeatSelections, setWaitlistSeatSelections] = useState<Record<string, string[]>>({});
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);
  const timePresets = useMemo(() => buildTimePresets(), []);

  const reservationsQuery = useQuery({
    queryKey: ["host-reservations", selectedBranchId, reservationStatus],
    enabled: Boolean(selectedBranchId),
    queryFn: () =>
      api<ApiData<ReservationListItem[]>>(
        `/v1/branches/${selectedBranchId}/reservations${reservationStatus === "ALL" ? "" : `?status=${reservationStatus}`}`,
      ),
    refetchInterval: 15_000,
  });

  const waitlistQuery = useQuery({
    queryKey: ["host-waitlist", selectedBranchId],
    enabled: Boolean(selectedBranchId),
    queryFn: () => api<ApiData<WaitlistEntry[]>>(`/v1/branches/${selectedBranchId}/waitlist-entries`),
    refetchInterval: 10_000,
  });

  const availabilityQuery = useQuery({
    queryKey: ["host-availability", selectedBranchId, availabilityPartySize, availabilityStartAt, availabilityDurationMinutes],
    enabled: Boolean(selectedBranchId) && Boolean(availabilityStartAt),
    queryFn: () =>
      api<AvailabilityResponse>(
        `/v1/branches/${selectedBranchId}/availability?partySize=${Number(availabilityPartySize)}&startAt=${encodeURIComponent(
          new Date(availabilityStartAt).toISOString(),
        )}&durationMinutes=${Number(availabilityDurationMinutes)}`,
      ),
    refetchInterval: 20_000,
  });

  const salonsQuery = useQuery({
    queryKey: ["host-salons", selectedBranchId],
    enabled: Boolean(selectedBranchId),
    queryFn: () => api<{ data: SalonSummary[] }>(`/v1/salons?branchId=${selectedBranchId}`),
  });

  const salonDetailsQuery = useQuery({
    queryKey: ["host-salon-details", selectedBranchId, salonsQuery.data?.data.map((salon) => salon.id).join(",")],
    enabled: Boolean(selectedBranchId) && Boolean(salonsQuery.data?.data.length),
    queryFn: async () => {
      const salons = salonsQuery.data?.data ?? [];
      return Promise.all(
        salons.map(async (salon) => {
          const detail = await api<ApiData<SalonDetail>>(`/v1/salons/${salon.id}`);
          return detail.data;
        }),
      );
    },
  });

  const tableStatusesQuery = useQuery({
    queryKey: ["host-table-statuses", selectedBranchId],
    enabled: Boolean(selectedBranchId),
    queryFn: () => api<ApiData<TableStatus[]>>(`/v1/branches/${selectedBranchId}/table-statuses`),
    refetchInterval: 10_000,
  });

  const allTables = useMemo(
    () => (salonDetailsQuery.data ?? []).flatMap((salon) => salon.tables.map((table) => ({ ...table, salonName: salon.name }))),
    [salonDetailsQuery.data],
  );
  const guestIds = useMemo(
    () =>
      Array.from(
        new Set(
          [...(reservationsQuery.data?.data ?? []), ...(waitlistQuery.data?.data ?? [])]
            .map((item) => item.guestId)
            .filter((value): value is string => typeof value === "string" && value.length > 0),
        ),
      ),
    [reservationsQuery.data, waitlistQuery.data],
  );
  const guestsQuery = useQuery({
    queryKey: ["host-guests", selectedBranchId, guestIds.join(",")],
    enabled: Boolean(selectedBranchId) && guestIds.length > 0,
    queryFn: async () => {
      const entries = await Promise.all(
        guestIds.map(async (guestId) => {
          try {
            const response = await api<ApiData<GuestProfile>>(`/v1/guests/${guestId}`);
            return [guestId, response.data] as const;
          } catch {
            return [guestId, null] as const;
          }
        }),
      );
      return new Map(entries);
    },
  });
  const guestById = useMemo(() => guestsQuery.data ?? new Map<string, GuestProfile | null>(), [guestsQuery.data]);

  const tableStatusById = useMemo(
    () => new Map((tableStatusesQuery.data?.data ?? []).map((status) => [status.tableId, status])),
    [tableStatusesQuery.data],
  );
  const tableStatusSummary = useMemo(() => {
    const summary = {
      AVAILABLE: 0,
      OCCUPIED: 0,
      PAYING: 0,
      RESERVED: 0,
      BLOCKED: 0,
      CLEANING: 0,
    };
    for (const table of allTables) {
      const liveStatus = tableStatusById.get(table.id)?.status ?? "AVAILABLE";
      summary[liveStatus] += 1;
    }
    return summary;
  }, [allTables, tableStatusById]);

  const availableTables = useMemo(
    () =>
      allTables.filter((table) => {
        const liveStatus = tableStatusById.get(table.id)?.status;
        return !liveStatus || liveStatus === "AVAILABLE";
      }),
    [allTables, tableStatusById],
  );
  const sortedReservations = useMemo(
    () =>
      (reservationsQuery.data?.data ?? [])
        .slice()
        .sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt)),
    [reservationsQuery.data],
  );
  const pendingReservations = useMemo(
    () => sortedReservations.filter((reservation) => reservation.status === "PENDING"),
    [sortedReservations],
  );
  const confirmedReservations = useMemo(
    () => sortedReservations.filter((reservation) => reservation.status === "CONFIRMED"),
    [sortedReservations],
  );
  const arrivingSoonReservations = useMemo(() => {
    const now = Date.now();
    const soonWindowEnd = now + 90 * 60 * 1000;
    return sortedReservations.filter((reservation) => {
      const startAt = Date.parse(reservation.startAt);
      return (
        startAt >= now &&
        startAt <= soonWindowEnd &&
        (reservation.status === "PENDING" || reservation.status === "CONFIRMED")
      );
    });
  }, [sortedReservations]);
  const waitingEntries = useMemo(
    () => (waitlistQuery.data?.data ?? []).filter((entry) => entry.status === "WAITING" || entry.status === "NOTIFIED"),
    [waitlistQuery.data],
  );
  const overdueWaitlistEntries = useMemo(
    () =>
      waitingEntries.filter((entry) => {
        const quotedMinutes = entry.quotedMinutes ?? 0;
        if (quotedMinutes <= 0) return false;
        const waitedMinutes = Math.max(0, Math.round((now - Date.parse(entry.createdAt)) / 60000));
        return waitedMinutes > quotedMinutes;
      }),
    [now, waitingEntries],
  );
  const sortedWaitlistEntries = useMemo(
    () =>
      (waitlistQuery.data?.data ?? [])
        .slice()
        .sort((a, b) => waitlistPriority(a.status) - waitlistPriority(b.status) || Date.parse(a.createdAt) - Date.parse(b.createdAt)),
    [waitlistQuery.data],
  );
  const notifiedEntries = useMemo(
    () => sortedWaitlistEntries.filter((entry) => entry.status === "NOTIFIED"),
    [sortedWaitlistEntries],
  );
  const seatableWaitlistCount = useMemo(
    () =>
      sortedWaitlistEntries.filter((entry) =>
        (entry.status === "WAITING" || entry.status === "NOTIFIED") &&
        availableTables.some((table) => table.capacity >= entry.partySize),
      ).length,
    [sortedWaitlistEntries, availableTables],
  );
  const confirmedSoonReservations = useMemo(
    () => arrivingSoonReservations.filter((reservation) => reservation.status === "CONFIRMED"),
    [arrivingSoonReservations],
  );
  const prioritizedReservations = useMemo(
    () =>
      (reservationsQuery.data?.data ?? [])
        .slice()
        .sort((a, b) => {
          const score = (reservation: ReservationListItem) => {
            const minutesUntil = Math.round((Date.parse(reservation.startAt) - now) / 60000);
            const hasAssignedTable = Boolean(reservation.tableIds?.length);
            if (reservation.status === "CONFIRMED" && minutesUntil <= 0) return 0;
            if (reservation.status === "CONFIRMED" && !hasAssignedTable && minutesUntil <= 30) return 1;
            if (reservation.status === "CONFIRMED" && minutesUntil <= 90) return 2;
            if (reservation.status === "PENDING" && minutesUntil <= 15) return 3;
            if (reservation.status === "PENDING" && minutesUntil <= 90) return 4;
            if (reservation.status === "CONFIRMED") return 5;
            if (reservation.status === "PENDING") return 6;
            return 7;
          };
          return score(a) - score(b) || Date.parse(a.startAt) - Date.parse(b.startAt);
        }),
    [now, reservationsQuery.data],
  );
  const prioritizedWaitlistEntries = useMemo(
    () =>
      (waitlistQuery.data?.data ?? [])
        .slice()
        .sort((a, b) => {
          const score = (entry: WaitlistEntry) => {
            const hasTableNow = availableTables.some((table) => table.capacity >= entry.partySize);
            const waitedMinutes = Math.max(0, Math.round((now - Date.parse(entry.createdAt)) / 60000));
            const quotedMinutes = entry.quotedMinutes ?? 0;
            const overdue = quotedMinutes > 0 && waitedMinutes > quotedMinutes;
            if ((entry.status === "WAITING" || entry.status === "NOTIFIED") && hasTableNow) return 0;
            if (overdue) return 1;
            if (entry.status === "NOTIFIED") return 2;
            if (entry.status === "WAITING") return 3;
            return 4;
          };
          return score(a) - score(b) || Date.parse(a.createdAt) - Date.parse(b.createdAt);
        }),
    [availableTables, now, waitlistQuery.data],
  );
  const triagePriority =
    seatableWaitlistCount > 0
      ? {
          tone: "waitlist" as const,
          title: `${seatableWaitlistCount} grupo${seatableWaitlistCount === 1 ? "" : "s"} ya se puede sentar`,
          message: "Hay capacidad disponible para destrabar waitlist ahora mismo.",
          actionLabel: "Ir a waitlist",
          onAction: () => setTab("waitlist"),
        }
      : confirmedSoonReservations.length > 0
        ? {
            tone: "arrival" as const,
            title: `${confirmedSoonReservations.length} llegada${confirmedSoonReservations.length === 1 ? "" : "s"} próxima${confirmedSoonReservations.length === 1 ? "" : "s"}`,
            message: "Conviene preparar seating de reservas confirmadas que llegan pronto.",
            actionLabel: "Ir a confirmadas",
            onAction: () => {
              setTab("reservations");
              setReservationStatus("CONFIRMED");
            },
          }
        : pendingReservations.length > 0
          ? {
              tone: "pending" as const,
              title: `${pendingReservations.length} reserva${pendingReservations.length === 1 ? "" : "s"} pendiente${pendingReservations.length === 1 ? "" : "s"} de confirmación`,
              message: "Todavía quedan reservas por confirmar para estabilizar el servicio.",
              actionLabel: "Ir a pendientes",
              onAction: () => {
                setTab("reservations");
                setReservationStatus("PENDING");
              },
            }
          : null;

  const reservationDraftChecklist = [
    { label: "Huésped identificado", done: Boolean(newReservationGuestName.trim()) },
    { label: "Cantidad definida", done: Number(newReservationPartySize) > 0 },
    { label: "Horario definido", done: Boolean(newReservationStartAt) },
    { label: "Duración definida", done: Number(newReservationDurationMinutes) > 0 },
  ];
  const reservationDraftReady = reservationDraftChecklist.every((step) => step.done);
  const reservationDraftMissing = reservationDraftChecklist.filter((step) => !step.done).map((step) => step.label);
  const waitlistDraftChecklist = [
    { label: "Huésped identificado", done: Boolean(newWaitlistGuestName.trim()) },
    { label: "Cantidad definida", done: Number(newWaitlistPartySize) > 0 },
    { label: "Promesa informada", done: Number(newWaitlistQuotedMinutes) >= 0 },
  ];
  const waitlistDraftReady = waitlistDraftChecklist.every((step) => step.done);
  const waitlistDraftMissing = waitlistDraftChecklist.filter((step) => !step.done).map((step) => step.label);
  const availabilityActionPlan = [
    { label: "Cantidad cargada", done: Number(availabilityPartySize) > 0 },
    { label: "Horario cargado", done: Boolean(availabilityStartAt) },
    { label: "Duración cargada", done: Number(availabilityDurationMinutes) > 0 },
    { label: "Mesas sugeridas", done: (availabilityQuery.data?.data.freeTableIds.length ?? 0) > 0 },
  ];
  const reservationFocusPlan =
    pendingReservations.length > 0
      ? {
          title: "Primero conviene limpiar pendientes",
          message: "Todavía hay reservas sin confirmar; eso impacta directo sobre llegadas, seating y expectativa del cliente.",
          primaryLabel: "Ver pendientes",
          onPrimary: () => setReservationStatus("PENDING"),
          secondaryLabel: confirmedSoonReservations.length > 0 ? "Ver confirmadas próximas" : null,
          onSecondary: confirmedSoonReservations.length > 0 ? () => setReservationStatus("CONFIRMED") : null,
        }
      : confirmedSoonReservations.length > 0
        ? {
            title: "El foco ya pasó a preparar seating",
            message: "Las próximas reservas confirmadas necesitan mesa o seguimiento de arribo.",
            primaryLabel: "Ver confirmadas",
            onPrimary: () => setReservationStatus("CONFIRMED"),
            secondaryLabel: null,
            onSecondary: null,
          }
        : {
            title: "La cola de reservas está estable",
            message: "Podés usar este bloque para cargar una nueva reserva o revisar casos puntuales del día.",
            primaryLabel: "Ver todas",
            onPrimary: () => setReservationStatus("ALL"),
            secondaryLabel: null,
            onSecondary: null,
          };
  const waitlistFocusPlan =
    seatableWaitlistCount > 0
      ? {
          title: "Hay grupos que ya se pueden sentar",
          message: "Conviene asignar mesa ahora para bajar fricción en puerta y liberar presión sobre recepción.",
        }
      : overdueWaitlistEntries.length > 0
        ? {
            title: "Hay demoras vencidas para resolver",
            message: "Si no hay mesa todavía, la prioridad pasa a reestimar o notificar para sostener expectativa.",
          }
        : notifiedEntries.length > 0
          ? {
              title: "Hay grupos notificados esperando arribo",
              message: "Mantené visible esta cola para sentar rápido apenas lleguen o liberar la mesa si no se presentan.",
            }
          : {
              title: "La waitlist está bajo control",
              message: "Podés usar este bloque para registrar walk-ins y mantener una promesa clara.",
            };
  const availabilityFocusPlan = availabilityQuery.data
    ? availabilityQuery.data.data.available
      ? {
          title: "Hay lugar para prometer ese horario",
          message: "Si el huésped ya decidió, el siguiente paso natural es copiar el chequeo y crear la reserva.",
        }
      : {
          title: "Ese horario hoy no cierra",
          message: "Conviene ajustar hora, duración o cantidad antes de prometer algo en recepción.",
        }
    : {
        title: "Cargá un escenario para consultar",
        message: "Completá cantidad, hora y duración para validar si la operación realmente soporta la promesa.",
      };

  const refreshAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["host-reservations"] }),
      queryClient.invalidateQueries({ queryKey: ["host-waitlist"] }),
      queryClient.invalidateQueries({ queryKey: ["host-availability"] }),
      queryClient.invalidateQueries({ queryKey: ["host-table-statuses"] }),
      queryClient.invalidateQueries({ queryKey: ["host-guests"] }),
    ]);
  };

  async function ensureGuest(input: { displayName: string; email?: string; phone?: string }) {
    const displayName = input.displayName.trim();
    const email = input.email?.trim() || undefined;
    const phone = input.phone?.trim() || undefined;
    if (!displayName) return null;

    if (email || phone) {
      const lookup = await api<ApiData<GuestProfile | null>>("/v1/guests/lookup", {
        method: "POST",
        body: {
          ...(email ? { email } : {}),
          ...(phone ? { phone } : {}),
        },
      });
      if (lookup.data) return lookup.data;
    }

    const created = await api<ApiData<GuestProfile>>("/v1/guests", {
      method: "POST",
      body: {
        displayName,
        ...(email ? { email } : {}),
        ...(phone ? { phone } : {}),
        consentGiven: false,
      },
    });
    return created.data;
  }

  const createReservationMutation = useMutation({
    mutationFn: async () => {
      const guest = await ensureGuest({
        displayName: newReservationGuestName,
        email: newReservationGuestEmail,
        phone: newReservationGuestPhone,
      });
      return api<ApiData<ReservationListItem>>(`/v1/branches/${selectedBranchId}/reservations`, {
        method: "POST",
        body: {
          partySize: Number(newReservationPartySize),
          startAt: new Date(newReservationStartAt).toISOString(),
          durationMinutes: Number(newReservationDurationMinutes),
          source: "HOST_APP",
          ...(guest ? { guestId: guest.id } : {}),
          ...(newReservationNotes.trim() ? { notes: newReservationNotes.trim() } : {}),
        },
      });
    },
    onSuccess: async () => {
      setNewReservationGuestName("");
      setNewReservationGuestEmail("");
      setNewReservationGuestPhone("");
      setNewReservationNotes("");
      setLastActionMessage("Reserva creada.");
      await refreshAll();
    },
  });

  const createWaitlistMutation = useMutation({
    mutationFn: async () => {
      const guest = await ensureGuest({
        displayName: newWaitlistGuestName,
        email: newWaitlistGuestEmail,
        phone: newWaitlistGuestPhone,
      });
      return api<ApiData<WaitlistEntry>>(`/v1/branches/${selectedBranchId}/waitlist-entries`, {
        method: "POST",
        body: {
          partySize: Number(newWaitlistPartySize),
          quotedMinutes: Number(newWaitlistQuotedMinutes),
          ...(guest ? { guestId: guest.id } : {}),
          ...(newWaitlistNotes.trim() ? { notes: newWaitlistNotes.trim() } : {}),
        },
      });
    },
    onSuccess: async () => {
      setNewWaitlistGuestName("");
      setNewWaitlistGuestEmail("");
      setNewWaitlistGuestPhone("");
      setNewWaitlistNotes("");
      setLastActionMessage("Grupo agregado a lista de espera.");
      await refreshAll();
    },
  });

  const hostCommand = useMutation({
    mutationFn: ({ path, body }: { path: string; body?: unknown }) =>
      api(path, { method: "POST", ...(body !== undefined ? { body } : {}) }),
    onSuccess: async (_data, variables) => {
      setLastActionMessage(labelForHostCommand(variables.path));
      await refreshAll();
    },
  });

  function copyAvailabilityIntoReservation() {
    setNewReservationPartySize(availabilityPartySize);
    setNewReservationStartAt(availabilityStartAt);
    setNewReservationDurationMinutes(availabilityDurationMinutes);
    setTab("reservations");
    setLastActionMessage("Chequeo de disponibilidad copiado al alta de reserva.");
  }

  return (
    <main className="host-app">
      <AppHeader
        title="Host / Maître"
        subtitle={selectedBranch ? `${selectedBranch.name} · reservas y lista de espera` : "Operación de salón"}
        right={
          <button type="button" className="btn btn--ghost" onClick={() => void refreshAll()}>
            Actualizar
          </button>
        }
      />

      <section className="cashier-shell cashier-grid">
        <section className="cashier-card cashier-card--hero">
          <div className="cashier-hero-row">
            <div>
              <div className="cashier-eyebrow">Frente de salón</div>
              <h2 className="host-hero-title">{selectedBranch?.name ?? "Sucursal"}</h2>
              <p className="host-hero-copy">Gestioná confirmaciones, lista de espera, disponibilidad y seating.</p>
            </div>
            <div className="cashier-balance-block">
              <span className="cashier-balance-label">Mesas libres</span>
              <strong>{availableTables.length}</strong>
            </div>
          </div>
        </section>

        {triagePriority ? (
          <section className={`host-priority-banner host-priority-banner--${triagePriority.tone}`} aria-label="Prioridad actual de recepción">
            <div className="host-priority-copy">
              <span className="host-priority-eyebrow">Prioridad actual</span>
              <strong>{triagePriority.title}</strong>
              <p>{triagePriority.message}</p>
            </div>
            <button type="button" className="btn btn--ghost" onClick={triagePriority.onAction}>
              {triagePriority.actionLabel}
            </button>
          </section>
        ) : null}

        <section className="cashier-kpi-strip">
          <article className="cashier-kpi-card">
            <span>Llegan pronto</span>
            <strong>{arrivingSoonReservations.length}</strong>
          </article>
          <article className="cashier-kpi-card">
            <span>Pendientes</span>
            <strong>{pendingReservations.length}</strong>
          </article>
          <article className="cashier-kpi-card">
            <span>Waitlist sentable</span>
            <strong>{seatableWaitlistCount}</strong>
          </article>
          <article className="cashier-kpi-card">
            <span>Notificados</span>
            <strong>{notifiedEntries.length}</strong>
          </article>
          <article className="cashier-kpi-card">
            <span>Mesas libres</span>
            <strong>{availableTables.length}</strong>
          </article>
          <article className="cashier-kpi-card">
            <span>Disponibilidad</span>
            <strong>{availabilityQuery.data?.data.available ? "Sí" : "No"}</strong>
          </article>
        </section>

        <section className="host-launchpad">
          <article className="cashier-card">
            <div className="cashier-card-head">
              <div>
                <h2 className="host-card-title">Próximas llegadas</h2>
                <p className="host-card-copy">Lo que llega dentro de los próximos 90 minutos.</p>
              </div>
              <span className="host-count-pill">{arrivingSoonReservations.length}</span>
            </div>
            {arrivingSoonReservations.length > 0 ? (
              <div className="host-arrivals-list">
                {arrivingSoonReservations.slice(0, 4).map((reservation) => {
                  const minutesUntil = Math.round((Date.parse(reservation.startAt) - now) / 60000);
                  const arrivalTone =
                    reservation.status === "PENDING"
                      ? "pending"
                      : minutesUntil <= 0
                        ? "ready"
                        : minutesUntil <= 20
                          ? "soon"
                          : "scheduled";
                  return (
                  <article key={reservation.id} className={`host-arrival-card host-arrival-card--${arrivalTone}`}>
                    <div className="host-arrival-main">
                      <strong>{formatReservationHeading(reservation, guestById.get(reservation.guestId ?? "") ?? null)}</strong>
                      <p>{formatDateTime(reservation.startAt)} · {formatArrivalTiming(minutesUntil)}</p>
                      <p>{reservation.partySize} pax · {reservation.durationMinutes} min</p>
                      <p>{reservation.tableIds?.length ? `Mesas: ${reservation.tableIds.join(", ")}` : "Sin mesa asignada"}</p>
                    </div>
                    <div className="host-arrival-actions">
                      <span className={`host-status host-status--${reservation.status.toLowerCase()}`}>{reservationStatusLabel(reservation.status)}</span>
                      {reservation.status === "PENDING" ? (
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => void hostCommand.mutateAsync({ path: `/v1/reservations/${reservation.id}/confirm` })}
                        >
                          Confirmar
                        </button>
                      ) : null}
                      {reservation.status === "CONFIRMED" ? (
                        <button
                          type="button"
                          className="btn btn--primary btn--sm"
                          onClick={() => void hostCommand.mutateAsync({ path: `/v1/reservations/${reservation.id}/seat` })}
                        >
                          Sentar
                        </button>
                      ) : null}
                    </div>
                  </article>
                )})}
              </div>
            ) : (
              <div className="host-empty-note">
                <strong>Sin llegadas inmediatas.</strong>
                <span>No hay reservas pendientes o confirmadas en la próxima hora y media.</span>
              </div>
            )}
          </article>

          <article className="cashier-card">
            <div className="cashier-card-head">
              <div>
                <h2 className="host-card-title">Acciones rápidas</h2>
                <p className="host-card-copy">Atajos para entrar directo a la cola que importa ahora.</p>
              </div>
            </div>
            <div className="host-quick-grid">
              <button
                type="button"
                className={`host-quick-card ${tab === "reservations" && reservationStatus === "PENDING" ? "host-quick-card--active" : ""}`}
                onClick={() => {
                  setTab("reservations");
                  setReservationStatus("PENDING");
                }}
              >
                <span>Pendientes</span>
                <strong>{pendingReservations.length}</strong>
                <p>Reservas para confirmar</p>
              </button>
              <button
                type="button"
                className={`host-quick-card ${tab === "reservations" && reservationStatus === "CONFIRMED" ? "host-quick-card--active" : ""}`}
                onClick={() => {
                  setTab("reservations");
                  setReservationStatus("CONFIRMED");
                }}
              >
                <span>Confirmadas</span>
                <strong>{confirmedReservations.length}</strong>
                <p>Listas para sentar</p>
              </button>
              <button
                type="button"
                className={`host-quick-card ${tab === "waitlist" ? "host-quick-card--active" : ""}`}
                onClick={() => setTab("waitlist")}
              >
                <span>Waitlist</span>
                <strong>{seatableWaitlistCount > 0 ? seatableWaitlistCount : waitingEntries.length}</strong>
                <p>{seatableWaitlistCount > 0 ? "Ya se pueden sentar" : "Grupos esperando o notificados"}</p>
              </button>
              <button
                type="button"
                className={`host-quick-card ${tab === "availability" ? "host-quick-card--active" : ""}`}
                onClick={() => setTab("availability")}
              >
                <span>Disponibilidad</span>
                <strong>{availableTables.length}</strong>
                <p>Mesas libres para reubicar rápido</p>
              </button>
            </div>
          </article>
        </section>

        {lastActionMessage ? (
          <div className="cashier-banner cashier-banner--success">
            <span>{lastActionMessage}</span>
            <button type="button" className="btn btn--ghost" onClick={() => setLastActionMessage(null)}>
              Ocultar
            </button>
          </div>
        ) : null}

        <section className="cashier-card">
          <div className="cashier-card-head">
            <div>
              <h2 className="host-card-title">Snapshot de mesas</h2>
              <p className="host-card-copy">Estado live del salón para decidir seating rápido.</p>
            </div>
          </div>
          <StateView
            isLoading={salonDetailsQuery.isLoading || tableStatusesQuery.isLoading}
            error={(salonDetailsQuery.error as Error) ?? (tableStatusesQuery.error as Error) ?? null}
            isEmpty={allTables.length === 0}
            emptyIcon="🪑"
            emptyTitle="Sin mesas visibles"
            emptyMessage="No hay mesas configuradas para esta sucursal."
            onRetry={() => {
              void salonDetailsQuery.refetch();
              void tableStatusesQuery.refetch();
            }}
          >
            <section className="host-table-summary" aria-label="Resumen de estados de mesa">
              <article className="host-table-kpi host-table-kpi--available">
                <span>Libres</span>
                <strong>{tableStatusSummary.AVAILABLE}</strong>
              </article>
              <article className="host-table-kpi host-table-kpi--occupied">
                <span>Ocupadas</span>
                <strong>{tableStatusSummary.OCCUPIED}</strong>
              </article>
              <article className="host-table-kpi host-table-kpi--reserved">
                <span>Reservadas / pagando</span>
                <strong>{tableStatusSummary.RESERVED + tableStatusSummary.PAYING}</strong>
              </article>
              <article className="host-table-kpi host-table-kpi--blocked">
                <span>Bloqueadas / cleaning</span>
                <strong>{tableStatusSummary.BLOCKED + tableStatusSummary.CLEANING}</strong>
              </article>
            </section>
            <div className="host-table-grid">
              {allTables.map((table) => {
                const liveStatus = tableStatusById.get(table.id)?.status ?? "AVAILABLE";
                return (
                  <article key={table.id} className={`host-table-card host-table-card--${liveStatus.toLowerCase()}`}>
                    <strong>{table.name?.trim() || `Mesa ${table.number}`}</strong>
                    <span>{table.salonName}</span>
                    <span>{table.capacity} pax</span>
                    <em>{liveStatus}</em>
                  </article>
                );
              })}
            </div>
          </StateView>
        </section>

        <div className="cashier-toolbar">
          <div className="cashier-segmented">
            <button type="button" className={`seg-btn ${tab === "reservations" ? "seg-btn--active" : ""}`} onClick={() => setTab("reservations")}>
              Reservas
            </button>
            <button type="button" className={`seg-btn ${tab === "waitlist" ? "seg-btn--active" : ""}`} onClick={() => setTab("waitlist")}>
              Waitlist
            </button>
            <button type="button" className={`seg-btn ${tab === "availability" ? "seg-btn--active" : ""}`} onClick={() => setTab("availability")}>
              Disponibilidad
            </button>
          </div>
        </div>

        {tab === "reservations" ? (
          <div className="host-grid">
            <section className="cashier-card">
              <div className="cashier-card-head">
                <div>
                  <h2 className="host-card-title">Nueva reserva</h2>
                  <p className="host-card-copy">Alta rápida desde recepción.</p>
                </div>
              </div>
              <div className="host-form-panel">
                <strong>{reservationFocusPlan.title}</strong>
                <p className="host-card-copy">{reservationFocusPlan.message}</p>
                <div className="cashier-quick-actions">
                  <button type="button" className="btn btn--ghost" onClick={reservationFocusPlan.onPrimary}>
                    {reservationFocusPlan.primaryLabel}
                  </button>
                  {reservationFocusPlan.secondaryLabel && reservationFocusPlan.onSecondary ? (
                    <button type="button" className="btn btn--ghost" onClick={reservationFocusPlan.onSecondary}>
                      {reservationFocusPlan.secondaryLabel}
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="host-form-panel">
                <strong>Checklist de alta</strong>
                <div className="host-checklist">
                  {reservationDraftChecklist.map((step) => (
                    <div key={step.label} className={`host-check ${step.done ? "host-check--done" : ""}`}>
                      <strong>{step.done ? "✓" : "•"}</strong>
                      <span>{step.label}</span>
                    </div>
                  ))}
                </div>
                <div className={`cashier-banner ${reservationDraftReady ? "cashier-banner--success" : "cashier-banner--info"}`}>
                  <span>
                    {reservationDraftReady
                      ? "La reserva ya tiene los datos mínimos para cargarse."
                      : `Todavía falta: ${reservationDraftMissing.join(", ")}.`}
                  </span>
                </div>
              </div>
              <form
                className="cashier-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  void createReservationMutation.mutateAsync();
                }}
              >
                <label>
                  Nombre del huésped
                  <input value={newReservationGuestName} onChange={(e) => setNewReservationGuestName(e.target.value)} placeholder="Nombre y apellido" />
                </label>
                <label>
                  Email
                  <input value={newReservationGuestEmail} onChange={(e) => setNewReservationGuestEmail(e.target.value)} inputMode="email" placeholder="opcional" />
                </label>
                <label>
                  Teléfono
                  <input value={newReservationGuestPhone} onChange={(e) => setNewReservationGuestPhone(e.target.value)} inputMode="tel" placeholder="opcional" />
                </label>
                <label>
                  Comensales
                  <input value={newReservationPartySize} onChange={(e) => setNewReservationPartySize(e.target.value)} inputMode="numeric" />
                </label>
                <div className="host-preset-group">
                  <span className="host-preset-label">Atajos de comensales</span>
                  <div className="host-preset-row">
                    {PARTY_SIZE_PRESETS.map((preset: string) => (
                      <button
                        key={preset}
                        type="button"
                        className={`host-preset-chip ${newReservationPartySize === preset ? "host-preset-chip--active" : ""}`}
                        onClick={() => setNewReservationPartySize(preset)}
                      >
                        {preset} pax
                      </button>
                    ))}
                  </div>
                </div>
                <div className="cashier-banner cashier-banner--info">
                  <span>Recepción guarda el huésped para poder reencontrarlo luego en reservas y waitlist.</span>
                </div>
                <label>
                  Inicio
                  <input type="datetime-local" value={newReservationStartAt} onChange={(e) => setNewReservationStartAt(e.target.value)} />
                </label>
                <div className="host-preset-group">
                  <span className="host-preset-label">Horarios frecuentes</span>
                  <div className="host-preset-row">
                    {timePresets.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        className={`host-preset-chip ${newReservationStartAt === preset.value ? "host-preset-chip--active" : ""}`}
                        onClick={() => setNewReservationStartAt(preset.value)}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
                <label>
                  Duración (min)
                  <input value={newReservationDurationMinutes} onChange={(e) => setNewReservationDurationMinutes(e.target.value)} inputMode="numeric" />
                </label>
                <div className="host-preset-group">
                  <span className="host-preset-label">Duración sugerida</span>
                  <div className="host-preset-row">
                    {DURATION_PRESETS.map((preset: string) => (
                      <button
                        key={preset}
                        type="button"
                        className={`host-preset-chip ${newReservationDurationMinutes === preset ? "host-preset-chip--active" : ""}`}
                        onClick={() => setNewReservationDurationMinutes(preset)}
                      >
                        {preset} min
                      </button>
                    ))}
                  </div>
                </div>
                <label>
                  Notas
                  <input value={newReservationNotes} onChange={(e) => setNewReservationNotes(e.target.value)} placeholder="Cumpleaños, silla alta, etc." />
                </label>
                <button type="submit" className="btn btn--primary btn--xl" disabled={createReservationMutation.isPending || !newReservationGuestName.trim()}>
                  {createReservationMutation.isPending ? "Creando…" : "Crear reserva"}
                </button>
                {createReservationMutation.error ? (
                  <div className="cashier-banner cashier-banner--warning">
                    <span>{toErrorMessage(createReservationMutation.error)}</span>
                  </div>
                ) : null}
              </form>
            </section>

            <section className="cashier-card">
              <div className="cashier-card-head">
                <div>
                  <h2 className="host-card-title">Reservas activas</h2>
                  <p className="host-card-copy">Confirmá, marcá no-show o sentá la mesa.</p>
                </div>
              </div>
              <div className="cashier-segmented">
                {reservationStatuses.map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={`seg-btn ${reservationStatus === status ? "seg-btn--active" : ""}`}
                    onClick={() => setReservationStatus(status)}
                  >
                    {status === "ALL" ? "Todas" : status}
                  </button>
                ))}
              </div>
              <StateView
                isLoading={reservationsQuery.isLoading}
                error={(reservationsQuery.error as Error) ?? null}
                isEmpty={(reservationsQuery.data?.data.length ?? 0) === 0}
                emptyIcon="📖"
                emptyTitle="Sin reservas"
                emptyMessage="No hay reservas para este filtro."
                onRetry={() => void reservationsQuery.refetch()}
              >
                <p className="host-list-hint">Ordenado por prioridad operativa y horario de llegada.</p>
                <div className="host-reservation-list">
                  {prioritizedReservations.map((reservation) => {
                      const startAtMs = Date.parse(reservation.startAt);
                      const minutesUntil = Math.round((startAtMs - Date.now()) / 60000);
                      const isSoon =
                        minutesUntil >= 0 &&
                        minutesUntil <= 90 &&
                        (reservation.status === "PENDING" || reservation.status === "CONFIRMED");
                      const candidateTables = availableTables
                        .filter((table) => table.capacity >= reservation.partySize)
                        .slice()
                        .sort((a, b) => {
                          const overfillA = a.capacity - reservation.partySize;
                          const overfillB = b.capacity - reservation.partySize;
                          if (overfillA !== overfillB) return overfillA - overfillB;
                          return a.salonName.localeCompare(b.salonName) || a.number.localeCompare(b.number);
                        });
                      const bestFitTable = candidateTables[0] ?? null;
                      const reservationFlowHint =
                        reservation.status === "PENDING" && isSoon
                          ? { label: minutesUntil <= 15 ? "Confirmar ya" : "Confirmar hoy", tone: "pending" as const }
                          : reservation.status === "CONFIRMED" && minutesUntil <= 0
                            ? { label: "Sentar ahora", tone: "ready" as const }
                            : reservation.status === "CONFIRMED" && isSoon
                              ? { label: reservation.tableIds?.length ? "Preparar seating" : "Asignar mesa", tone: "confirmed" as const }
                              : reservation.status === "PENDING"
                                ? { label: "Pendiente", tone: "pending" as const }
                                : null;
                      return (
                        <article
                          key={reservation.id}
                          className={`host-reservation-card ${isSoon ? "host-reservation-card--soon" : ""} ${reservationFlowHint?.tone === "ready" || reservationFlowHint?.label === "Asignar mesa" ? "host-reservation-card--actionable" : ""}`}
                        >
                          <div className="host-reservation-main">
                            <div className="host-reservation-head">
                              <div className="host-reservation-title">
                                <strong>{formatReservationHeading(reservation, guestById.get(reservation.guestId ?? "") ?? null)}</strong>
                                <span>{formatDateTime(reservation.startAt)} · {reservation.durationMinutes} min</span>
                              </div>
                              <div className="host-reservation-flags">
                                <span className={`host-status host-status--${reservation.status.toLowerCase()}`}>{reservation.status}</span>
                                {isSoon ? (
                                  <span className="host-status host-status--soon">
                                    {minutesUntil <= 0 ? "Ahora" : `${minutesUntil} min`}
                                  </span>
                                ) : null}
                                {reservationFlowHint ? (
                                  <span className={`host-flow-hint host-flow-hint--${reservationFlowHint.tone}`}>{reservationFlowHint.label}</span>
                                ) : null}
                              </div>
                            </div>
                            <div className="host-reservation-meta">
                              <span>Mesas: {reservation.tableIds?.length ? reservation.tableIds.join(", ") : "sin asignar"}</span>
                              {reservation.status === "CONFIRMED" && !reservation.tableIds?.length ? (
                                <span>
                                  {bestFitTable
                                    ? `Mejor mesa libre: ${bestFitTable.name?.trim() || `Mesa ${bestFitTable.number}`} · ${bestFitTable.salonName} · ${bestFitTable.capacity} pax`
                                    : "Sin mesa libre sugerida ahora mismo"}
                                </span>
                              ) : null}
                              <span>{reservation.notes?.trim() || "Sin notas operativas"}</span>
                            </div>
                          </div>
                          <div className="host-reservation-actions">
                            {reservation.status === "PENDING" ? (
                              <button
                                type="button"
                                className="btn btn--ghost"
                                onClick={() =>
                                  void hostCommand.mutateAsync({ path: `/v1/reservations/${reservation.id}/confirm` })
                                }
                              >
                                Confirmar
                              </button>
                            ) : null}
                            {reservation.status === "CONFIRMED" ? (
                              <button
                                type="button"
                                className="btn btn--primary"
                                onClick={() =>
                                  void hostCommand.mutateAsync({ path: `/v1/reservations/${reservation.id}/seat` })
                                }
                              >
                                Sentar
                              </button>
                            ) : null}
                            {(reservation.status === "PENDING" || reservation.status === "CONFIRMED") ? (
                              <>
                                <button
                                  type="button"
                                  className="btn btn--ghost"
                                  onClick={() =>
                                    void hostCommand.mutateAsync({
                                      path: `/v1/reservations/${reservation.id}/cancel`,
                                      body: { reasonCode: "HOST_CANCELLED" },
                                    })
                                  }
                                >
                                  Cancelar
                                </button>
                                <button
                                  type="button"
                                  className="btn btn--ghost"
                                  onClick={() =>
                                    void hostCommand.mutateAsync({
                                      path: `/v1/reservations/${reservation.id}/no-show`,
                                      body: { reason: "Guest no-show" },
                                    })
                                  }
                                >
                                  No-show
                                </button>
                              </>
                            ) : null}
                          </div>
                        </article>
                      );
                    })}
                </div>
              </StateView>
            </section>
          </div>
        ) : null}

        {tab === "waitlist" ? (
          <div className="host-grid">
            <section className="cashier-card">
              <div className="cashier-card-head">
                <div>
                  <h2 className="host-card-title">Nueva espera</h2>
                  <p className="host-card-copy">Alta rápida para recepción walk-in.</p>
                </div>
              </div>
              <div className="host-form-panel">
                <strong>{waitlistFocusPlan.title}</strong>
                <p className="host-card-copy">{waitlistFocusPlan.message}</p>
                <div className="host-checklist">
                  {waitlistDraftChecklist.map((step) => (
                    <div key={step.label} className={`host-check ${step.done ? "host-check--done" : ""}`}>
                      <strong>{step.done ? "✓" : "•"}</strong>
                      <span>{step.label}</span>
                    </div>
                  ))}
                </div>
                <div className={`cashier-banner ${waitlistDraftReady ? "cashier-banner--success" : "cashier-banner--info"}`}>
                  <span>
                    {waitlistDraftReady
                      ? "La espera ya tiene los datos mínimos para cargarse."
                      : `Todavía falta: ${waitlistDraftMissing.join(", ")}.`}
                  </span>
                </div>
              </div>
              <form
                className="cashier-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  void createWaitlistMutation.mutateAsync();
                }}
              >
                <label>
                  Nombre del huésped
                  <input value={newWaitlistGuestName} onChange={(e) => setNewWaitlistGuestName(e.target.value)} placeholder="Walk-in / apellido" />
                </label>
                <label>
                  Email
                  <input value={newWaitlistGuestEmail} onChange={(e) => setNewWaitlistGuestEmail(e.target.value)} inputMode="email" placeholder="opcional" />
                </label>
                <label>
                  Teléfono
                  <input value={newWaitlistGuestPhone} onChange={(e) => setNewWaitlistGuestPhone(e.target.value)} inputMode="tel" placeholder="opcional" />
                </label>
                <label>
                  Comensales
                  <input value={newWaitlistPartySize} onChange={(e) => setNewWaitlistPartySize(e.target.value)} inputMode="numeric" />
                </label>
                <label>
                  Minutos prometidos
                  <input value={newWaitlistQuotedMinutes} onChange={(e) => setNewWaitlistQuotedMinutes(e.target.value)} inputMode="numeric" />
                </label>
                <label>
                  Notas
                  <input value={newWaitlistNotes} onChange={(e) => setNewWaitlistNotes(e.target.value)} placeholder="Preferencia, cochecito, etc." />
                </label>
                <button type="submit" className="btn btn--primary btn--xl" disabled={createWaitlistMutation.isPending || !newWaitlistGuestName.trim()}>
                  {createWaitlistMutation.isPending ? "Agregando…" : "Agregar a espera"}
                </button>
                {createWaitlistMutation.error ? (
                  <div className="cashier-banner cashier-banner--warning">
                    <span>{toErrorMessage(createWaitlistMutation.error)}</span>
                  </div>
                ) : null}
              </form>
            </section>

            <section className="cashier-card">
              <div className="cashier-card-head">
                <div>
                  <h2 className="host-card-title">Lista de espera</h2>
                  <p className="host-card-copy">Notificá, priorizá o sentá con una mesa libre.</p>
                </div>
              </div>
              <section className="host-waitlist-summary" aria-label="Resumen de waitlist">
                <article className="host-waitlist-kpi">
                  <span>Esperando</span>
                  <strong>{waitingEntries.filter((entry) => entry.status === "WAITING").length}</strong>
                </article>
                <article className="host-waitlist-kpi">
                  <span>Notificados</span>
                  <strong>{notifiedEntries.length}</strong>
                </article>
                <article className="host-waitlist-kpi">
                  <span>Sentables ahora</span>
                  <strong>{seatableWaitlistCount}</strong>
                </article>
              </section>
              <StateView
                isLoading={waitlistQuery.isLoading || salonDetailsQuery.isLoading || tableStatusesQuery.isLoading}
                error={(waitlistQuery.error as Error) ?? (salonDetailsQuery.error as Error) ?? (tableStatusesQuery.error as Error) ?? null}
                isEmpty={(waitlistQuery.data?.data.length ?? 0) === 0}
                emptyIcon="⏳"
                emptyTitle="Sin espera"
                emptyMessage="No hay grupos en lista de espera."
                onRetry={() => {
                  void waitlistQuery.refetch();
                  void salonDetailsQuery.refetch();
                  void tableStatusesQuery.refetch();
                }}
              >
                <p className="host-list-hint">Primero se muestran grupos sentables ahora o con demora vencida.</p>
                <div className="host-waitlist-list">
                  {prioritizedWaitlistEntries.map((entry) => {
                    const selected = waitlistSeatSelections[entry.id] ?? [];
                    const entryTables = availableTables
                      .filter((table) => table.capacity >= entry.partySize)
                      .slice()
                      .sort((a, b) => {
                        const overfillA = a.capacity - entry.partySize;
                        const overfillB = b.capacity - entry.partySize;
                        if (overfillA !== overfillB) return overfillA - overfillB;
                        return a.salonName.localeCompare(b.salonName) || a.number.localeCompare(b.number);
                      });
                    const waitedMinutes = Math.max(0, Math.round((Date.now() - Date.parse(entry.createdAt)) / 60000));
                    const quotedMinutes = entry.quotedMinutes ?? 0;
                    const overdue = quotedMinutes > 0 && waitedMinutes > quotedMinutes;
                    const waitlistFlowHint =
                      (entry.status === "WAITING" || entry.status === "NOTIFIED") && entryTables.length > 0
                        ? { label: "Sentable ahora", tone: "ready" as const }
                        : overdue
                          ? { label: "Resolver demora", tone: "overdue" as const }
                          : entry.status === "WAITING"
                            ? { label: "Notificar", tone: "waiting" as const }
                            : entry.status === "NOTIFIED"
                              ? { label: "Esperando llegada", tone: "notified" as const }
                              : null;
                    return (
                      <article
                        key={entry.id}
                        className={`host-waitlist-card host-waitlist-card--${entry.status.toLowerCase()} ${overdue ? "host-waitlist-card--overdue" : ""} ${entryTables.length > 0 && (entry.status === "WAITING" || entry.status === "NOTIFIED") ? "host-waitlist-card--seatable" : ""}`}
                      >
                        <div className="host-waitlist-main">
                          <div className="host-waitlist-head">
                            <div className="host-waitlist-title">
                              <strong>{formatWaitlistHeading(entry, guestById.get(entry.guestId ?? "") ?? null)}</strong>
                              <span>{formatWaitlistTiming(waitedMinutes, quotedMinutes)}</span>
                            </div>
                            <div className="host-waitlist-flags">
                              <span className={`host-status host-status--${entry.status.toLowerCase()}`}>{entry.status}</span>
                              {overdue ? <span className="host-status host-status--soon">Demorado</span> : null}
                              {waitlistFlowHint ? (
                                <span className={`host-flow-hint host-flow-hint--${waitlistFlowHint.tone}`}>{waitlistFlowHint.label}</span>
                              ) : null}
                            </div>
                          </div>
                          <div className="host-waitlist-meta">
                            <span>Promesa: {quotedMinutes} min</span>
                            <span>{entryTables.length > 0 ? `${entryTables.length} mesas candidatas` : "Sin mesa disponible ahora"}</span>
                            <span>{entry.notes?.trim() || "Sin notas"}</span>
                          </div>
                          {(entry.status === "WAITING" || entry.status === "NOTIFIED") ? (
                            <div className="host-table-picker">
                              {entryTables.map((table, index) => (
                                <label
                                  key={table.id}
                                  className={`host-table-chip ${selected.includes(table.id) ? "host-table-chip--active" : ""} ${index === 0 ? "host-table-chip--best" : ""}`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={selected.includes(table.id)}
                                    onChange={() =>
                                      setWaitlistSeatSelections((current) => ({
                                        ...current,
                                        [entry.id]: current[entry.id]?.includes(table.id)
                                          ? current[entry.id]!.filter((id) => id !== table.id)
                                          : [...(current[entry.id] ?? []), table.id],
                                      }))
                                    }
                                  />
                                  <span className="host-table-chip__name">{table.name?.trim() || `Mesa ${table.number}`}</span>
                                  <span className="host-table-chip__meta">
                                    {table.salonName} · {table.capacity} pax
                                    {index === 0 ? " · mejor fit" : ""}
                                  </span>
                                </label>
                              ))}
                              {entryTables.length === 0 ? (
                                <div className="cashier-banner cashier-banner--warning">
                                  <span>No hay mesas libres con capacidad suficiente para este grupo.</span>
                                </div>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                        <div className="host-waitlist-actions">
                          <div className="cashier-quick-actions">
                            {entry.status === "WAITING" ? (
                              <>
                                <button type="button" className="btn btn--ghost" onClick={() => void hostCommand.mutateAsync({ path: `/v1/waitlist-entries/${entry.id}/notify` })}>
                                  Notificar
                                </button>
                                <button
                                  type="button"
                                  className="btn btn--ghost"
                                  onClick={() =>
                                    void hostCommand.mutateAsync({
                                      path: `/v1/waitlist-entries/${entry.id}/priority-overrides`,
                                      body: { priorityOverride: -10, reason: "Host bump" },
                                    })
                                  }
                                >
                                  Priorizar
                                </button>
                              </>
                            ) : null}
                            {(entry.status === "WAITING" || entry.status === "NOTIFIED") ? (
                              <button
                                type="button"
                                className="btn btn--primary"
                                disabled={selected.length === 0}
                                onClick={() =>
                                  void hostCommand.mutateAsync({
                                    path: `/v1/waitlist-entries/${entry.id}/seat`,
                                    body: { tableIds: selected },
                                  })
                                }
                              >
                                Sentar
                              </button>
                            ) : null}
                            {(entry.status === "WAITING" || entry.status === "NOTIFIED") ? (
                              <>
                                <button
                                  type="button"
                                  className="btn btn--ghost"
                                  onClick={() =>
                                    void hostCommand.mutateAsync({
                                      path: `/v1/waitlist-entries/${entry.id}/cancel`,
                                      body: { reason: "Guest left" },
                                    })
                                  }
                                >
                                  Cancelar
                                </button>
                                <button type="button" className="btn btn--ghost" onClick={() => void hostCommand.mutateAsync({ path: `/v1/waitlist-entries/${entry.id}/expire` })}>
                                  Expirar
                                </button>
                              </>
                            ) : null}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </StateView>
            </section>
          </div>
        ) : null}

        {tab === "availability" ? (
          <div className="host-grid">
            <section className="cashier-card">
              <div className="cashier-card-head">
                <div>
                  <h2 className="host-card-title">Chequeo de disponibilidad</h2>
                  <p className="host-card-copy">Consulta live para una fecha y cantidad de cubiertos.</p>
                </div>
              </div>
              <div className="host-form-panel">
                <strong>{availabilityFocusPlan.title}</strong>
                <p className="host-card-copy">{availabilityFocusPlan.message}</p>
                <div className="cashier-quick-actions">
                  <button type="button" className="btn btn--ghost" onClick={() => setAvailabilityStartAt(defaultDateTimeLocal())}>
                    Resetear horario
                  </button>
                  <button type="button" className="btn btn--ghost" onClick={() => setAvailabilityPartySize("2")}>
                    Volver a 2 pax
                  </button>
                </div>
              </div>
              <div className="host-form-panel">
                <strong>Qué revisar antes de prometer un horario</strong>
                <div className="host-checklist">
                  {availabilityActionPlan.map((step) => (
                    <div key={step.label} className={`host-check ${step.done ? "host-check--done" : ""}`}>
                      <strong>{step.done ? "✓" : "•"}</strong>
                      <span>{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="cashier-form">
                <label>
                  Comensales
                  <input value={availabilityPartySize} onChange={(e) => setAvailabilityPartySize(e.target.value)} inputMode="numeric" />
                </label>
                <div className="host-preset-group">
                  <span className="host-preset-label">Atajos de comensales</span>
                  <div className="host-preset-row">
                    {PARTY_SIZE_PRESETS.map((preset: string) => (
                      <button
                        key={preset}
                        type="button"
                        className={`host-preset-chip ${availabilityPartySize === preset ? "host-preset-chip--active" : ""}`}
                        onClick={() => setAvailabilityPartySize(preset)}
                      >
                        {preset} pax
                      </button>
                    ))}
                  </div>
                </div>
                <label>
                  Inicio
                  <input type="datetime-local" value={availabilityStartAt} onChange={(e) => setAvailabilityStartAt(e.target.value)} />
                </label>
                <div className="host-preset-group">
                  <span className="host-preset-label">Horarios frecuentes</span>
                  <div className="host-preset-row">
                    {timePresets.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        className={`host-preset-chip ${availabilityStartAt === preset.value ? "host-preset-chip--active" : ""}`}
                        onClick={() => setAvailabilityStartAt(preset.value)}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
                <label>
                  Duración (min)
                  <input value={availabilityDurationMinutes} onChange={(e) => setAvailabilityDurationMinutes(e.target.value)} inputMode="numeric" />
                </label>
                <div className="host-preset-group">
                  <span className="host-preset-label">Duración sugerida</span>
                  <div className="host-preset-row">
                    {DURATION_PRESETS.map((preset: string) => (
                      <button
                        key={preset}
                        type="button"
                        className={`host-preset-chip ${availabilityDurationMinutes === preset ? "host-preset-chip--active" : ""}`}
                        onClick={() => setAvailabilityDurationMinutes(preset)}
                      >
                        {preset} min
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="cashier-card">
              <div className="cashier-card-head">
                <div>
                  <h2 className="host-card-title">Resultado</h2>
                  <p className="host-card-copy">Mesas libres según reservas y ocupación actual.</p>
                </div>
              </div>
              <StateView
                isLoading={availabilityQuery.isLoading}
                error={(availabilityQuery.error as Error) ?? null}
                onRetry={() => void availabilityQuery.refetch()}
              >
                {availabilityQuery.data ? (
                  <>
                    <div className={`cashier-banner ${availabilityQuery.data.data.available ? "cashier-banner--success" : "cashier-banner--warning"}`}>
                      <span>
                        {availabilityQuery.data.data.available
                          ? "Hay disponibilidad para ese horario."
                          : "No hay disponibilidad para ese horario."}
                      </span>
                    </div>
                    <div className="cashier-quick-actions">
                      <button type="button" className="btn btn--primary" onClick={copyAvailabilityIntoReservation}>
                        Pasar a nueva reserva
                      </button>
                      <button type="button" className="btn btn--ghost" onClick={() => setTab("reservations")}>
                        Ir a reservas
                      </button>
                    </div>
                    <div className="owner-links">
                      {availabilityQuery.data.data.freeTableIds.length > 0 ? (
                        availabilityQuery.data.data.freeTableIds.map((tableId) => {
                          const table = allTables.find((item) => item.id === tableId);
                          return (
                            <div key={tableId} className="owner-link-card">
                              <strong>{table?.name?.trim() || `Mesa ${table?.number ?? tableId.slice(0, 8)}`}</strong>
                              <span>{table?.salonName ?? "Mesa disponible"}</span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="owner-link-card">
                          <strong>Sin mesas sugeridas</strong>
                          <span>Ajustá hora, duración o party size.</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : null}
              </StateView>
            </section>
          </div>
        ) : null}

        {hostCommand.error ? (
          <div className="cashier-banner cashier-banner--warning">
            <span>{toErrorMessage(hostCommand.error)}</span>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function defaultDateTimeLocal() {
  const date = new Date(Date.now() + 60 * 60 * 1000);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function buildTimePresets(): TimePreset[] {
  const now = new Date();
  const presets: TimePresetConfig[] = [
    { label: "En 1 h", hoursOffset: 1 },
    { label: "Hoy 20:30", fixedHour: 20, fixedMinute: 30 },
    { label: "Hoy 22:00", fixedHour: 22, fixedMinute: 0 },
    { label: "Mañana 13:00", dayOffset: 1, fixedHour: 13, fixedMinute: 0 },
    { label: "Mañana 21:00", dayOffset: 1, fixedHour: 21, fixedMinute: 0 },
  ];

  return presets.map((preset) => {
    const date = new Date(now);
    if ("hoursOffset" in preset) {
      date.setHours(date.getHours() + preset.hoursOffset, 0, 0, 0);
    } else {
      date.setDate(date.getDate() + (preset.dayOffset ?? 0));
      date.setHours(preset.fixedHour, preset.fixedMinute, 0, 0);
    }
    return {
      label: preset.label,
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`,
    };
  });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function formatReservationHeading(reservation: ReservationListItem, guest: GuestProfile | null) {
  const guestLabel = guest?.displayName?.trim() || reservation.guestId?.slice(0, 8) || "Sin huésped";
  return `${guestLabel} · ${reservation.partySize} pax`;
}

function formatArrivalTiming(minutesUntil: number) {
  if (minutesUntil <= 0) return `llegando ahora · ${Math.abs(minutesUntil)} min ${minutesUntil === 0 ? "de horario" : "tarde"}`;
  if (minutesUntil <= 20) return `llega en ${minutesUntil} min`;
  return `llega en ${minutesUntil} min`;
}

function reservationStatusLabel(status: ReservationListItem["status"]) {
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
    case "EXPIRED":
      return "Expirada";
    default:
      return status;
  }
}

function formatWaitlistHeading(entry: WaitlistEntry, guest: GuestProfile | null) {
  const guestLabel = guest?.displayName?.trim() || entry.guestId?.slice(0, 8) || "Walk-in";
  return `${guestLabel} · ${entry.partySize} pax`;
}

function formatWaitlistTiming(waitedMinutes: number, quotedMinutes: number) {
  if (quotedMinutes > 0 && waitedMinutes > quotedMinutes) {
    return `${waitedMinutes} min esperando · +${waitedMinutes - quotedMinutes} sobre promesa`;
  }
  if (quotedMinutes > 0) {
    return `${waitedMinutes} min esperando · promesa ${quotedMinutes} min`;
  }
  return `${waitedMinutes} min esperando`;
}

function toErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Ocurrió un error.";
}

function labelForHostCommand(path: string) {
  if (path.endsWith("/confirm")) return "Reserva confirmada.";
  if (path.endsWith("/seat")) return "Operación de seating completada.";
  if (path.endsWith("/cancel")) return "Operación cancelada correctamente.";
  if (path.endsWith("/no-show")) return "Reserva marcada como no-show.";
  if (path.endsWith("/notify")) return "Grupo notificado.";
  if (path.endsWith("/expire")) return "Entrada expirada.";
  if (path.endsWith("/priority-overrides")) return "Prioridad actualizada.";
  return "Acción ejecutada.";
}

function waitlistPriority(status: WaitlistEntry["status"]) {
  switch (status) {
    case "NOTIFIED":
      return 0;
    case "WAITING":
      return 1;
    case "SEATED":
      return 2;
    case "CANCELLED":
      return 3;
    case "EXPIRED":
      return 4;
    default:
      return 9;
  }
}
