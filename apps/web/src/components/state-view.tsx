import type { ReactNode } from "react";

// SPEC-048 §contract — "Estados obligatorios: loading con layout estable,
// empty accionable, partial/stale visible, error recuperable".
interface StateViewProps {
  isLoading: boolean;
  error?: Error | null;
  isEmpty?: boolean;
  emptyMessage?: string;
  onRetry?: () => void;
  children: ReactNode;
}

export function StateView({
  isLoading,
  error,
  isEmpty,
  emptyMessage,
  onRetry,
  children,
}: StateViewProps) {
  if (isLoading) {
    return (
      <div role="status" aria-live="polite" className="state-view state-view--loading">
        Cargando…
      </div>
    );
  }
  if (error) {
    return (
      <div role="alert" className="state-view state-view--error">
        <p>Ocurrió un error: {error.message}</p>
        {onRetry && (
          <button type="button" onClick={onRetry}>
            Reintentar
          </button>
        )}
      </div>
    );
  }
  if (isEmpty) {
    return (
      <div className="state-view state-view--empty">
        <p>{emptyMessage ?? "No hay datos todavía."}</p>
      </div>
    );
  }
  return <>{children}</>;
}
