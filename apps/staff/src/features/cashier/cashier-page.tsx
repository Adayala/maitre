import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AppHeader } from "../../components/app-header.js";
import { StateView } from "../../components/state-view.js";
import { useApi } from "../../app/use-api.js";
import { useSession } from "../../app/session-context.js";
import { elapsedLabel, formatMoney } from "../../lib/format.js";
import { ApiError } from "../../lib/api-client.js";
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
        .sort((a, b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime()),
    [sessionListQuery.data, sessionStatusFilter],
  );
  const selectedHistorySession =
    sessionHistory.find((session) => session.id === selectedHistorySessionId) ?? closedSession ?? null;
  const selectedSettlementSession =
    dailySettlementQuery.data?.data.sessions.find((session) => session.cashSessionId === selectedHistorySession?.id) ?? null;
  const reconciliationDifference = reconciliationSummaryQuery.data?.data.differenceMinorUnits ?? null;
  const differenceTone =
    reconciliationDifference == null
      ? "neutral"
      : reconciliationDifference === 0
        ? "ok"
        : reconciliationDifference > 0
          ? "positive"
          : "negative";

  return (
    <main className="cashier-app">
      <AppHeader
        title="Caja"
        subtitle={registerQuery.data?.data.displayName ?? "Operación de cajero"}
        right={activeSession ? <span className="cashier-session-pill">{activeSession.status}</span> : undefined}
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

            <article className="cashier-kpi-strip">
              <div className="cashier-kpi-card">
                <span>Sesión</span>
                <strong>{activeSession?.status ?? "SIN ABRIR"}</strong>
              </div>
              <div className="cashier-kpi-card">
                <span>Movimientos</span>
                <strong>{movementStats.count}</strong>
              </div>
              <div className="cashier-kpi-card">
                <span>Ventas cash</span>
                <strong>{formatMoney(movementStats.salesIn, activeSession?.currency ?? DEFAULT_CURRENCY)}</strong>
              </div>
              <div className="cashier-kpi-card">
                <span>Salidas</span>
                <strong>{formatMoney(movementStats.withdrawalsOut, activeSession?.currency ?? DEFAULT_CURRENCY)}</strong>
              </div>
            </article>

            <article className="cashier-card">
              <h2>Caja actual</h2>
              <p>{registerQuery.data?.data.displayName ?? "—"}</p>
              <p className="muted">{registerQuery.data?.data.code ?? ""}</p>
              <p className="muted">{selectedBranchId ?? ""}</p>
            </article>

            <article className="cashier-card">
              <h2>Sesión</h2>
              {activeSession ? (
                <>
                  <p className="cashier-session-status">{activeSession.status}</p>
                  <p className="muted">Fecha operativa: {activeSession.businessDate}</p>
                  <p className="muted">Abierta: {sessionAgeLabel}</p>
                  <p className="muted">Apertura: {formatMoney(activeSession.openingAmountMinorUnits, activeSession.currency)}</p>
                  <p className="muted">Saldo observado: {formatMoney(movementSummary, activeSession.currency)}</p>

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
                  <label>
                    <span>Apertura inicial</span>
                    <input type="number" min="0" step="0.01" value={openingAmount} onChange={(e) => setOpeningAmount(e.target.value)} />
                  </label>
                  <button type="button" className="btn btn--primary" onClick={() => void openSessionMutation.mutateAsync()}>
                    Abrir sesión
                  </button>
                </div>
              )}
            </article>

            <article className="cashier-card cashier-card--wide">
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

            <article className="cashier-card cashier-card--wide">
              <div className="cashier-card-head">
                <h2>Movimientos recientes</h2>
                <span className="muted">Últimos registros de esta sesión</span>
              </div>
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
                        <strong>{movement.type}</strong>
                        <span className={`cashier-direction cashier-direction--${movement.direction.toLowerCase()}`}>
                          {movement.direction}
                        </span>
                      </div>
                      <span>{formatMoney(movement.amountMinorUnits, movement.currency)}</span>
                      <span className="muted">rev {movement.ledgerRevision}</span>
                    </li>
                  ))}
                </ul>
              </StateView>
            </article>

            {reconciliationRecordQuery.data ? (
              <article className="cashier-card cashier-card--wide">
                <div className="cashier-card-head">
                  <h2>Reconciliación</h2>
                  <span className="muted">{reconciliationRecordQuery.data.status}</span>
                </div>

                <StateView
                  isLoading={reconciliationSummaryQuery.isLoading}
                  error={(reconciliationSummaryQuery.error as Error) ?? null}
                >
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

            <article className="cashier-card cashier-card--wide">
              <div className="cashier-card-head">
                <h2>Daily settlement</h2>
                <label className="cashier-inline-field">
                  <span>Fecha</span>
                  <input type="date" value={settlementDate} onChange={(e) => setSettlementDate(e.target.value)} />
                </label>
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
                              <strong>{type}</strong>
                            </div>
                            <span>{formatMoney(amount, dailySettlementQuery.data.data.currency)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="cashier-settlement-block">
                      <h3>Sesiones del día</h3>
                      <ul className="cashier-movement-list">
                        {dailySettlementQuery.data.data.sessions.map((session) => (
                          <li key={session.cashSessionId}>
                            <div className="cashier-movement-main">
                              <strong>{session.cashRegisterId.slice(0, 8)}</strong>
                              <span>{session.status}</span>
                            </div>
                            <span>
                              Esperado: {formatMoney(session.expectedMinorUnits, dailySettlementQuery.data.data.currency)}
                            </span>
                            <span>
                              Contado: {formatMoney(session.countedMinorUnits ?? 0, dailySettlementQuery.data.data.currency)}
                            </span>
                            <span className="muted">
                              Diferencia: {formatMoney(session.differenceMinorUnits ?? 0, dailySettlementQuery.data.data.currency)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : null}
              </StateView>
            </article>

            <article className="cashier-card cashier-card--wide">
              <div className="cashier-card-head">
                <h2>Historial de sesiones</h2>
                <span className="muted">Caja actual y cierres recientes</span>
              </div>
              <div className="cashier-toolbar">
                <div className="cashier-segmented">
                  <button type="button" className={`btn btn--sm ${sessionStatusFilter === "ALL" ? "btn--primary" : "btn--ghost"}`} onClick={() => setSessionStatusFilter("ALL")}>Todas</button>
                  <button type="button" className={`btn btn--sm ${sessionStatusFilter === "OPEN" ? "btn--primary" : "btn--ghost"}`} onClick={() => setSessionStatusFilter("OPEN")}>Open</button>
                  <button type="button" className={`btn btn--sm ${sessionStatusFilter === "CLOSING" ? "btn--primary" : "btn--ghost"}`} onClick={() => setSessionStatusFilter("CLOSING")}>Closing</button>
                  <button type="button" className={`btn btn--sm ${sessionStatusFilter === "CLOSED" ? "btn--primary" : "btn--ghost"}`} onClick={() => setSessionStatusFilter("CLOSED")}>Closed</button>
                  <button type="button" className={`btn btn--sm ${sessionStatusFilter === "RECONCILED" ? "btn--primary" : "btn--ghost"}`} onClick={() => setSessionStatusFilter("RECONCILED")}>Reconciled</button>
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
                          <span className={`cashier-session-pill cashier-session-pill--inline cashier-session-pill--${session.status.toLowerCase()}`}>{session.status}</span>
                        </div>
                        <span className="muted">
                          {elapsedLabel(session.openedAt, now)} · rev {session.ledgerRevision}
                        </span>
                        <span>
                          Apertura {formatMoney(session.openingAmountMinorUnits, session.currency)}
                        </span>
                      </button>
                    ))}
                  </div>

                  {selectedHistorySession ? (
                    <div className="cashier-history-detail">
                      <div className="cashier-kpi-card">
                        <span>Sesión elegida</span>
                        <strong>{selectedHistorySession.status}</strong>
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
