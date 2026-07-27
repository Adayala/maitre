import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useApi } from "../../app/use-api.js";
import { ApiError } from "../../lib/api-client.js";
import { formatMoney } from "../../lib/format.js";
import type { Product } from "../../lib/waiter-types.js";

const NOTE_MAX = 140;

// Add-to-order sheet: quantity stepper + an optional per-item note. Modifiers
// are intentionally omitted — the Catalog Product domain has no modifier/option
// schema yet (see README "Deferred"), so there is nothing to render.
export function ProductAddSheet({
  product,
  orderId,
  onClose,
  onAdded,
}: {
  product: Product;
  orderId: string;
  onClose: () => void;
  onAdded: () => void;
}) {
  const api = useApi();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const add = useMutation({
    mutationFn: async () => {
      const trimmed = notes.trim();
      await api(`/v1/orders/${orderId}/items`, {
        method: "POST",
        body: {
          productId: product.id,
          quantity,
          ...(trimmed ? { notes: trimmed } : {}),
        },
      });
    },
    onSuccess: onAdded,
  });

  const errorMsg =
    add.error instanceof ApiError
      ? add.error.problem.title
      : add.error instanceof Error
        ? add.error.message
        : null;

  const lineTotal = product.priceMinorUnits * quantity;

  return (
    <div className="sheet-root" role="dialog" aria-modal="true" aria-label={`Agregar ${product.name}`}>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet">
        <div className="sheet-grip" aria-hidden="true" />
        <h2 className="sheet-title">{product.name}</h2>
        <p className="sheet-sub">{formatMoney(product.priceMinorUnits, product.currency)} c/u</p>

        {product.allergens.length > 0 && (
          <p className="sheet-allergens">⚠ Alérgenos: {product.allergens.join(", ")}</p>
        )}

        <div className="stepper-block">
          <span className="stepper-label">Cantidad</span>
          <div className="stepper">
            <button
              type="button"
              className="stepper-btn"
              aria-label="Menos"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
            >
              −
            </button>
            <span className="stepper-value" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              className="stepper-btn"
              aria-label="Más"
              onClick={() => setQuantity((q) => Math.min(99, q + 1))}
            >
              +
            </button>
          </div>
        </div>

        <label className="note-field">
          <span className="stepper-label">Nota para cocina (opcional)</span>
          <textarea
            value={notes}
            maxLength={NOTE_MAX}
            rows={2}
            placeholder="Ej: sin sal, punto jugoso…"
            onChange={(e) => setNotes(e.target.value)}
          />
          <span className="note-count">
            {notes.length}/{NOTE_MAX}
          </span>
        </label>

        {errorMsg && (
          <p role="alert" className="sheet-error">
            {errorMsg}
          </p>
        )}

        <div className="sheet-actions">
          <button type="button" className="btn btn--ghost btn--lg" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn--primary btn--lg"
            onClick={() => add.mutate()}
            disabled={add.isPending}
          >
            {add.isPending ? "Agregando…" : `Agregar · ${formatMoney(lineTotal, product.currency)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
