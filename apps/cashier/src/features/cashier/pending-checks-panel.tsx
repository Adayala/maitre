import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useApi } from "../../app/use-api.js";
import { useSession } from "../../app/session-context.js";
import { formatMoney } from "../../lib/format.js";
import "./pending-checks.css";
import type {
  ApiData,
  CashSession,
  Payment,
  PaymentMethod,
  PendingCheck,
} from "../../lib/cashier-types.js";

const METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Efectivo",
  CARD: "Tarjeta",
  OTHER: "Otro",
};

interface PendingChecksPanelProps {
  activeSession: CashSession | null;
  onSettled: () => Promise<void>;
}

interface SettleInput {
  check: PendingCheck;
  method: PaymentMethod;
  idempotencyKey: string;
}

export function PendingChecksPanel({
  activeSession,
  onSettled,
}: PendingChecksPanelProps) {
  const api = useApi();
  const { selectedBranchId } = useSession();
  const [selectedCheckId, setSelectedCheckId] = useState<string | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [announcement, setAnnouncement] = useState<string | null>(null);

  const pendingChecksQuery = useQuery({
    queryKey: ["cashier-pending-checks", selectedBranchId],
    enabled: Boolean(selectedBranchId),
    queryFn: () =>
      api<ApiData<PendingCheck[]>>(
        `/v1/branches/${selectedBranchId}/pending-checks`,
      ),
    refetchInterval: 5_000,
  });
  const pendingChecks = useMemo(
    () => pendingChecksQuery.data?.data ?? [],
    [pendingChecksQuery.data],
  );
  const selectedCheck =
    pendingChecks.find((check) => check.id === selectedCheckId) ??
    pendingChecks[0] ??
    null;

  useEffect(() => {
    if (selectedCheck?.id !== selectedCheckId) {
      setSelectedCheckId(selectedCheck?.id ?? null);
    }
  }, [selectedCheck?.id, selectedCheckId]);

  const settleMutation = useMutation({
    mutationFn: async ({
      check,
      method: selectedMethod,
      idempotencyKey,
    }: SettleInput) => {
      if (check.totals.balance > 0) {
        const created = await api<ApiData<Payment>>(
          `/v1/checks/${check.id}/payments`,
          {
            method: "POST",
            body: {
              amountMinorUnits: check.totals.balance,
              currency: check.currency,
              method: selectedMethod,
              idempotencyKey,
            },
          },
        );
        await api<ApiData<Payment>>(`/v1/payments/${created.data.id}/capture`, {
          method: "POST",
          body:
            selectedMethod === "CASH"
              ? { cashSessionId: activeSession?.id }
              : {},
        });
      }

      return api<ApiData<PendingCheck>>(`/v1/checks/${check.id}/settle`, {
        method: "POST",
        body: {},
      });
    },
    onSuccess: async (_result, input) => {
      setAnnouncement(
        `Cuenta de ${tableLabel(input.check)} cobrada y liquidada.`,
      );
      await pendingChecksQuery.refetch();
      await onSettled();
    },
    onError: async () => {
      setAnnouncement(
        "No se pudo completar el cobro. Actualizamos el saldo para que puedas retomarlo sin duplicar el pago.",
      );
      await pendingChecksQuery.refetch();
      await onSettled();
    },
  });

  const cashAvailable =
    activeSession?.status === "OPEN" &&
    activeSession.currency === selectedCheck?.currency;
  const operationBlocked =
    !selectedCheck ||
    settleMutation.isPending ||
    (method === "CASH" && !cashAvailable);

  function startPayment() {
    if (!selectedCheck || operationBlocked) return;
    setAnnouncement(null);
    settleMutation.mutate({
      check: selectedCheck,
      method,
      idempotencyKey: crypto.randomUUID(),
    });
  }

  return (
    <article
      className="cashier-card cashier-card--wide pending-checks"
      role="region"
      aria-label="Cobros pendientes"
    >
      <div className="cashier-card-head pending-checks__head">
        <div>
          <p className="cashier-eyebrow">Cola de cobro</p>
          <h2>Cobros pendientes</h2>
          <p className="muted">
            Seleccioná una mesa, confirmá el medio y liquidá el saldo exacto.
          </p>
        </div>
        <div
          className="pending-checks__counter"
          aria-label={`${pendingChecks.length} cuentas pendientes`}
        >
          <strong>{pendingChecks.length.toString().padStart(2, "0")}</strong>
          <span>en espera</span>
        </div>
      </div>

      {pendingChecksQuery.isLoading ? (
        <div className="pending-checks__state" role="status">
          Leyendo cuentas de la sucursal…
        </div>
      ) : pendingChecksQuery.isError ? (
        <div className="cashier-banner cashier-banner--warning" role="alert">
          <span>No pudimos cargar las cuentas pendientes.</span>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => void pendingChecksQuery.refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : pendingChecks.length === 0 ? (
        <div className="pending-checks__empty">
          <span className="pending-checks__empty-mark" aria-hidden="true">
            ✓
          </span>
          <div>
            <strong>Cola al día</strong>
            <p>No hay mesas esperando cobro en esta sucursal.</p>
          </div>
        </div>
      ) : (
        <div className="pending-checks__layout">
          <div className="pending-checks__queue" aria-label="Cuentas en espera">
            {pendingChecks.map((check, index) => {
              const selected = check.id === selectedCheck?.id;
              return (
                <button
                  key={check.id}
                  type="button"
                  className={`pending-check-row${selected ? " pending-check-row--selected" : ""}`}
                  aria-pressed={selected}
                  onClick={() => setSelectedCheckId(check.id)}
                >
                  <span className="pending-check-row__index">
                    {(index + 1).toString().padStart(2, "0")}
                  </span>
                  <span className="pending-check-row__identity">
                    <strong>{tableLabel(check)}</strong>
                    <small>
                      {check.visit?.guestCount ?? "—"} cubiertos ·{" "}
                      {check.lines.length} ítems
                    </small>
                  </span>
                  <span className="pending-check-row__balance">
                    <strong>
                      {formatMoney(check.totals.balance, check.currency)}
                    </strong>
                    <small>saldo</small>
                  </span>
                </button>
              );
            })}
          </div>

          {selectedCheck ? (
            <div className="pending-checks__detail">
              <div className="pending-checks__summary">
                <div>
                  <span>Mesa</span>
                  <strong>{tableLabel(selectedCheck)}</strong>
                </div>
                <div>
                  <span>Total</span>
                  <strong>
                    {formatMoney(
                      selectedCheck.totals.netDue,
                      selectedCheck.currency,
                    )}
                  </strong>
                </div>
                <div>
                  <span>Pagado</span>
                  <strong>
                    {formatMoney(
                      selectedCheck.totals.paid,
                      selectedCheck.currency,
                    )}
                  </strong>
                </div>
                <div className="pending-checks__summary-balance">
                  <span>A cobrar</span>
                  <strong>
                    {formatMoney(
                      selectedCheck.totals.balance,
                      selectedCheck.currency,
                    )}
                  </strong>
                </div>
              </div>

              {selectedCheck.totals.balance > 0 ? (
                <fieldset className="pending-checks__methods">
                  <legend>Medio de pago</legend>
                  <div className="pending-checks__method-grid">
                    {(Object.keys(METHOD_LABELS) as PaymentMethod[]).map(
                      (candidate) => (
                        <button
                          key={candidate}
                          type="button"
                          className={`pending-checks__method${method === candidate ? " pending-checks__method--selected" : ""}`}
                          aria-pressed={method === candidate}
                          onClick={() => setMethod(candidate)}
                        >
                          {METHOD_LABELS[candidate]}
                        </button>
                      ),
                    )}
                  </div>
                </fieldset>
              ) : (
                <div className="cashier-banner cashier-banner--info">
                  <span>
                    El pago ya está capturado. Sólo falta liquidar la cuenta.
                  </span>
                </div>
              )}

              {method === "CASH" &&
              selectedCheck.totals.balance > 0 &&
              !cashAvailable ? (
                <p className="pending-checks__guard" role="note">
                  Abrí una sesión en {selectedCheck.currency} para cobrar en
                  efectivo.
                </p>
              ) : null}

              <button
                type="button"
                className="btn btn--primary pending-checks__submit"
                disabled={operationBlocked}
                onClick={startPayment}
              >
                {settleMutation.isPending
                  ? "Procesando…"
                  : selectedCheck.totals.balance === 0
                    ? "Finalizar liquidación"
                    : `Cobrar ${formatMoney(selectedCheck.totals.balance, selectedCheck.currency)}`}
              </button>
            </div>
          ) : null}
        </div>
      )}

      <p
        className={
          settleMutation.isError
            ? "pending-checks__feedback pending-checks__feedback--error"
            : "pending-checks__feedback"
        }
        aria-live="polite"
      >
        {announcement}
      </p>
    </article>
  );
}

function tableLabel(check: PendingCheck): string {
  if (check.tables.length === 0) return `Cuenta ${check.id.slice(0, 8)}`;
  return check.tables
    .map((table) => table.name?.trim() || `Mesa ${table.number}`)
    .join(" + ");
}
