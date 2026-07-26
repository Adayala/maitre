import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, ApiError } from "../../lib/api-client.js";
import { useAuth } from "../../app/auth-context.js";
import { useSession } from "../../app/session-context.js";
import { useStation } from "../../app/station-context.js";
import { StateView } from "../../components/state-view.js";
import type { ApiData, Command, ProductionQueue } from "../../lib/kitchen-types.js";
import { CommandCard } from "./command-card.js";
import { AlertsBanner } from "./alerts-banner.js";
import { useCommandAction, type CommandAction } from "./use-command-action.js";
import { useNow } from "./use-now.js";

// Near-real-time via polling — no WebSocket infra exists in the backend yet
// (documented future enhancement). 4s balances freshness against load.
const QUEUE_POLL_MS = 4000;

interface RecentDone {
  id: string;
  name: string;
  at: number;
}

export function KdsPage() {
  const { accessToken, signOut } = useAuth();
  const { me, selectedTenantId, selectedBranch } = useSession();
  const { selectedStation, clearStation } = useStation();
  const now = useNow();
  const [menuOpen, setMenuOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [recent, setRecent] = useState<RecentDone[]>([]);
  const prevRef = useRef<Map<string, Command>>(new Map());

  const stationId = selectedStation?.id ?? null;
  const queryKey = ["production-queue", selectedTenantId, stationId];

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey,
    queryFn: () =>
      apiRequest<ApiData<ProductionQueue>>(
        `/v1/kitchen/stations/${stationId}/production-queue`,
        { accessToken: accessToken!, tenantId: selectedTenantId! },
      ),
    enabled: Boolean(accessToken && selectedTenantId && stationId),
    refetchInterval: QUEUE_POLL_MS,
  });

  // The API pre-orders commands (priority DESC, receivedAt ASC); trust it.
  const commands = data?.data.commands ?? [];

  // Diff successive snapshots: a command that was in the queue and is now gone
  // was completed / cancelled / handed off. Surface the last few as a throughput
  // strip so cooks get a sense of flow. (The ProductionQueue projection itself
  // only carries non-terminal commands, so terminal ones never reappear.)
  useEffect(() => {
    if (!data) return;
    const current = new Map(commands.map((c) => [c.id, c]));
    const disappeared: RecentDone[] = [];
    for (const [id, prev] of prevRef.current) {
      if (!current.has(id)) {
        disappeared.push({ id, name: prev.payload.displayName, at: Date.now() });
      }
    }
    if (disappeared.length > 0) {
      setRecent((r) => [...disappeared, ...r].slice(0, 6));
    }
    prevRef.current = current;
  }, [data, commands]);

  const action = useCommandAction(queryKey);

  function runAction(commandId: string, act: CommandAction, reason?: string) {
    setActionError(null);
    action.mutate(
      { commandId, action: act, ...(reason !== undefined ? { reason } : {}) },
      {
        onError: (err) => {
          setActionError(
            err instanceof ApiError && err.status === 403
              ? "No tenés permiso para esta acción."
              : err.message,
          );
        },
      },
    );
  }

  const branchId = selectedBranch?.id ?? "";

  return (
    <div className="kds">
      <header className="kds-header">
        <div className="kds-station">
          <span className="kds-station-icon" aria-hidden="true">
            🍳
          </span>
          <div>
            <h1>{selectedStation?.displayName ?? "Estación"}</h1>
            <p className="kds-branch">{selectedBranch?.name}</p>
          </div>
        </div>

        <div className="kds-header-right">
          <span className={`kds-live ${isFetching ? "kds-live--on" : ""}`} title="Actualización automática">
            <span className="kds-live-dot" aria-hidden="true" />
            En vivo
          </span>
          {branchId && <AlertsBanner branchId={branchId} />}
          <div className="kds-menu-wrap">
            <button
              type="button"
              className="btn btn--icon"
              aria-label="Ajustes"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              ⚙️
            </button>
            {menuOpen && (
              <div className="kds-menu" role="menu">
                <div className="kds-menu-user">{me?.user.displayName}</div>
                <button type="button" className="kds-menu-item" onClick={() => { setMenuOpen(false); clearStation(); }}>
                  Cambiar estación
                </button>
                <button type="button" className="kds-menu-item" onClick={() => refetch()}>
                  Actualizar ahora
                </button>
                <button type="button" className="kds-menu-item kds-menu-item--danger" onClick={() => signOut()}>
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {actionError && (
        <div className="kds-action-error" role="alert">
          {actionError}
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setActionError(null)}>
            Cerrar
          </button>
        </div>
      )}

      <main className="kds-main">
        <StateView
          isLoading={isLoading}
          error={error as Error | null}
          isEmpty={commands.length === 0}
          loadingLabel="Cargando comandas…"
          emptyTitle="Todo al día"
          emptyMessage="No hay comandas pendientes en esta estación. Buen trabajo. 👏"
          onRetry={() => refetch()}
        >
          <div className="card-grid">
            {commands.map((command) => (
              <CommandCard
                key={command.id}
                command={command}
                currentUserId={me?.user.id ?? null}
                now={now}
                pending={action.isPending}
                onAction={runAction}
              />
            ))}
          </div>
        </StateView>
      </main>

      {recent.length > 0 && (
        <footer className="recent-strip" aria-label="Recién completadas">
          <span className="recent-label">Recién salió</span>
          <ul className="recent-list">
            {recent.map((r) => (
              <li key={`${r.id}-${r.at}`} className="recent-item">
                ✓ {r.name}
              </li>
            ))}
          </ul>
        </footer>
      )}
    </div>
  );
}
