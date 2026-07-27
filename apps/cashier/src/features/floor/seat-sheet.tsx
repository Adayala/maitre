import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useApi } from "../../app/use-api.js";
import { ApiError } from "../../lib/api-client.js";
import type { ApiData, Visit } from "../../lib/waiter-types.js";
import type { FloorTable } from "./floor-page.js";

// Bottom sheet to seat a new party on an AVAILABLE table. Guest count stepper
// plus optional combining of extra free tables for a larger group. The confirm
// button is bottom-anchored and thumb-reachable.
export function SeatSheet({
  branchId,
  primaryTable,
  otherAvailable,
  onClose,
  onSeated,
}: {
  branchId: string;
  primaryTable: FloorTable;
  otherAvailable: FloorTable[];
  onClose: () => void;
  onSeated: (visitId: string) => void;
}) {
  const api = useApi();
  const [guestCount, setGuestCount] = useState(2);
  const [extraTableIds, setExtraTableIds] = useState<string[]>([]);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api<ApiData<Visit>>("/v1/visits", {
        method: "POST",
        body: {
          branchId,
          tableIds: [primaryTable.id, ...extraTableIds],
          guestCount,
        },
      });
      return res.data;
    },
    onSuccess: (visit) => onSeated(visit.id),
  });

  function toggleExtra(id: string) {
    setExtraTableIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  const tableCount = 1 + extraTableIds.length;
  const errorMsg =
    mutation.error instanceof ApiError
      ? mutation.error.problem.title
      : mutation.error instanceof Error
        ? mutation.error.message
        : null;

  return (
    <div className="sheet-root" role="dialog" aria-modal="true" aria-label="Sentar comensales">
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet">
        <div className="sheet-grip" aria-hidden="true" />
        <h2 className="sheet-title">
          Sentar en mesa {primaryTable.number}
          {tableCount > 1 && <span className="sheet-title-badge">{tableCount} mesas</span>}
        </h2>

        <div className="stepper-block">
          <span className="stepper-label">Comensales</span>
          <div className="stepper">
            <button
              type="button"
              className="stepper-btn"
              aria-label="Menos"
              onClick={() => setGuestCount((g) => Math.max(1, g - 1))}
              disabled={guestCount <= 1}
            >
              −
            </button>
            <span className="stepper-value" aria-live="polite">
              {guestCount}
            </span>
            <button
              type="button"
              className="stepper-btn"
              aria-label="Más"
              onClick={() => setGuestCount((g) => Math.min(50, g + 1))}
            >
              +
            </button>
          </div>
        </div>

        {otherAvailable.length > 0 && (
          <div className="combine-block">
            <span className="stepper-label">Combinar con otra mesa</span>
            <div className="combine-chips">
              {otherAvailable.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`chip ${extraTableIds.includes(t.id) ? "chip--on" : ""}`}
                  onClick={() => toggleExtra(t.id)}
                >
                  {t.number}
                </button>
              ))}
            </div>
          </div>
        )}

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
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Abriendo…" : `Sentar ${guestCount} 👥`}
          </button>
        </div>
      </div>
    </div>
  );
}
