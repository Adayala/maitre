import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useApi } from "../../app/use-api.js";
import { useNav } from "../../app/nav-context.js";
import { useNow } from "../../app/use-now.js";
import { AppHeader } from "../../components/app-header.js";
import { StateView } from "../../components/state-view.js";
import { ApiError } from "../../lib/api-client.js";
import { formatMoney, elapsedLabel } from "../../lib/format.js";
import type { ApiData, Visit, Order, Check, OrderItem } from "../../lib/waiter-types.js";
import { OrderItemRow } from "./order-item-row.js";

const ORDER_STATUS_LABEL: Record<Order["status"], string> = {
  DRAFT: "Borrador",
  SUBMITTED: "Enviado",
  IN_PREP: "En cocina",
  READY: "Listo",
  PARTIALLY_DELIVERED: "Entrega parcial",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

type VisitFocusSection = "check" | "orders" | "actions";

export function VisitPage({ visitId }: { visitId: string }) {
  const api = useApi();
  const qc = useQueryClient();
  const { push, resetToFloor } = useNav();
  const now = useNow();
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const [focusSection, setFocusSection] = useState<VisitFocusSection | null>(null);

  const visitQ = useQuery({
    queryKey: ["visit", visitId],
    queryFn: async () => (await api<ApiData<Visit>>(`/v1/visits/${visitId}`)).data,
    refetchInterval: 20_000,
  });

  const ordersQ = useQuery({
    queryKey: ["orders", visitId],
    queryFn: async () => (await api<ApiData<Order[]>>(`/v1/visits/${visitId}/orders`)).data,
    refetchInterval: 15_000,
  });

  const checkQ = useQuery({
    queryKey: ["check", visitId],
    refetchInterval: 15_000,
    queryFn: async () => {
      try {
        return (await api<ApiData<Check>>(`/v1/visits/${visitId}/check`)).data;
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }
    },
  });

  const orders = ordersQ.data ?? [];
  const check = checkQ.data ?? null;
  const visit = visitQ.data;

  function invalidate() {
    void qc.invalidateQueries({ queryKey: ["orders", visitId] });
    void qc.invalidateQueries({ queryKey: ["check", visitId] });
    void qc.invalidateQueries({ queryKey: ["visit", visitId] });
  }

  // Nuevo pedido: ensure a Check exists first (so the order's total is appended
  // as a Check line on submit), then continue an open DRAFT or create one.
  const newOrder = useMutation({
    mutationFn: async () => {
      if (!check) {
        const currency = orders[0]?.currency ?? "ARS";
        await api(`/v1/visits/${visitId}/check`, { method: "POST", body: { currency } }).catch(
          (err) => {
            // A concurrent create is fine — swallow the duplicate conflict.
            if (!(err instanceof ApiError && err.status === 409)) throw err;
          },
        );
      }
      const draft = orders.find((o) => o.status === "DRAFT");
      if (draft) return draft.id;
      const created = await api<ApiData<Order>>(`/v1/visits/${visitId}/orders`, {
        method: "POST",
        body: {},
      });
      return created.data.id;
    },
    onSuccess: (orderId) => {
      setFlashMessage("Pedido listo para editar.");
      invalidate();
      push({ name: "order", visitId, orderId });
    },
  });

  const requestPayment = useMutation({
    mutationFn: async () => {
      if (!check) throw new Error("No hay cuenta abierta");
      await api(`/v1/checks/${check.id}/request-payment`, { method: "POST" });
    },
    onSuccess: () => {
      setFlashMessage("Cuenta solicitada a caja.");
      invalidate();
    },
  });

  const closeTable = useMutation({
    mutationFn: async () => {
      await api(`/v1/visits/${visitId}/request-close`, { method: "POST" }).catch((err) => {
        // If already CLOSING, skip straight to close.
        if (!(err instanceof ApiError && err.status === 409)) throw err;
      });
      await api(`/v1/visits/${visitId}/close`, { method: "POST" });
    },
    onSuccess: () => {
      setFlashMessage("Mesa cerrada.");
      invalidate();
      resetToFloor();
    },
  });

  const deliver = useMutation({
    mutationFn: async ({ orderId, itemId }: { orderId: string; itemId: string }) => {
      await api(`/v1/orders/${orderId}/items/${itemId}/transition`, {
        method: "POST",
        body: { to: "DELIVERED" },
      });
    },
    onSuccess: () => {
      setFlashMessage("Ítem marcado como entregado.");
      invalidate();
    },
  });

  const draftOrder = orders.find((o) => o.status === "DRAFT");
  const activeOrders = orders.filter((o) => o.status !== "CANCELLED");
  const prioritizedOrders = activeOrders
    .slice()
    .sort((a, b) => {
      const score = (order: Order) => {
        if (order.status === "DRAFT") return 0;
        if (order.items.some((item) => item.status === "READY")) return 1;
        if (order.status === "PARTIALLY_DELIVERED") return 2;
        if (order.status === "IN_PREP") return 3;
        if (order.status === "SUBMITTED") return 4;
        if (order.status === "DELIVERED") return 5;
        return 6;
      };
      const diff = score(a) - score(b);
      if (diff !== 0) return diff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  const readyItems = activeOrders.flatMap((order) => order.items).filter((item) => item.status === "READY").length;
  const deliveredItems = activeOrders.flatMap((order) => order.items).filter((item) => item.status === "DELIVERED").length;
  const paymentRequested = check?.status === "PAYMENT_PENDING";

  const canRequestPayment =
    check != null && check.status === "OPEN" && check.totals.balance > 0;
  const canClose =
    visit != null &&
    (visit.status === "OPEN" || visit.status === "CLOSING") &&
    (check == null || check.status === "SETTLED" || check.status === "VOID");

  const closeHint =
    check != null && check.status !== "SETTLED" && check.status !== "VOID"
      ? "La cuenta debe estar saldada por caja"
      : undefined;

  const actionError =
    [newOrder.error, requestPayment.error, closeTable.error, deliver.error].find(Boolean);
  const actionErrorMsg =
    actionError instanceof ApiError
      ? actionError.problem.title
      : actionError instanceof Error
        ? actionError.message
        : null;

  const tableLabel = visit ? tableSummary(visit) : "Mesa";
  const visitPriority = getVisitPriority({
    draftOrder: Boolean(draftOrder),
    readyItems,
    paymentRequested,
    canRequestPayment,
    canClose,
    checkStatus: check?.status ?? null,
  });
  const visitChecklist = [
    { label: "No hay borrador pendiente", done: !draftOrder },
    { label: "Ítems listos ya entregados", done: readyItems === 0 },
    {
      label: "Estado de cuenta claro",
      done: check == null || check.status === "OPEN" || check.status === "PAYMENT_PENDING" || check.status === "SETTLED" || check.status === "VOID",
    },
    { label: "Mesa lista para cierre", done: canClose },
  ];
  const visitPending = visitChecklist.filter((step) => !step.done).map((step) => step.label);
  const visitFocusCards = [
    {
      label: "Cuenta",
      value: check ? 1 : 0,
      detail: paymentRequested ? "Pago en curso" : canRequestPayment ? "Lista para pedir cuenta" : "Sin foco inmediato",
      active: focusSection === "check",
      onClick: () => setFocusSection("check"),
    },
    {
      label: "Pedidos",
      value: activeOrders.length,
      detail: readyItems > 0 ? "Hay ítems listos" : draftOrder ? "Hay borrador abierto" : "Servicio en seguimiento",
      active: focusSection === "orders",
      onClick: () => setFocusSection("orders"),
    },
    {
      label: "Acciones",
      value: canClose ? 1 : 0,
      detail: canClose ? "Mesa lista para cerrar" : "Seguir servicio o cobro",
      active: focusSection === "actions",
      onClick: () => setFocusSection("actions"),
    },
  ];

  return (
    <div className="screen">
      <AppHeader
        title={tableLabel}
        subtitle={
          visit
            ? `${visit.guestCount} 👥 · abierta ${elapsedLabel(visit.createdAt, now)}`
            : undefined
        }
        right={check ? <CheckStatusBadge status={check.status} /> : undefined}
      />

      <main className="screen-body screen-body--with-dock">
        <StateView
          isLoading={visitQ.isLoading || ordersQ.isLoading}
          error={(visitQ.error as Error) ?? (ordersQ.error as Error) ?? null}
          onRetry={() => {
            void visitQ.refetch();
            void ordersQ.refetch();
          }}
          loadingLabel="Cargando mesa…"
        >
          {flashMessage && (
            <div className="waiter-banner waiter-banner--success">
              <span>{flashMessage}</span>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setFlashMessage(null)}>
                Ocultar
              </button>
            </div>
          )}

          <div className={`waiter-banner waiter-banner--${visitPriority.tone}`}>
            <div className="waiter-banner-copy">
              <strong>{visitPriority.title}</strong>
              <span>{visitPriority.message}</span>
            </div>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setFocusSection(visitPriority.section)}
            >
              {visitPriority.cta}
            </button>
          </div>

          <section className="waiter-kpi-strip">
            <article className="waiter-kpi-card">
              <span>Pedidos</span>
              <strong>{activeOrders.length}</strong>
            </article>
            <article className="waiter-kpi-card">
              <span>Ítems listos</span>
              <strong>{readyItems}</strong>
            </article>
            <article className="waiter-kpi-card">
              <span>Entregados</span>
              <strong>{deliveredItems}</strong>
            </article>
          </section>

          <section className="waiter-guidance" aria-label="Guía operativa de la mesa">
            <article className="waiter-guidance-card">
              <span className="waiter-guidance-eyebrow">Chequeo de mesa</span>
              <strong>Qué conviene revisar ahora</strong>
              <div className="waiter-checklist">
                {visitChecklist.map((step) => (
                  <div key={step.label} className={`waiter-check ${step.done ? "waiter-check--done" : ""}`}>
                    <strong>{step.done ? "✓" : "•"}</strong>
                    <span>{step.label}</span>
                  </div>
                ))}
              </div>
              <p className="waiter-guidance-note">
                {visitPending.length > 0
                  ? `Todavía conviene pasar por: ${visitPending.join(", ")}.`
                  : "La mesa está ordenada y lista para seguir o cerrar sin fricción."}
              </p>
            </article>

            <article className="waiter-guidance-card">
              <span className="waiter-guidance-eyebrow">Atajos del mozo</span>
              <strong>Entrá directo al frente útil</strong>
              <div className="waiter-focus-grid">
                {visitFocusCards.map((card) => (
                  <button
                    key={card.label}
                    type="button"
                    className={`waiter-focus-card ${card.active ? "waiter-focus-card--active" : ""}`}
                    onClick={card.onClick}
                  >
                    <span>{card.label}</span>
                    <strong>{card.value}</strong>
                    <p>{card.detail}</p>
                  </button>
                ))}
              </div>
            </article>
          </section>

          {/* Check summary */}
          {check ? (
            <section className={`check-card${focusSection === "check" ? " check-card--focus" : ""}`}>
              <div className="check-card-head">
                <span className="check-card-label">Cuenta</span>
                <CheckStatusBadge status={check.status} />
              </div>
              <div className="check-total">
                <span>Total</span>
                <strong>{formatMoney(check.totals.netDue, check.currency)}</strong>
              </div>
              {check.totals.paid > 0 && (
                <div className="check-line-row">
                  <span>Pagado</span>
                  <span>{formatMoney(check.totals.paid, check.currency)}</span>
                </div>
              )}
              <div className="check-line-row check-line-row--balance">
                <span>Saldo</span>
                <span>{formatMoney(check.totals.balance, check.currency)}</span>
              </div>
              {paymentRequested ? (
                <p className="waiter-section-hint">Caja ya fue avisada. Esperá confirmación de pago para poder cerrar.</p>
              ) : check.totals.balance > 0 ? (
                <p className="waiter-section-hint">Si la mesa pide pagar, avisá a caja desde el dock inferior.</p>
              ) : null}
            </section>
          ) : (
            <section className={`check-card check-card--empty${focusSection === "check" ? " check-card--focus" : ""}`}>
              <span className="check-card-label">Cuenta</span>
              <p className="muted">Todavía no se abrió la cuenta.</p>
            </section>
          )}

          {/* Orders */}
          <h2 className="section-title">Pedidos</h2>
          <p className="waiter-list-hint">Se muestran primero los pedidos que el mozo puede resolver ahora.</p>
          {prioritizedOrders.length === 0 ? (
            <div className="empty-inline">
              <span aria-hidden="true">🧾</span>
              <p>Sin pedidos. Tocá “Nuevo pedido” para empezar.</p>
            </div>
          ) : (
            <div className={`order-list${focusSection === "orders" ? " order-list--focus" : ""}`}>
              {prioritizedOrders.map((order) => (
                <article
                  key={order.id}
                  className={`order-card order-card--${order.status.toLowerCase()}${
                    order.status === "DRAFT"
                      ? " order-card--draft-focus"
                      : order.items.some((item) => item.status === "READY")
                        ? " order-card--ready-focus"
                        : ""
                  }`}
                >
                  <div className="order-card-head">
                    <span className={`order-pill order-pill--${order.status.toLowerCase()}`}>
                      {ORDER_STATUS_LABEL[order.status]}
                    </span>
                    <span className="order-total">
                      {formatMoney(order.grandTotalMinorUnits, order.currency)}
                    </span>
                  </div>
                  {order.status === "DRAFT" ? (
                    <p className="waiter-section-hint">Borrador abierto: completalo y enviá a cocina.</p>
                  ) : null}
                  {order.items.some((item) => item.status === "READY") ? (
                    <p className="waiter-section-hint">Hay ítems listos para entregar en mesa.</p>
                  ) : null}
                  <ul className="order-items">
                    {order.items.map((item: OrderItem) => (
                      <OrderItemRow
                        key={item.id}
                        item={item}
                        currency={order.currency}
                        onDeliver={
                          item.status === "READY"
                            ? () => deliver.mutate({ orderId: order.id, itemId: item.id })
                            : undefined
                        }
                        delivering={deliver.isPending}
                      />
                    ))}
                  </ul>
                  {order.status === "DRAFT" && (
                    <button
                      type="button"
                      className="btn btn--neutral order-continue"
                      onClick={() => push({ name: "order", visitId, orderId: order.id })}
                    >
                      Continuar borrador →
                    </button>
                  )}
                </article>
              ))}
            </div>
          )}
        </StateView>
      </main>

      {/* Thumb-reachable action dock */}
      <div className={`dock${focusSection === "actions" ? " dock--focus" : ""}`}>
        {actionErrorMsg && (
          <p role="alert" className="dock-error">
            {actionErrorMsg}
          </p>
        )}
        {closeHint && !canClose && <p className="dock-hint">{closeHint}</p>}
        <div className="dock-row">
          <button
            type="button"
            className="btn btn--ghost btn--lg"
            onClick={() => requestPayment.mutate()}
            disabled={!canRequestPayment || requestPayment.isPending}
          >
            💳 Pedir la cuenta
          </button>
          <button
            type="button"
            className="btn btn--primary btn--lg"
            onClick={() => newOrder.mutate()}
            disabled={newOrder.isPending}
          >
            {draftOrder ? "＋ Continuar pedido" : "＋ Nuevo pedido"}
          </button>
        </div>
        <button
          type="button"
          className="btn btn--ghost btn--block"
          onClick={() => closeTable.mutate()}
          disabled={!canClose || closeTable.isPending}
        >
          {closeTable.isPending ? "Cerrando…" : "Cerrar mesa"}
        </button>
      </div>
    </div>
  );
}

function tableSummary(visit: Visit): string {
  if (visit.tableIds.length === 1) return "Mesa";
  return `Mesa (${visit.tableIds.length})`;
}

function CheckStatusBadge({ status }: { status: Check["status"] }) {
  const map: Record<Check["status"], { label: string; cls: string }> = {
    OPEN: { label: "Abierta", cls: "open" },
    PAYMENT_PENDING: { label: "Pagando", cls: "paying" },
    SETTLED: { label: "Saldada", cls: "settled" },
    VOID: { label: "Anulada", cls: "void" },
  };
  const m = map[status];
  return <span className={`check-badge check-badge--${m.cls}`}>{m.label}</span>;
}

function getVisitPriority({
  draftOrder,
  readyItems,
  paymentRequested,
  canRequestPayment,
  canClose,
  checkStatus,
}: {
  draftOrder: boolean;
  readyItems: number;
  paymentRequested: boolean;
  canRequestPayment: boolean;
  canClose: boolean;
  checkStatus: Check["status"] | null;
}) {
  if (draftOrder) {
    return {
      tone: "warning" as const,
      title: "Hay un pedido sin enviar",
      message: "La mesa tiene un borrador abierto. Conviene retomarlo antes de seguir tomando otro pedido.",
      cta: "Ir a pedidos",
      section: "orders" as const,
    };
  }

  if (readyItems > 0) {
    return {
      tone: "success" as const,
      title: "Hay platos listos para salir",
      message: `${readyItems} ítem${readyItems === 1 ? "" : "s"} esperan entrega en mesa.`,
      cta: "Ver pedidos",
      section: "orders" as const,
    };
  }

  if (paymentRequested) {
    return {
      tone: "info" as const,
      title: "Pago en curso",
      message: "Caja ya fue notificada. Seguí el estado de la cuenta antes de cerrar la mesa.",
      cta: "Ver cuenta",
      section: "check" as const,
    };
  }

  if (canClose && checkStatus != null) {
    return {
      tone: "success" as const,
      title: "Mesa lista para cerrar",
      message: "La cuenta ya no bloquea el cierre. Podés finalizar la visita desde las acciones.",
      cta: "Ir a acciones",
      section: "actions" as const,
    };
  }

  if (canRequestPayment) {
    return {
      tone: "info" as const,
      title: "Cuenta abierta",
      message: "Si la mesa pide pagar, podés solicitar la cuenta a caja desde abajo.",
      cta: "Ver cuenta",
      section: "check" as const,
    };
  }

  return {
    tone: "info" as const,
    title: "Mesa en seguimiento",
    message: "La visita está en curso. Tomá pedidos, seguí cocina y cerrá cuando corresponda.",
    cta: "Ir a acciones",
    section: "actions" as const,
  };
}
