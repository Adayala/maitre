import { formatMoney } from "../../lib/format.js";
import type { OrderItem, OrderItemStatus } from "../../lib/waiter-types.js";

const ITEM_STATUS: Record<OrderItemStatus, { label: string; cls: string }> = {
  QUEUED: { label: "En cola", cls: "queued" },
  IN_PREP: { label: "Preparando", cls: "prep" },
  READY: { label: "Listo", cls: "ready" },
  DELIVERED: { label: "Entregado", cls: "delivered" },
  CANCELLED: { label: "Cancelado", cls: "cancelled" },
};

// One line of a submitted/draft order. Kitchen owns IN_PREP/READY; the waiter
// can mark a READY item DELIVERED ("lo llevé a la mesa") via order:deliver.
export function OrderItemRow({
  item,
  currency,
  onDeliver,
  delivering,
}: {
  item: OrderItem;
  currency: string;
  onDeliver?: () => void;
  delivering?: boolean;
}) {
  const meta = ITEM_STATUS[item.status];
  const lineTotal =
    (item.unitPriceMinorUnits +
      item.modifiers.reduce((s, m) => s + m.priceDeltaMinorUnits, 0)) *
    item.quantity;

  return (
    <li className={`item-row item-row--${meta.cls}`}>
      <span className="item-qty">{item.quantity}×</span>
      <div className="item-main">
        <span className="item-name">{item.name}</span>
        {item.modifiers.length > 0 && (
          <span className="item-mods">{item.modifiers.map((m) => m.label).join(", ")}</span>
        )}
        {item.notes && <span className="item-notes">“{item.notes}”</span>}
        {item.allergens.length > 0 && (
          <span className="item-allergens">⚠ {item.allergens.join(", ")}</span>
        )}
      </div>
      <div className="item-right">
        {item.status !== "CANCELLED" && (
          <span className="item-price">{formatMoney(lineTotal, currency)}</span>
        )}
        {onDeliver ? (
          <button
            type="button"
            className="btn btn--success btn--sm"
            onClick={onDeliver}
            disabled={delivering}
          >
            Entregar
          </button>
        ) : (
          <span className={`item-status item-status--${meta.cls}`}>{meta.label}</span>
        )}
      </div>
    </li>
  );
}
