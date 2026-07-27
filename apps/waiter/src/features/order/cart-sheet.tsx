import { useMutation } from "@tanstack/react-query";
import { useApi } from "../../app/use-api.js";
import { formatMoney } from "../../lib/format.js";
import type { Order, OrderItem } from "../../lib/waiter-types.js";

// The running DRAFT order. Quantity edits go through change-quantity; removing a
// line cancels it (both are DRAFT-legal). Notes are set at add time (no edit
// endpoint exists), so they are shown read-only here.
export function CartSheet({
  order,
  items,
  onClose,
  onChanged,
}: {
  order: Order;
  items: OrderItem[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const api = useApi();

  const changeQty = useMutation({
    mutationFn: async ({ itemId, newQuantity }: { itemId: string; newQuantity: number }) => {
      await api(`/v1/orders/${order.id}/items/${itemId}/change-quantity`, {
        method: "POST",
        body: { newQuantity, reasonCode: "WAITER_EDIT" },
      });
    },
    onSuccess: onChanged,
  });

  const removeItem = useMutation({
    mutationFn: async (itemId: string) => {
      await api(`/v1/orders/${order.id}/items/${itemId}/cancel`, {
        method: "POST",
        body: { reasonCode: "WAITER_REMOVED" },
      });
    },
    onSuccess: onChanged,
  });

  const busy = changeQty.isPending || removeItem.isPending;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="sheet-root" role="dialog" aria-modal="true" aria-label="Pedido actual">
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet sheet--tall">
        <div className="sheet-grip" aria-hidden="true" />
        <h2 className="sheet-title">
          Pedido actual
          <span className="sheet-title-badge">{itemCount}</span>
        </h2>
        <p className="sheet-sub">Podés ajustar cantidades o quitar líneas antes de enviar a cocina.</p>

        <ul className="cart-list">
          {items.map((item) => {
            const lineTotal =
              (item.unitPriceMinorUnits +
                item.modifiers.reduce((s, m) => s + m.priceDeltaMinorUnits, 0)) *
              item.quantity;
            return (
              <li key={item.id} className="cart-item">
                <div className="cart-item-info">
                  <span className="cart-item-name">{item.name}</span>
                  {item.notes && <span className="cart-item-note">“{item.notes}”</span>}
                  <span className="cart-item-price">
                    {formatMoney(lineTotal, order.currency)}
                  </span>
                </div>
                <div className="cart-item-controls">
                  <div className="stepper stepper--sm">
                    <button
                      type="button"
                      className="stepper-btn"
                      aria-label="Menos"
                      disabled={busy}
                      onClick={() =>
                        item.quantity <= 1
                          ? removeItem.mutate(item.id)
                          : changeQty.mutate({ itemId: item.id, newQuantity: item.quantity - 1 })
                      }
                    >
                      −
                    </button>
                    <span className="stepper-value">{item.quantity}</span>
                    <button
                      type="button"
                      className="stepper-btn"
                      aria-label="Más"
                      disabled={busy}
                      onClick={() =>
                        changeQty.mutate({ itemId: item.id, newQuantity: item.quantity + 1 })
                      }
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className="cart-remove"
                    aria-label={`Quitar ${item.name}`}
                    disabled={busy}
                    onClick={() => removeItem.mutate(item.id)}
                  >
                    🗑
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="cart-foot">
          <div className="cart-foot-total">
            <span>{itemCount} ítem{itemCount === 1 ? "" : "s"}</span>
            <strong>{formatMoney(order.subtotalMinorUnits, order.currency)}</strong>
          </div>
          <div className="cart-foot-note">
            Los cambios impactan solo en este borrador hasta que lo envíes.
          </div>
          <div className="cart-foot-total cart-foot-total--compact">
            <span>Subtotal</span>
            <strong>{formatMoney(order.subtotalMinorUnits, order.currency)}</strong>
          </div>
          <button type="button" className="btn btn--primary btn--lg btn--block" onClick={onClose}>
            Seguir agregando
          </button>
        </div>
      </div>
    </div>
  );
}
