import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AppHeader } from "../../components/app-header.js";
import { StateView } from "../../components/state-view.js";
import { useApi } from "../../app/use-api.js";
import { useSession } from "../../app/session-context.js";
import { elapsedLabel, formatMoney } from "../../lib/format.js";
import { ApiError } from "../../lib/api-client.js";
import { PendingChecksPanel } from "./pending-checks-panel.js";
import type {
  ApiData,
  CashMovement,
  CashMovementDirection,
  CashMovementType,
  DailySettlement,
  CashReconciliation,
  CashRegister,
  CashSession,
  ExpectedSummary,
} from "../../lib/cashier-types.js";

const DEFAULT_CURRENCY = "ARS";
const QUICK_MOVEMENTS: Array<{
  type: CashMovementType;
  label: string;
  direction?: CashMovementDirection;
}> = [
  { type: "CASH_SALE", label: "Venta" },
  { type: "CASH_REFUND", label: "Devolución" },
  { type: "DEPOSIT", label: "Depósito" },
  { type: "WITHDRAWAL", label: "Retiro" },
  { type: "TIP_IN", label: "Propina +" },
  { type: "TIP_OUT", label: "Propina -" },
  { type: "ADJUSTMENT", label: "Ajuste +" , direction: "IN" },
  { type: "ADJUSTMENT", label: "Ajuste -" , direction: "OUT" },
];

const QUICK_AMOUNTS = [1000, 5000, 10000, 20000];
const OPENING_PRESETS = [0, 10000, 20000, 50000];

const MOVEMENT_LABELS: Record<CashMovementType, string> = {
  OPENING: "Apertura",
  CASH_SALE: "Venta efectivo",
  CASH_REFUND: "Devolución",
  DEPOSIT: "Depósito",
  WITHDRAWAL: "Retiro",
  TIP_IN: "Propina entra",
  TIP_OUT: "Propina sale",
  ADJUSTMENT: "Ajuste",
  CLOSING_COUNT: "Conteo cierre",
};

const SESSION_STATUS_LABELS: Record<CashSession["status"], string> = {
  OPEN: "Abierta",
  CLOSING: "En cierre",
  CLOSED: "Cerrada",
  RECONCILED: "Reconciliada",
};

const RECONCILIATION_STATUS_LABELS: Record<CashReconciliation["status"], string> = {
  DRAFT: "Borrador",
  SUBMITTED: "Enviada",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
};

type CashierFocusSection = "session" | "movement" | "reconciliation" | "history";

export function CashierPage() {
  const api = useApi();
  const { selectedBranchId, selectedRegisterId } = useSession();
  const [openingAmount, setOpeningAmount] = useState("0");
  const [movementType, setMovementType] = useState<CashMovementType>("CASH_SALE");
  const [movementDirection, setMovementDirection] = useState<CashMovementDirection>("IN");
  const [movementAmount, setMovementAmount] = useState("0");
  const [countedAmount, setCountedAmount] = useState("0");
  const [activeReconciliationId, setActiveReconciliationId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [settlementDate, setSettlementDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedHistorySessionId, setSelectedHistorySessionId] = useState<string | null>(null);
  const [movementFilter, setMovementFilter] = useState<"ALL" | "IN" | "OUT">("ALL");
  const [sessionStatusFilter, setSessionStatusFilter] = useState<"ALL" | CashSession["status"]>("ALL");
  const [focusSection, setFocusSection] = useState<CashierFocusSection | null>(null);

  const registerQuery = useQuery({
    queryKey: ["cashier-register", selectedRegisterId],
    enabled: Boolean(selectedRegisterId),
    queryFn: () => api<ApiData<CashRegister>>(`/v1/cash-registers/${selectedRegisterId}`),
    refetchInterval: 15_000,
  });

  const sessionListQuery = useQuery({
    queryKey: ["cashier-sessions", selectedRegisterId],
    enabled: Boolean(selectedRegisterId),
    queryFn: () => api<ApiData<CashSession[]>>(`/v1/cash-registers/${selectedRegisterId}/sessions`),
    refetchInterval: 5_000,
  });

  const activeSession = useMemo(
    () => sessionListQuery.data?.data.find((s) => s.status === "OPEN" || s.status === "CLOSING") ?? null,
    [sessionListQuery.data],
  );

  const movementsQuery = useQuery({
    queryKey: ["cashier-movements", activeSession?.id],
    enabled: Boolean(activeSession?.id),
    queryFn: () => api<ApiData<CashMovement[]>>(`/v1/cash-sessions/${activeSession!.id}/movements`),
    refetchInterval: 5_000,
  });

  const closedSession = useMemo(
    () => sessionListQuery.data?.data.find((s) => s.status === "CLOSED" || s.status === "RECONCILED") ?? null,
    [sessionListQuery.data],
  );

  const reconciliationRecordQuery = useQuery({
    queryKey: ["cashier-reconciliation-record", activeReconciliationId],
    enabled: Boolean(activeReconciliationId),
    queryFn: async (): Promise<CashReconciliation | null> => {
      const reconciliation = await api<ApiData<CashReconciliation>>(`/v1/cash-reconciliations/${activeReconciliationId!}`);
      return reconciliation.data;
    },
  });

  const reconciliationSummaryQuery = useQuery({
    queryKey: ["cashier-reconciliation-summary", reconciliationRecordQuery.data?.id],
    enabled: Boolean(reconciliationRecordQuery.data?.id),
    queryFn: () =>
      api<ApiData<ExpectedSummary>>(`/v1/cash-reconciliations/${reconciliationRecordQuery.data!.id}/summary`),
  });

  const dailySettlementQuery = useQuery({
    queryKey: ["cashier-daily-settlement", selectedBranchId, settlementDate],
    enabled: Boolean(selectedBranchId),
    queryFn: () =>
      api<ApiData<DailySettlement>>(
        `/v1/branches/${selectedBranchId}/daily-settlement?businessDate=${settlementDate}&currency=${DEFAULT_CURRENCY}`,
      ),
    refetchInterval: 15_000,
  });

  const refresh = async () => {
    await sessionListQuery.refetch();
    if (activeSession?.id) await movementsQuery.refetch();
  };

  const openSessionMutation = useMutation({
    mutationFn: async () =>
      api<ApiData<CashSession>>(`/v1/cash-registers/${selectedRegisterId}/sessions`, {
        method: "POST",
        body: {
          currency: DEFAULT_CURRENCY,
          businessDate: new Date().toISOString().slice(0, 10),
          timezone: "America/Argentina/Buenos_Aires",
          openingAmountMinorUnits: Math.round(Number(openingAmount || "0") * 100),
        },
      }),
    onSuccess: refresh,
  });

  const movementMutation = useMutation({
    mutationFn: async () =>
      api<ApiData<CashMovement>>(`/v1/cash-sessions/${activeSession!.id}/movements`, {
        method: "POST",
        body: {
          type: movementType,
          direction: movementType === "ADJUSTMENT" ? movementDirection : undefined,
          amountMinorUnits: Math.round(Number(movementAmount || "0") * 100),
          currency: activeSession?.currency ?? DEFAULT_CURRENCY,
        },
      }),
    onSuccess: async () => {
      setMovementAmount("0");
      setSuccessMessage("Movimiento registrado.");
      await refresh();
    },
  });

  const beginCloseMutation = useMutation({
    mutationFn: async () =>
      api<ApiData<CashSession>>(`/v1/cash-sessions/${activeSession!.id}/begin-close`, {
        method: "POST",
        body: {},
      }),
    onSuccess: refresh,
  });

  const closeMutation = useMutation({
    mutationFn: async () =>
      api<ApiData<{ session: CashSession; reconciliation: CashReconciliation }>>(`/v1/cash-sessions/${activeSession!.id}/close`, {
        method: "POST",
        body: {},
      }),
    onSuccess: async (result) => {
      setActiveReconciliationId(result.data.reconciliation.id);
      setCountedAmount(
        ((result.data.reconciliation.countedMinorUnits ?? result.data.reconciliation.expectedMinorUnits) / 100).toFixed(2),
      );
      setSuccessMessage("Sesión cerrada y reconciliación creada.");
      await refresh();
      await reconciliationRecordQuery.refetch();
    },
  });

  const suspendMutation = useMutation({
    mutationFn: async () =>
      api<ApiData<CashSession>>(`/v1/cash-sessions/${activeSession!.id}/suspend`, {
        method: "POST",
        body: {},
      }),
    onSuccess: refresh,
  });

  const resumeMutation = useMutation({
    mutationFn: async () =>
      api<ApiData<CashSession>>(`/v1/cash-sessions/${activeSession!.id}/resume`, {
        method: "POST",
        body: {},
      }),
    onSuccess: refresh,
  });

  const recordCountsMutation = useMutation({
    mutationFn: async () =>
      api<ApiData<CashReconciliation>>(`/v1/cash-reconciliations/${reconciliationRecordQuery.data!.id}/record-counts`, {
        method: "POST",
        body: { countedMinorUnits: Math.round(Number(countedAmount || "0") * 100) },
      }),
    onSuccess: async () => {
      setSuccessMessage("Conteo guardado.");
      await reconciliationRecordQuery.refetch();
      await reconciliationSummaryQuery.refetch();
    },
  });

  const submitReconciliationMutation = useMutation({
    mutationFn: async () =>
      api<ApiData<CashReconciliation>>(`/v1/cash-reconciliations/${reconciliationRecordQuery.data!.id}/submit`, {
        method: "POST",
        body: {},
      }),
    onSuccess: async () => {
      setSuccessMessage("Reconciliación enviada para aprobación.");
      await reconciliationRecordQuery.refetch();
      await reconciliationSummaryQuery.refetch();
    },
  });

  const movementError =
    openSessionMutation.error ??
    movementMutation.error ??
    beginCloseMutation.error ??
    closeMutation.error ??
    suspendMutation.error ??
    resumeMutation.error ??
    recordCountsMutation.error ??
    submitReconciliationMutation.error;

  const movementSummary = useMemo(() => {
    const movements = movementsQuery.data?.data ?? [];
    let balance = activeSession?.openingAmountMinorUnits ?? 0;
    for (const movement of movements) {
      if (movement.type === "CLOSING_COUNT") continue;
      balance += movement.direction === "IN" ? movement.amountMinorUnits : -movement.amountMinorUnits;
    }
    return balance;
  }, [movementsQuery.data, activeSession]);

  const movementStats = useMemo(() => {
    const movements = movementsQuery.data?.data ?? [];
    const salesIn = movements
      .filter((movement) => movement.type === "CASH_SALE")
      .reduce((sum, movement) => sum + movement.amountMinorUnits, 0);
    const withdrawalsOut = movements
      .filter((movement) => movement.direction === "OUT" && movement.type !== "CLOSING_COUNT")
      .reduce((sum, movement) => sum + movement.amountMinorUnits, 0);
    return {
      count: movements.length,
      salesIn,
      withdrawalsOut,
    };
  }, [movementsQuery.data]);
  const filteredMovements = useMemo(() => {
    const movements = (movementsQuery.data?.data ?? []).slice().reverse();
    if (movementFilter === "ALL") return movements;
    return movements.filter((movement) => movement.direction === movementFilter);
  }, [movementsQuery.data, movementFilter]);

  const sessionAgeLabel = activeSession
    ? new Date(activeSession.openedAt).toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;
  const now = Date.now();
  const sessionHistory = useMemo(
    () =>
      (sessionListQuery.data?.data ?? [])
        .filter((session) => sessionStatusFilter === "ALL" || session.status === sessionStatusFilter)
        .slice()
        .sort((a, b) => {
          const score = (session: CashSession) => {
            if (session.status === "CLOSING") return 0;
            if (session.status === "OPEN") return 1;
            if (session.status === "CLOSED") return 2;
            return 3;
          };
          const scoreDiff = score(a) - score(b);
          if (scoreDiff !== 0) return scoreDiff;
          return new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime();
        }),
    [sessionListQuery.data, sessionStatusFilter],
  );
  const selectedHistorySession =
    sessionHistory.find((session) => session.id === selectedHistorySessionId) ?? closedSession ?? null;
  const selectedSettlementSession =
    dailySettlementQuery.data?.data.sessions.find((session) => session.cashSessionId === selectedHistorySession?.id) ?? null;
  const prioritizedSettlementSessions = useMemo(
    () =>
      (dailySettlementQuery.data?.data.sessions ?? [])
        .slice()
        .sort((a, b) => {
          const score = (session: DailySettlement["sessions"][number]) => {
            const hasDifference = (session.differenceMinorUnits ?? 0) !== 0;
            if (hasDifference) return 0;
            if (session.status === "CLOSING") return 1;
            if (session.status === "OPEN") return 2;
            if (session.status === "CLOSED") return 3;
            return 4;
          };
          const scoreDiff = score(a) - score(b);
          if (scoreDiff !== 0) return scoreDiff;
          return (b.differenceMinorUnits ?? 0) - (a.differenceMinorUnits ?? 0);
        }),
    [dailySettlementQuery.data],
  );
  const historyAttentionCount = useMemo(
    () =>
      prioritizedSettlementSessions.filter(
        (session) => (session.differenceMinorUnits ?? 0) !== 0 || session.status === "CLOSING" || session.status === "OPEN",
      ).length,
    [prioritizedSettlementSessions],
  );
  const reconciliationDifference = reconciliationSummaryQuery.data?.data.differenceMinorUnits ?? null;
  const differenceTone =
    reconciliationDifference == null
      ? "neutral"
      : reconciliationDifference === 0
        ? "ok"
        : reconciliationDifference > 0
          ? "positive"
          : "negative";
  const nextStep = getNextStep({
    activeSession,
    reconciliationStatus: reconciliationRecordQuery.data?.status ?? null,
    hasCountedAmount:
      reconciliationSummaryQuery.data?.data.countedMinorUnits != null ||
      reconciliationRecordQuery.data?.countedMinorUnits != null,
  });
  const priority = getCashierPriority({
    activeSession,
    movementCount: movementStats.count,
    withdrawalsOut: movementStats.withdrawalsOut,
    salesIn: movementStats.salesIn,
    reconciliationStatus: reconciliationRecordQuery.data?.status ?? null,
    hasCountedAmount:
      reconciliationSummaryQuery.data?.data.countedMinorUnits != null ||
      reconciliationRecordQuery.data?.countedMinorUnits != null,
    differenceMinorUnits: reconciliationDifference,
  });
  const reconciliationSummaryLabel = !activeSession
    ? "Sin sesión"
    : reconciliationRecordQuery.data
      ? RECONCILIATION_STATUS_LABELS[reconciliationRecordQuery.data.status]
      : activeSession.status === "CLOSING"
        ? "Pendiente"
        : "No iniciada";
  const sessionChecklist = [
    { label: "Sesión abierta", done: Boolean(activeSession) },
    { label: "Turno en operación", done: activeSession?.status === "OPEN" },
    { label: "Cierre iniciado", done: activeSession?.status === "CLOSING" },
    { label: "Turno reconciliado", done: activeSession?.status === "RECONCILED" || reconciliationRecordQuery.data?.status === "APPROVED" },
  ];
  const sessionPending = sessionChecklist.filter((step) => !step.done).map((step) => step.label);
  const movementChecklist = [
    { label: "Caja abierta para operar", done: Boolean(activeSession) },
    { label: "Hay actividad registrada", done: movementStats.count > 0 },
    { label: "Entradas/salidas visibles", done: filteredMovements.length > 0 || movementFilter === "ALL" },
    { label: "Sin desbalance obvio cash", done: !(movementStats.withdrawalsOut > movementStats.salesIn && movementStats.withdrawalsOut > 0) },
  ];
  const reconciliationChecklist = [
    { label: "Cierre iniciado", done: activeSession?.status === "CLOSING" || activeSession?.status === "CLOSED" || activeSession?.status === "RECONCILED" },
    { label: "Conteo cargado", done: hasRecordedCount(reconciliationSummaryQuery.data?.data.countedMinorUnits, reconciliationRecordQuery.data?.countedMinorUnits) },
    { label: "Conciliación enviada", done: reconciliationRecordQuery.data?.status === "SUBMITTED" || reconciliationRecordQuery.data?.status === "APPROVED" },
    { label: "Sin diferencia", done: reconciliationDifference === 0 || reconciliationDifference == null },
  ];
  const settlementDifference = dailySettlementQuery.data?.data.differenceMinorUnits ?? null;
  const settlementChecklist = [
    { label: "Hay sesiones del día para revisar", done: (dailySettlementQuery.data?.data.sessionCount ?? 0) > 0 },
    { label: "El día no muestra diferencia global", done: settlementDifference === 0 || settlementDifference == null },
    { label: "No quedan sesiones con alertas", done: historyAttentionCount === 0 },
    { label: "Hay una sesión puntual seleccionada", done: Boolean(selectedHistorySession) },
  ];
  const settlementPending = settlementChecklist.filter((step) => !step.done).map((step) => step.label);
  const historyChecklist = [
    { label: "Existe historial cargado", done: sessionHistory.length > 0 },
    { label: "Hay una sesión elegida para inspeccionar", done: Boolean(selectedHistorySession) },
    { label: "La sesión elegida tiene settlement asociado", done: !selectedHistorySession || Boolean(selectedSettlementSession) },
    { label: "No quedan sesiones abiertas o con diferencia", done: historyAttentionCount === 0 },
  ];
  const historyPending = historyChecklist.filter((step) => !step.done).map((step) => step.label);
  const cashierStageCards = [
    {
      label: "Apertura",
      title: activeSession ? "Caja abierta" : "Falta abrir caja",
      detail: activeSession
        ? `Ya podés operar sobre ${registerQuery.data?.data.displayName ?? "la caja actual"}.`
        : "El primer paso es abrir la sesión para empezar a registrar movimiento.",
      tone: activeSession ? "success" : "warning",
      active: focusSection === "session",
      onClick: () => setFocusSection("session" as const),
    },
    {
      label: "Operación",
      title: movementStats.count > 0 ? `${movementStats.count} movimiento${movementStats.count === 1 ? "" : "s"} registrado${movementStats.count === 1 ? "" : "s"}` : "Todavía sin actividad",
      detail:
        movementStats.count > 0
          ? `Ventas ${formatMoney(movementStats.salesIn, activeSession?.currency ?? DEFAULT_CURRENCY)} y salidas ${formatMoney(movementStats.withdrawalsOut, activeSession?.currency ?? DEFAULT_CURRENCY)}.`
          : "Cuando empiece el turno, acá vas a ver si la caja realmente se está moviendo.",
      tone: movementStats.count > 0 ? "info" : "warning",
      active: focusSection === "movement",
      onClick: () => setFocusSection("movement" as const),
    },
    {
      label: "Cierre",
      title:
        activeSession?.status === "CLOSING"
          ? "Cierre en curso"
          : activeSession?.status === "OPEN"
            ? "Todavía en operación"
            : closedSession
              ? "Último cierre generado"
              : "Sin cierre reciente",
      detail:
        activeSession?.status === "CLOSING"
          ? "Conviene terminar conteo y pasar a conciliación para no dejar el turno colgado."
          : activeSession?.status === "OPEN"
            ? "Todavía no corresponde cerrar; seguí registrando operación."
            : closedSession
              ? "Ya existe un cierre reciente para revisar o conciliar."
              : "Cuando termine el turno, este frente va a tomar protagonismo.",
      tone: activeSession?.status === "CLOSING" ? "warning" : activeSession?.status === "OPEN" ? "info" : "success",
      active: focusSection === "session" || focusSection === "reconciliation",
      onClick: () => setFocusSection(activeSession?.status === "CLOSING" ? "reconciliation" : "session"),
    },
    {
      label: "Conciliación",
      title: reconciliationSummaryLabel,
      detail:
        reconciliationDifference == null
          ? "Todavía no hay diferencia calculada o no empezó la conciliación."
          : `Diferencia actual ${formatMoney(reconciliationDifference, activeSession?.currency ?? DEFAULT_CURRENCY)}.`,
      tone:
        reconciliationRecordQuery.data?.status === "APPROVED" || reconciliationDifference === 0
          ? "success"
          : reconciliationRecordQuery.data?.status === "SUBMITTED"
            ? "info"
            : "warning",
      active: focusSection === "reconciliation" || focusSection === "history",
      onClick: () => setFocusSection("reconciliation" as const),
    },
  ] as const;

  return (
    <main className="cashier-app">
      <AppHeader
        title="Caja"
        subtitle={registerQuery.data?.data.displayName ?? "Operación de cajero"}
        right={
          activeSession ? (
            <span className="cashier-session-pill">{SESSION_STATUS_LABELS[activeSession.status]}</span>
          ) : undefined
        }
      />

      <section className="cashier-shell">
        <StateView
          isLoading={registerQuery.isLoading || sessionListQuery.isLoading}
          error={(registerQuery.error as Error) ?? (sessionListQuery.error as Error) ?? null}
        >
          {successMessage ? (
            <div className="cashier-banner cashier-banner--success" role="status">
              <span>{successMessage}</span>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setSuccessMessage(null)}>
                Cerrar
              </button>
            </div>
          ) : null}

          <div className={`cashier-banner ${nextStep.tone === "success" ? "cashier-banner--success" : nextStep.tone === "warning" ? "cashier-banner--warning" : "cashier-banner--info"}`}>
            <span>{nextStep.message}</span>
          </div>

          <div
            className={`cashier-priority-banner cashier-priority-banner--${priority.tone}`}
            role="region"
            aria-label="Prioridad operativa de caja"
          >
            <div className="cashier-priority-copy">
              <strong>{priority.title}</strong>
              <span>{priority.message}</span>
            </div>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setFocusSection(priority.section)}
            >
              {priority.ctaLabel}
            </button>
          </div>

          <div className="cashier-grid">
            <article className="cashier-card cashier-card--hero">
              <div className="cashier-hero-row">
                <div>
                  <p className="cashier-eyebrow">Caja activa</p>
                  <h2>{registerQuery.data?.data.displayName ?? "Sin caja"}</h2>
                  <p className="muted">
                    {registerQuery.data?.data.code ?? "—"} · {activeSession?.currency ?? DEFAULT_CURRENCY}
                  </p>
                </div>
                <div className="cashier-balance-block">
                  <span className="cashier-balance-label">Saldo observado</span>
                  <strong>{formatMoney(movementSummary, activeSession?.currency ?? DEFAULT_CURRENCY)}</strong>
                </div>
              </div>
            </article>

            <PendingChecksPanel activeSession={activeSession} onSettled={refresh} />

            <article className="cashier-kpi-strip">
              <button
                type="button"
                className={`cashier-kpi-card cashier-kpi-card--action${focusSection === "session" ? " cashier-kpi-card--active" : ""}`}
                onClick={() => setFocusSection("session")}
              >
                <span>Sesión</span>
                <strong>{activeSession ? SESSION_STATUS_LABELS[activeSession.status] : "Sin abrir"}</strong>
                <span className="cashier-kpi-detail">
                  {activeSession ? `Apertura ${formatMoney(activeSession.openingAmountMinorUnits, activeSession.currency)}` : "Abrí la caja para operar"}
                </span>
              </button>
              <button
                type="button"
                className={`cashier-kpi-card cashier-kpi-card--action${focusSection === "movement" ? " cashier-kpi-card--active" : ""}`}
                onClick={() => setFocusSection("movement")}
              >
                <span>Movimientos</span>
                <strong>{movementStats.count}</strong>
                <span className="cashier-kpi-detail">
                  Ventas {formatMoney(movementStats.salesIn, activeSession?.currency ?? DEFAULT_CURRENCY)}
                </span>
              </button>
              <button
                type="button"
                className={`cashier-kpi-card cashier-kpi-card--action${focusSection === "reconciliation" ? " cashier-kpi-card--active" : ""}`}
                onClick={() => setFocusSection("reconciliation")}
              >
                <span>Conciliación</span>
                <strong>{reconciliationSummaryLabel}</strong>
                <span className="cashier-kpi-detail">
                  {reconciliationDifference == null
                    ? "Sin diferencia calculada"
                    : `Dif. ${formatMoney(reconciliationDifference, activeSession?.currency ?? DEFAULT_CURRENCY)}`}
                </span>
              </button>
              <button
                type="button"
                className={`cashier-kpi-card cashier-kpi-card--action${focusSection === "history" ? " cashier-kpi-card--active" : ""}`}
                onClick={() => setFocusSection("history")}
              >
                <span>Historial</span>
                <strong>{sessionHistory.length}</strong>
                <span className="cashier-kpi-detail">
                  {historyAttentionCount > 0 ? `${historyAttentionCount} sesión/es a revisar` : "Sin alertas visibles"}
                </span>
              </button>
            </article>

            <article className="cashier-card cashier-card--wide">
              <div className="cashier-card-head">
                <div>
                  <h2>Lectura por etapa</h2>
                  <p className="muted">Apertura, operación, cierre y conciliación en un solo vistazo.</p>
                </div>
              </div>
              <div className="cashier-stage-grid">
                {cashierStageCards.map((card) => (
                  <button
                    key={card.label}
                    type="button"
                    className={`cashier-stage-card cashier-stage-card--${card.tone}${card.active ? " cashier-stage-card--active" : ""}`}
                    onClick={card.onClick}
                  >
                    <span>{card.label}</span>
                    <strong>{card.title}</strong>
                    <p>{card.detail}</p>
                  </button>
                ))}
              </div>
            </article>

            <article className={`cashier-card${focusSection === "session" ? " cashier-card--focus" : ""}`}>
              <h2>Caja actual</h2>
              <p>{registerQuery.data?.data.displayName ?? "—"}</p>
              <p className="muted">{registerQuery.data?.data.code ?? ""}</p>
              <p className="muted">{selectedBranchId ?? ""}</p>
            </article>

            <article className={`cashier-card${focusSection === "session" ? " cashier-card--focus" : ""}`}>
              <h2>Sesión</h2>
              <p className="cashier-list-hint">Abrí, pausá o cerrá la caja desde acá según el momento del turno.</p>
              {activeSession ? (
                <>
                  <div className="cashier-panel">
                    <strong>Checkpoint del turno</strong>
                    <div className="cashier-checklist">
                      {sessionChecklist.map((step) => (
                        <div key={step.label} className={`cashier-check ${step.done ? "cashier-check--done" : ""}`}>
                          <strong>{step.done ? "✓" : "•"}</strong>
                          <span>{step.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className={`cashier-banner ${activeSession.status === "OPEN" ? "cashier-banner--info" : activeSession.status === "CLOSING" ? "cashier-banner--warning" : "cashier-banner--success"}`}>
                      <span>
                        {activeSession.status === "OPEN"
                          ? "La caja está operativa; podés seguir cargando movimientos o preparar el cierre."
                          : activeSession.status === "CLOSING"
                            ? "El turno ya entró en cierre; conviene completar conteo y conciliación."
                            : "La sesión ya salió de operación activa."}
                      </span>
                    </div>
                  </div>
                  <p className="cashier-session-status">{SESSION_STATUS_LABELS[activeSession.status]}</p>
                  <p className="muted">Fecha operativa: {activeSession.businessDate}</p>
                  <p className="muted">Abierta: {sessionAgeLabel}</p>
                  <p className="muted">Apertura: {formatMoney(activeSession.openingAmountMinorUnits, activeSession.currency)}</p>
                  <p className="muted">Saldo observado: {formatMoney(movementSummary, activeSession.currency)}</p>
                  <div className="cashier-progress">
                    <span className={`cashier-progress-step ${activeSession.status === "OPEN" ? "cashier-progress-step--active" : "cashier-progress-step--done"}`}>Abierta</span>
                    <span className={`cashier-progress-step ${activeSession.status === "CLOSING" ? "cashier-progress-step--active" : activeSession.status === "CLOSED" || activeSession.status === "RECONCILED" ? "cashier-progress-step--done" : ""}`}>Cierre</span>
                    <span className={`cashier-progress-step ${activeSession.status === "RECONCILED" ? "cashier-progress-step--done" : ""}`}>Reconciliada</span>
                  </div>

                  <div className="cashier-action-row">
                    {activeSession.status === "OPEN" ? (
                      <>
                        <button type="button" className="btn btn--ghost" onClick={() => void suspendMutation.mutateAsync()}>
                          Pausar
                        </button>
                        <button type="button" className="btn btn--primary" onClick={() => void beginCloseMutation.mutateAsync()}>
                          Iniciar cierre
                        </button>
                      </>
                    ) : null}

                    {activeSession.status === "CLOSING" ? (
                      <>
                        {activeSession.suspended ? (
                          <button type="button" className="btn btn--ghost" onClick={() => void resumeMutation.mutateAsync()}>
                            Reanudar
                          </button>
                        ) : (
                          <button type="button" className="btn btn--ghost" onClick={() => void suspendMutation.mutateAsync()}>
                            Pausar
                          </button>
                        )}
                        <button type="button" className="btn btn--primary" onClick={() => void closeMutation.mutateAsync()}>
                          Cerrar sesión
                        </button>
                      </>
                    ) : null}
                  </div>
                </>
              ) : (
                <div className="cashier-form">
                  <div className="cashier-panel">
                    <strong>Antes de abrir</strong>
                    <div className="cashier-checklist">
                      <div className="cashier-check">
                        <strong>•</strong>
                        <span>Definí el efectivo inicial del turno.</span>
                      </div>
                      <div className="cashier-check">
                        <strong>•</strong>
                        <span>Verificá que esta sea la caja física correcta.</span>
                      </div>
                    </div>
                  </div>
                  <label>
                    <span>Apertura inicial</span>
                    <input type="number" min="0" step="0.01" value={openingAmount} onChange={(e) => setOpeningAmount(e.target.value)} />
                  </label>
                  <div className="cashier-quick-amounts">
                    {OPENING_PRESETS.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => setOpeningAmount((amount / 100).toFixed(2))}
                      >
                        {formatMoney(amount, DEFAULT_CURRENCY)}
                      </button>
                    ))}
                  </div>
                  <button type="button" className="btn btn--primary" onClick={() => void openSessionMutation.mutateAsync()}>
                    Abrir sesión
                  </button>
                </div>
              )}
            </article>

            <article className={`cashier-card cashier-card--wide${focusSection === "movement" ? " cashier-card--focus" : ""}`}>
              <div className="cashier-card-head">
                <h2>Registrar movimiento</h2>
                <span className="muted">Acciones rápidas y carga manual</span>
              </div>
              {activeSession ? (
                <div className="cashier-quick-actions">
                  {QUICK_MOVEMENTS.map((quick) => (
                    <button
                      key={`${quick.type}-${quick.label}`}
                      type="button"
                      className={`btn ${movementType === quick.type && (quick.type !== "ADJUSTMENT" || quick.direction === movementDirection) ? "btn--primary" : "btn--ghost"} btn--sm`}
                      onClick={() => {
                        setMovementType(quick.type);
                        if (quick.direction) setMovementDirection(quick.direction);
                      }}
                    >
                      {quick.label}
                    </button>
                  ))}
                </div>
              ) : null}

              {activeSession ? (
                <div className="cashier-form">
                  <div className="cashier-panel">
                    <strong>Chequeo de movimientos</strong>
                    <div className="cashier-checklist">
                      {movementChecklist.map((step) => (
                        <div key={step.label} className={`cashier-check ${step.done ? "cashier-check--done" : ""}`}>
                          <strong>{step.done ? "✓" : "•"}</strong>
                          <span>{step.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <label>
                    <span>Tipo</span>
                    <select value={movementType} onChange={(e) => setMovementType(e.target.value as CashMovementType)}>
                      <option value="CASH_SALE">Venta efectivo</option>
                      <option value="CASH_REFUND">Devolución</option>
                      <option value="DEPOSIT">Depósito</option>
                      <option value="WITHDRAWAL">Retiro</option>
                      <option value="TIP_IN">Propina entra</option>
                      <option value="TIP_OUT">Propina sale</option>
                      <option value="ADJUSTMENT">Ajuste manual</option>
                      <option value="CLOSING_COUNT">Conteo de cierre</option>
                    </select>
                  </label>

                  {movementType === "ADJUSTMENT" ? (
                    <label>
                      <span>Dirección</span>
                      <select value={movementDirection} onChange={(e) => setMovementDirection(e.target.value as CashMovementDirection)}>
                        <option value="IN">Ingresa</option>
                        <option value="OUT">Sale</option>
                      </select>
                    </label>
                  ) : null}

                  <label>
                    <span>Monto</span>
                    <input type="number" min="0.01" step="0.01" value={movementAmount} onChange={(e) => setMovementAmount(e.target.value)} />
                  </label>

                  <div className="cashier-quick-amounts">
                    {QUICK_AMOUNTS.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => setMovementAmount((amount / 100).toFixed(2))}
                      >
                        {formatMoney(amount, activeSession.currency)}
                      </button>
                    ))}
                  </div>

                  <button type="button" className="btn btn--primary" onClick={() => void movementMutation.mutateAsync()}>
                    Registrar movimiento
                  </button>
                </div>
              ) : (
                <p className="muted">Abrí una sesión para empezar a registrar movimientos.</p>
              )}

              {movementError ? (
                <p role="alert" className="login-error">
                  {movementError instanceof ApiError ? movementError.problem.title : (movementError as Error).message}
                </p>
              ) : null}
            </article>

            <article className={`cashier-card cashier-card--wide${focusSection === "movement" ? " cashier-card--focus" : ""}`}>
              <div className="cashier-card-head">
                <h2>Movimientos recientes</h2>
                <span className="muted">Últimos registros de esta sesión</span>
              </div>
              <p className="cashier-list-hint">Usá los filtros para auditar rápido entradas, salidas y retiros atípicos.</p>
              <div className="cashier-toolbar">
                <div className="cashier-segmented">
                  <button type="button" className={`btn btn--sm ${movementFilter === "ALL" ? "btn--primary" : "btn--ghost"}`} onClick={() => setMovementFilter("ALL")}>Todos</button>
                  <button type="button" className={`btn btn--sm ${movementFilter === "IN" ? "btn--primary" : "btn--ghost"}`} onClick={() => setMovementFilter("IN")}>Entradas</button>
                  <button type="button" className={`btn btn--sm ${movementFilter === "OUT" ? "btn--primary" : "btn--ghost"}`} onClick={() => setMovementFilter("OUT")}>Salidas</button>
                </div>
              </div>
              <StateView
                isLoading={movementsQuery.isLoading}
                error={(movementsQuery.error as Error) ?? null}
                isEmpty={!activeSession || filteredMovements.length === 0}
                emptyTitle="Sin movimientos"
                emptyMessage="Todavía no hay movimientos cargados para esta sesión."
                emptyIcon="🧾"
              >
                <ul className="cashier-movement-list">
                  {filteredMovements.map((movement) => (
                    <li key={movement.id}>
                      <div className="cashier-movement-main">
                        <strong>{MOVEMENT_LABELS[movement.type]}</strong>
                        <span className={`cashier-direction cashier-direction--${movement.direction.toLowerCase()}`}>
                          {movement.direction}
                        </span>
                      </div>
                      <span>{formatMoney(movement.amountMinorUnits, movement.currency)}</span>
                      <span className="muted">
                        {new Date(movement.recordedAt).toLocaleString("es-AR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                      <span className="muted">rev {movement.ledgerRevision}</span>
                    </li>
                  ))}
                </ul>
              </StateView>
            </article>

            {reconciliationRecordQuery.data ? (
              <article className={`cashier-card cashier-card--wide${focusSection === "reconciliation" ? " cashier-card--focus" : ""}`}>
                <div className="cashier-card-head">
                  <h2>Reconciliación</h2>
                  <span className="muted">{RECONCILIATION_STATUS_LABELS[reconciliationRecordQuery.data.status]}</span>
                </div>
                <p className="cashier-list-hint">Compará esperado vs contado y dejá enviada la conciliación antes del cierre final.</p>

                <StateView
                  isLoading={reconciliationSummaryQuery.isLoading}
                  error={(reconciliationSummaryQuery.error as Error) ?? null}
                >
                  <div className="cashier-panel">
                    <strong>Checklist de conciliación</strong>
                    <div className="cashier-checklist">
                      {reconciliationChecklist.map((step) => (
                        <div key={step.label} className={`cashier-check ${step.done ? "cashier-check--done" : ""}`}>
                          <strong>{step.done ? "✓" : "•"}</strong>
                          <span>{step.label}</span>
                        </div>
                      ))}
                    </div>
                    {sessionPending.length > 0 ? (
                      <p className="cashier-panel-note">Todavía hay hitos pendientes del turno: {sessionPending.join(", ")}.</p>
                    ) : null}
                  </div>
                  {reconciliationSummaryQuery.data ? (
                    <div className="cashier-reconciliation-grid">
                      <div className="cashier-kpi-card">
                        <span>Esperado</span>
                        <strong>
                          {formatMoney(
                            reconciliationSummaryQuery.data.data.expectedMinorUnits,
                            reconciliationSummaryQuery.data.data.currency,
                          )}
                        </strong>
                      </div>
                      <div className="cashier-kpi-card">
                        <span>Contado</span>
                        <strong>
                          {formatMoney(
                            reconciliationSummaryQuery.data.data.countedMinorUnits ?? 0,
                            reconciliationSummaryQuery.data.data.currency,
                          )}
                        </strong>
                      </div>
                      <div className="cashier-kpi-card">
                        <span>Diferencia</span>
                        <strong className={`cashier-difference cashier-difference--${differenceTone}`}>
                          {formatMoney(
                            reconciliationSummaryQuery.data.data.differenceMinorUnits ?? 0,
                            reconciliationSummaryQuery.data.data.currency,
                          )}
                        </strong>
                      </div>
                    </div>
                  ) : null}

                  {reconciliationRecordQuery.data.status !== "SUBMITTED" &&
                  reconciliationRecordQuery.data.status !== "APPROVED" ? (
                    <div className="cashier-form">
                      {differenceTone === "negative" ? (
                        <div className="cashier-banner cashier-banner--warning">
                          Faltante detectado: el conteo está por debajo del esperado.
                        </div>
                      ) : null}
                      {differenceTone === "positive" ? (
                        <div className="cashier-banner cashier-banner--info">
                          Sobrante detectado: el conteo está por encima del esperado.
                        </div>
                      ) : null}
                      {differenceTone === "ok" ? (
                        <div className="cashier-banner cashier-banner--success">
                          El conteo coincide exactamente con el esperado.
                        </div>
                      ) : null}
                      <label>
                        <span>Conteo físico</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={countedAmount}
                          onChange={(e) => setCountedAmount(e.target.value)}
                        />
                      </label>
                      <div className="cashier-action-row">
                        <button
                          type="button"
                          className="btn btn--ghost"
                          onClick={() => void recordCountsMutation.mutateAsync()}
                        >
                          Guardar conteo
                        </button>
                        <button
                          type="button"
                          className="btn btn--primary"
                          disabled={reconciliationSummaryQuery.data?.data.countedMinorUnits == null}
                          onClick={() => void submitReconciliationMutation.mutateAsync()}
                        >
                          Enviar reconciliación
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="muted">
                      {reconciliationRecordQuery.data.status === "APPROVED"
                        ? "La reconciliación ya fue aprobada."
                        : "La reconciliación ya fue enviada para aprobación."}
                    </p>
                  )}
                </StateView>
              </article>
            ) : null}

            <article className={`cashier-card cashier-card--wide${focusSection === "history" ? " cashier-card--focus" : ""}`}>
              <div className="cashier-card-head">
                <h2>Daily settlement</h2>
                <label className="cashier-inline-field">
                  <span>Fecha</span>
                  <input type="date" value={settlementDate} onChange={(e) => setSettlementDate(e.target.value)} />
                </label>
              </div>
              <div className="cashier-panel">
                <strong>Qué revisar en el cierre del día</strong>
                <div className="cashier-checklist">
                  {settlementChecklist.map((step) => (
                    <div key={step.label} className={`cashier-check ${step.done ? "cashier-check--done" : ""}`}>
                      <strong>{step.done ? "✓" : "•"}</strong>
                      <span>{step.label}</span>
                    </div>
                  ))}
                </div>
                <div className={`cashier-banner ${historyAttentionCount > 0 || (settlementDifference ?? 0) !== 0 ? "cashier-banner--warning" : "cashier-banner--success"}`}>
                  <span>
                    {settlementPending.length > 0
                      ? `Todavía conviene revisar: ${settlementPending.join(", ")}.`
                      : "El settlement diario ya quedó consistente y sin focos pendientes."}
                  </span>
                </div>
                <div className="cashier-quick-actions">
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => setFocusSection("history")}>
                    Ir a historial
                  </button>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => setSessionStatusFilter("CLOSING")}>
                    Ver sesiones en cierre
                  </button>
                </div>
              </div>

              <StateView
                isLoading={dailySettlementQuery.isLoading}
                error={(dailySettlementQuery.error as Error) ?? null}
                isEmpty={(dailySettlementQuery.data?.data.sessionCount ?? 0) === 0}
                emptyTitle="Sin sesiones para esa fecha"
                emptyMessage="No hay actividad de caja registrada para la fecha seleccionada."
                emptyIcon="📅"
              >
                {dailySettlementQuery.data ? (
                  <>
                    <p className="cashier-list-hint">Primero se muestran las sesiones del día con diferencia o todavía en cierre.</p>
                    <div className="cashier-reconciliation-grid">
                      <div className="cashier-kpi-card">
                        <span>Sesiones</span>
                        <strong>{dailySettlementQuery.data.data.sessionCount}</strong>
                      </div>
                      <div className="cashier-kpi-card">
                        <span>Aperturas</span>
                        <strong>
                          {formatMoney(
                            dailySettlementQuery.data.data.openingsMinorUnits,
                            dailySettlementQuery.data.data.currency,
                          )}
                        </strong>
                      </div>
                      <div className="cashier-kpi-card">
                        <span>Esperado</span>
                        <strong>
                          {formatMoney(
                            dailySettlementQuery.data.data.expectedMinorUnits,
                            dailySettlementQuery.data.data.currency,
                          )}
                        </strong>
                      </div>
                      <div className="cashier-kpi-card">
                        <span>Contado</span>
                        <strong>
                          {formatMoney(
                            dailySettlementQuery.data.data.countedMinorUnits,
                            dailySettlementQuery.data.data.currency,
                          )}
                        </strong>
                      </div>
                    </div>

                    <div className="cashier-banner cashier-banner--info">
                      Diferencia del día:{" "}
                      <strong>
                        {formatMoney(
                          dailySettlementQuery.data.data.differenceMinorUnits,
                          dailySettlementQuery.data.data.currency,
                        )}
                      </strong>
                    </div>

                    <div className="cashier-settlement-block">
                      <h3>Movimientos por tipo</h3>
                      <ul className="cashier-movement-list">
                        {Object.entries(dailySettlementQuery.data.data.movementsByType).map(([type, amount]) => (
                          <li key={type}>
                            <div className="cashier-movement-main">
                              <strong>{MOVEMENT_LABELS[type as CashMovementType] ?? type}</strong>
                            </div>
                            <span>{formatMoney(amount, dailySettlementQuery.data.data.currency)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="cashier-settlement-block">
                      <h3>Sesiones del día</h3>
                      <ul className="cashier-movement-list">
                        {prioritizedSettlementSessions.map((session) => (
                          <li
                            key={session.cashSessionId}
                            className={session.differenceMinorUnits ? "cashier-session-row cashier-session-row--difference" : "cashier-session-row"}
                          >
                            <div className="cashier-movement-main">
                              <strong>{session.cashRegisterId.slice(0, 8)}</strong>
                              <span>{SESSION_STATUS_LABELS[session.status]}</span>
                            </div>
                            <span>
                              Esperado: {formatMoney(session.expectedMinorUnits, dailySettlementQuery.data.data.currency)}
                            </span>
                            <span>
                              Contado: {formatMoney(session.countedMinorUnits ?? 0, dailySettlementQuery.data.data.currency)}
                            </span>
                            <span className={`muted ${session.differenceMinorUnits ? "cashier-session-difference" : ""}`}>
                              Diferencia: {formatMoney(session.differenceMinorUnits ?? 0, dailySettlementQuery.data.data.currency)}
                            </span>
                            <div className="cashier-quick-actions">
                              <button
                                type="button"
                                className="btn btn--ghost btn--sm"
                                onClick={() => {
                                  setSelectedHistorySessionId(session.cashSessionId);
                                  setFocusSection("history");
                                }}
                              >
                                Ver en historial
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : null}
              </StateView>
            </article>

            <article className={`cashier-card cashier-card--wide${focusSection === "history" ? " cashier-card--focus" : ""}`}>
              <div className="cashier-card-head">
                <h2>Historial de sesiones</h2>
                <span className="muted">Caja actual y cierres recientes</span>
              </div>
              <p className="cashier-list-hint">El listado prioriza primero sesiones activas o en cierre y luego cierres recientes.</p>
              <div className="cashier-panel">
                <strong>Cómo leer este historial</strong>
                <div className="cashier-checklist">
                  {historyChecklist.map((step) => (
                    <div key={step.label} className={`cashier-check ${step.done ? "cashier-check--done" : ""}`}>
                      <strong>{step.done ? "✓" : "•"}</strong>
                      <span>{step.label}</span>
                    </div>
                  ))}
                </div>
                <div className={`cashier-banner ${historyAttentionCount > 0 ? "cashier-banner--warning" : "cashier-banner--success"}`}>
                  <span>
                    {historyPending.length > 0
                      ? `Todavía hay contexto para revisar: ${historyPending.join(", ")}.`
                      : "El historial ya quedó limpio y sin sesiones operativas pendientes."}
                  </span>
                </div>
              </div>
              <div className="cashier-toolbar">
                <div className="cashier-segmented">
                  <button type="button" className={`btn btn--sm ${sessionStatusFilter === "ALL" ? "btn--primary" : "btn--ghost"}`} onClick={() => setSessionStatusFilter("ALL")}>Todas</button>
                  <button type="button" className={`btn btn--sm ${sessionStatusFilter === "OPEN" ? "btn--primary" : "btn--ghost"}`} onClick={() => setSessionStatusFilter("OPEN")}>Abiertas</button>
                  <button type="button" className={`btn btn--sm ${sessionStatusFilter === "CLOSING" ? "btn--primary" : "btn--ghost"}`} onClick={() => setSessionStatusFilter("CLOSING")}>En cierre</button>
                  <button type="button" className={`btn btn--sm ${sessionStatusFilter === "CLOSED" ? "btn--primary" : "btn--ghost"}`} onClick={() => setSessionStatusFilter("CLOSED")}>Cerradas</button>
                  <button type="button" className={`btn btn--sm ${sessionStatusFilter === "RECONCILED" ? "btn--primary" : "btn--ghost"}`} onClick={() => setSessionStatusFilter("RECONCILED")}>Reconciliadas</button>
                </div>
              </div>

              <StateView
                isLoading={sessionListQuery.isLoading}
                error={(sessionListQuery.error as Error) ?? null}
                isEmpty={sessionHistory.length === 0}
                emptyTitle="Sin sesiones"
                emptyMessage="Todavía no hay sesiones registradas para esta caja."
                emptyIcon="🗂️"
              >
                <div className="cashier-history-layout">
                  <div className="cashier-history-list">
                    {sessionHistory.map((session) => (
                      <button
                        key={session.id}
                        type="button"
                        className={`cashier-history-card${selectedHistorySession?.id === session.id ? " cashier-history-card--active" : ""}`}
                        onClick={() => setSelectedHistorySessionId(session.id)}
                      >
                        <div className="cashier-history-head">
                          <strong>{session.businessDate}</strong>
                          <span className={`cashier-session-pill cashier-session-pill--inline cashier-session-pill--${session.status.toLowerCase()}`}>{SESSION_STATUS_LABELS[session.status]}</span>
                        </div>
                        <span className="muted">
                          {elapsedLabel(session.openedAt, now)} · rev {session.ledgerRevision}
                        </span>
                        <span>
                          Apertura {formatMoney(session.openingAmountMinorUnits, session.currency)}
                        </span>
                        {session.closedAt ? (
                          <span className="muted">
                            Cerrada {new Date(session.closedAt).toLocaleString("es-AR", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>

                  {selectedHistorySession ? (
                    <div className="cashier-history-detail">
                      <div className="cashier-kpi-card">
                        <span>Sesión elegida</span>
                        <strong>{SESSION_STATUS_LABELS[selectedHistorySession.status]}</strong>
                      </div>
                      <div className="cashier-kpi-card">
                        <span>Abierta</span>
                        <strong>
                          {new Date(selectedHistorySession.openedAt).toLocaleString("es-AR", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </strong>
                      </div>
                      <div className="cashier-kpi-card">
                        <span>Apertura</span>
                        <strong>{formatMoney(selectedHistorySession.openingAmountMinorUnits, selectedHistorySession.currency)}</strong>
                      </div>
                      <div className="cashier-kpi-card">
                        <span>Ledger rev</span>
                        <strong>{selectedHistorySession.ledgerRevision}</strong>
                      </div>

                      {selectedSettlementSession ? (
                        <div className="cashier-banner cashier-banner--info">
                          Esperado {formatMoney(selectedSettlementSession.expectedMinorUnits, dailySettlementQuery.data?.data.currency ?? DEFAULT_CURRENCY)} ·
                          Contado {formatMoney(selectedSettlementSession.countedMinorUnits ?? 0, dailySettlementQuery.data?.data.currency ?? DEFAULT_CURRENCY)} ·
                          Diferencia {formatMoney(selectedSettlementSession.differenceMinorUnits ?? 0, dailySettlementQuery.data?.data.currency ?? DEFAULT_CURRENCY)}
                        </div>
                      ) : (
                        <div className="cashier-banner cashier-banner--warning">
                          No hay detalle de settlement para esta sesión en la fecha seleccionada.
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </StateView>
            </article>
          </div>
        </StateView>
      </section>
    </main>
  );
}

function getNextStep({
  activeSession,
  reconciliationStatus,
  hasCountedAmount,
}: {
  activeSession: CashSession | null;
  reconciliationStatus: CashReconciliation["status"] | null;
  hasCountedAmount: boolean;
}) {
  if (!activeSession) {
    return { tone: "info" as const, message: "Próximo paso: abrir sesión de caja para empezar a operar." };
  }
  if (activeSession.status === "OPEN") {
    return { tone: "info" as const, message: "Próximo paso: registrar movimientos o iniciar cierre cuando termine el turno." };
  }
  if (activeSession.status === "CLOSING" && !hasCountedAmount) {
    return { tone: "warning" as const, message: "Próximo paso: registrar el conteo físico para comparar contra el esperado." };
  }
  if (activeSession.status === "CLOSING" && reconciliationStatus === "DRAFT") {
    return { tone: "warning" as const, message: "Próximo paso: enviar la reconciliación para aprobación." };
  }
  if (reconciliationStatus === "SUBMITTED") {
    return { tone: "success" as const, message: "La reconciliación ya fue enviada. Queda pendiente aprobación." };
  }
  if (reconciliationStatus === "APPROVED" || activeSession.status === "RECONCILED") {
    return { tone: "success" as const, message: "Turno reconciliado. Podés revisar historial o cambiar de fecha." };
  }
  return { tone: "info" as const, message: "Caja operativa." };
}

function getCashierPriority({
  activeSession,
  movementCount,
  withdrawalsOut,
  salesIn,
  reconciliationStatus,
  hasCountedAmount,
  differenceMinorUnits,
}: {
  activeSession: CashSession | null;
  movementCount: number;
  withdrawalsOut: number;
  salesIn: number;
  reconciliationStatus: CashReconciliation["status"] | null;
  hasCountedAmount: boolean;
  differenceMinorUnits: number | null;
}) {
  if (!activeSession) {
    return {
      tone: "info" as const,
      title: "Caja lista para abrir",
      message: "Todavía no hay sesión activa en esta caja. Abrí una para empezar a operar.",
      ctaLabel: "Ir a sesión",
      section: "session" as const,
    };
  }

  if (activeSession.status === "CLOSING" && !hasCountedAmount) {
    return {
      tone: "warning" as const,
      title: "Falta conteo físico",
      message: "El turno ya entró en cierre, pero todavía no se registró el conteo final.",
      ctaLabel: "Ir a conciliación",
      section: "reconciliation" as const,
    };
  }

  if (activeSession.status === "CLOSING" && reconciliationStatus === "DRAFT") {
    return {
      tone: "warning" as const,
      title: "Reconciliación pendiente de envío",
      message: "El conteo ya está cargado. Falta enviar la conciliación para aprobación.",
      ctaLabel: "Enviar conciliación",
      section: "reconciliation" as const,
    };
  }

  if (reconciliationStatus === "SUBMITTED") {
    return {
      tone: "success" as const,
      title: "Cierre enviado",
      message: "La conciliación ya fue enviada. Ahora conviene seguir el estado desde el historial.",
      ctaLabel: "Ver historial",
      section: "history" as const,
    };
  }

  if (differenceMinorUnits != null && differenceMinorUnits !== 0) {
    return {
      tone: "warning" as const,
      title: "Hay diferencia para revisar",
      message: "El esperado y el contado no coinciden. Validá el detalle antes de cerrar el turno operativo.",
      ctaLabel: "Revisar conciliación",
      section: "reconciliation" as const,
    };
  }

  if (movementCount === 0) {
    return {
      tone: "info" as const,
      title: "Turno sin movimientos",
      message: "La caja está abierta, pero todavía no registra actividad. Cargá el primer movimiento del turno.",
      ctaLabel: "Ir a movimientos",
      section: "movement" as const,
    };
  }

  if (withdrawalsOut > salesIn && withdrawalsOut > 0) {
    return {
      tone: "warning" as const,
      title: "Salidas por encima de ingresos cash",
      message: "Los retiros/salidas superan a las ventas en efectivo observadas en la sesión actual.",
      ctaLabel: "Auditar movimientos",
      section: "movement" as const,
    };
  }

  return {
    tone: "success" as const,
    title: "Caja bajo control",
    message: "La operación del turno se ve consistente. Podés seguir con movimientos o revisar el historial.",
    ctaLabel: "Ver historial",
    section: "history" as const,
  };
}

function hasRecordedCount(
  summaryCountedMinorUnits: number | null | undefined,
  recordCountedMinorUnits: number | null | undefined,
) {
  return summaryCountedMinorUnits != null || recordCountedMinorUnits != null;
}
