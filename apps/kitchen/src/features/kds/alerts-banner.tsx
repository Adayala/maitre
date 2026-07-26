import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, ApiError } from "../../lib/api-client.js";
import { useAuth } from "../../app/auth-context.js";
import { useSession } from "../../app/session-context.js";
import type { ApiData, KitchenAlert } from "../../lib/kitchen-types.js";

// Branch-scoped kitchen alerts. Polled on a slower cadence than the queue (30s)
// since alerts are less time-critical. Shown as a compact banner with an OPEN
// count; tapping expands a list with acknowledge / resolve. Escalate is
// manager-tier and intentionally omitted from the cook UI.
const ALERTS_POLL_MS = 30_000;

export function AlertsBanner({ branchId }: { branchId: string }) {
  const { accessToken } = useAuth();
  const { selectedTenantId } = useSession();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const queryKey = ["alerts", selectedTenantId, branchId];
  const { data } = useQuery({
    queryKey,
    queryFn: () =>
      apiRequest<ApiData<KitchenAlert[]>>(`/v1/branches/${branchId}/kitchen/alerts`, {
        accessToken: accessToken!,
        tenantId: selectedTenantId!,
      }),
    enabled: Boolean(accessToken && selectedTenantId && branchId),
    refetchInterval: ALERTS_POLL_MS,
  });

  const alerts = data?.data ?? [];
  const active = alerts.filter((a) => a.status === "OPEN" || a.status === "ESCALATED");
  const acknowledged = alerts.filter((a) => a.status === "ACKNOWLEDGED");
  const shown = [...active, ...acknowledged];

  const mutation = useMutation<unknown, Error, { id: string; op: "acknowledge" | "resolve" }>({
    mutationFn: ({ id, op }) =>
      apiRequest(`/v1/kitchen/alerts/${id}/${op}`, {
        accessToken: accessToken!,
        tenantId: selectedTenantId!,
        method: "POST",
        ...(op === "resolve" ? { body: { reasonCode: "HANDLED_IN_KITCHEN" } } : {}),
      }),
    onSuccess: () => {
      setActionError(null);
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err) => {
      setActionError(
        err instanceof ApiError && err.status === 403
          ? "No tenés permiso para gestionar alertas."
          : err.message,
      );
    },
  });

  const evaluate = useMutation({
    mutationFn: () =>
      apiRequest(`/v1/branches/${branchId}/kitchen/alerts/evaluate`, {
        accessToken: accessToken!,
        tenantId: selectedTenantId!,
        method: "POST",
      }),
    onSuccess: () => {
      setActionError(null);
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err) => setActionError(err.message),
  });

  const count = active.length;
  const hasAny = shown.length > 0;

  return (
    <div className="alerts">
      <button
        type="button"
        className={`alerts-toggle ${count > 0 ? "alerts-toggle--active" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="alerts-bell" aria-hidden="true">
          {count > 0 ? "🔔" : "🔕"}
        </span>
        <span className="alerts-label">
          {count > 0 ? `${count} alerta${count === 1 ? "" : "s"}` : "Sin alertas"}
        </span>
      </button>

      {open && (
        <div className="alerts-panel" role="dialog" aria-label="Alertas de cocina">
          <div className="alerts-panel-head">
            <strong>Alertas de cocina</strong>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => evaluate.mutate()}
              disabled={evaluate.isPending}
            >
              Revisar ahora
            </button>
          </div>
          {actionError && <p className="alerts-error">{actionError}</p>}
          {!hasAny ? (
            <p className="alerts-empty">No hay alertas activas. ✅</p>
          ) : (
            <ul className="alerts-list">
              {shown.map((a) => (
                <li key={a.id} className={`alert-row alert-row--${a.severity.toLowerCase()}`}>
                  <div className="alert-info">
                    <span className={`sev sev--${a.severity.toLowerCase()}`}>{a.severity}</span>
                    <span className="alert-rule">{a.ruleCode}</span>
                    <span className={`alert-status alert-status--${a.status.toLowerCase()}`}>
                      {a.status}
                    </span>
                  </div>
                  <div className="alert-actions">
                    {a.status !== "ACKNOWLEDGED" && (
                      <button
                        type="button"
                        className="btn btn--neutral btn--sm"
                        disabled={mutation.isPending}
                        onClick={() => mutation.mutate({ id: a.id, op: "acknowledge" })}
                      >
                        Reconocer
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn--success btn--sm"
                      disabled={mutation.isPending}
                      onClick={() => mutation.mutate({ id: a.id, op: "resolve" })}
                    >
                      Resolver
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
