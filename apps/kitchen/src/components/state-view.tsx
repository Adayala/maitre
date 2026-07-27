import type { ReactNode } from "react";

// Adapted from apps/web's SPEC-048 StateView: stable loading layout, an
// actionable/recoverable error, and — critically for a KDS — a calm, positive
// empty state ("todo al día") rather than a scary blank or error-looking panel.
interface StateViewProps {
  isLoading: boolean;
  error?: Error | null;
  isEmpty?: boolean;
  loadingLabel?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyIcon?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  onRetry?: () => void;
  children: ReactNode;
}

export function StateView({
  isLoading,
  error,
  isEmpty,
  loadingLabel,
  emptyTitle,
  emptyMessage,
  emptyIcon,
  emptyActionLabel,
  onEmptyAction,
  onRetry,
  children,
}: StateViewProps) {
  if (isLoading) {
    return (
      <div role="status" aria-live="polite" className="state state--loading">
        <span className="state-spinner" aria-hidden="true" />
        <span>{loadingLabel ?? "Cargando…"}</span>
      </div>
    );
  }
  if (error) {
    return (
      <div role="alert" className="state state--error">
        <span className="state-emoji" aria-hidden="true">
          ⚠️
        </span>
        <p>{error.message}</p>
        {onRetry && (
          <button type="button" className="btn btn--ghost" onClick={onRetry}>
            Reintentar
          </button>
        )}
      </div>
    );
  }
  if (isEmpty) {
    return (
      <div className="state state--empty">
        <span className="state-emoji" aria-hidden="true">
          {emptyIcon ?? "✅"}
        </span>
        <h2>{emptyTitle ?? "Todo al día"}</h2>
        <p>{emptyMessage ?? "No hay comandas pendientes en esta estación."}</p>
        {onEmptyAction && emptyActionLabel && (
          <button type="button" className="btn btn--ghost" onClick={onEmptyAction}>
            {emptyActionLabel}
          </button>
        )}
      </div>
    );
  }
  return <>{children}</>;
}
