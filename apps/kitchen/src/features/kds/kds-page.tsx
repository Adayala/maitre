import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, ApiError } from "../../lib/api-client.js";
import { useAuth } from "../../app/auth-context.js";
import { useSession } from "../../app/session-context.js";
import { useStation } from "../../app/station-context.js";
import { StateView } from "../../components/state-view.js";
import type {
  ApiData,
  Command,
  CommandStatus,
  ProductionQueue,
} from "../../lib/kitchen-types.js";
import { CommandCard } from "./command-card.js";
import { AlertsBanner } from "./alerts-banner.js";
import { useCommandAction, type CommandAction } from "./use-command-action.js";
import { urgencyFor, useNow } from "./use-now.js";

// Near-real-time via polling — no WebSocket infra exists in the backend yet
// (documented future enhancement). 4s balances freshness against load.
const QUEUE_POLL_MS = 4000;
const NEW_BADGE_MS = 20_000;
const RECENT_DONE_MS = 8 * 60_000;
const ACTION_SUCCESS_MS = 4_000;
const SOUND_PREF_KEY = "maitre.kitchen.soundEnabled";
const RUSH_PREF_KEY = "maitre.kitchen.rushMode";

type FilterKey = "ALL" | CommandStatus;
type QuickView = "NONE" | "LATE" | "READY" | "MINE";

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: "ALL", label: "Todas" },
  { key: "RECEIVED", label: "Nuevas" },
  { key: "CLAIMED", label: "Tomadas" },
  { key: "IN_PROGRESS", label: "Preparando" },
  { key: "ON_HOLD", label: "Pausadas" },
  { key: "READY", label: "Listas" },
];

const STATUS_SECTIONS: Array<{ key: CommandStatus; label: string }> = [
  { key: "RECEIVED", label: "Nuevas" },
  { key: "CLAIMED", label: "Tomadas" },
  { key: "IN_PROGRESS", label: "En preparación" },
  { key: "ON_HOLD", label: "En pausa" },
  { key: "READY", label: "Listas para salir" },
];

interface RecentDone {
  id: string;
  name: string;
  at: number;
}

interface ArrivalNotice {
  count: number;
  at: number;
}

interface LateNotice {
  count: number;
  at: number;
}

interface ActionSuccess {
  message: string;
  at: number;
}

const ACTION_PENDING_LABEL: Record<CommandAction, string> = {
  claim: "Tomando comanda…",
  release: "Soltando comanda…",
  start: "Iniciando preparación…",
  hold: "Pausando comanda…",
  resume: "Retomando comanda…",
  "mark-ready": "Marcando comanda lista…",
  "complete-handoff": "Confirmando handoff…",
  cancel: "Cancelando comanda…",
};

const ACTION_SUCCESS_LABEL: Record<CommandAction, string> = {
  claim: "Comanda tomada",
  release: "Comanda liberada",
  start: "Preparación iniciada",
  hold: "Comanda pausada",
  resume: "Preparación retomada",
  "mark-ready": "Comanda marcada lista",
  "complete-handoff": "Handoff confirmado",
  cancel: "Comanda cancelada",
};

function readSoundPreference(): boolean {
  if (typeof window === "undefined") return true;
  const stored = window.localStorage.getItem(SOUND_PREF_KEY);
  return stored !== "0";
}

function readRushPreference(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(RUSH_PREF_KEY) === "1";
}

function formatRecentAge(elapsedMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  if (totalSeconds < 60) return `hace ${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `hace ${hours} h`;
}

function playTone(pulses: number, mode: "arrival" | "late") {
  if (typeof window === "undefined") return;
  const audioApi = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!audioApi) return;

  const context = new audioApi();
  const startAt = context.currentTime + 0.02;
  const pulseCount = Math.min(Math.max(pulses, 1), 3);

  for (let index = 0; index < pulseCount; index += 1) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const pulseAt = startAt + index * 0.24;

    oscillator.type = mode === "arrival" ? "triangle" : "sawtooth";
    oscillator.frequency.setValueAtTime(
      mode === "arrival" ? 880 - index * 80 : 620 - index * 40,
      pulseAt,
    );
    gain.gain.setValueAtTime(0.0001, pulseAt);
    gain.gain.exponentialRampToValueAtTime(mode === "arrival" ? 0.09 : 0.07, pulseAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, pulseAt + (mode === "arrival" ? 0.18 : 0.22));

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(pulseAt);
    oscillator.stop(pulseAt + (mode === "arrival" ? 0.2 : 0.24));
  }

  const stopAt = startAt + pulseCount * 0.24 + 0.3;
  window.setTimeout(() => {
    void context.close().catch(() => undefined);
  }, Math.ceil((stopAt - context.currentTime) * 1000));
}

async function toggleFullscreen(next: boolean) {
  if (typeof document === "undefined") return;
  if (next) {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    }
    return;
  }

  if (document.fullscreenElement) {
    await document.exitFullscreen();
  }
}

export function KdsPage() {
  const { accessToken, signOut } = useAuth();
  const { me, selectedTenantId, selectedBranch } = useSession();
  const { selectedStation, clearStation } = useStation();
  const now = useNow();
  const [menuOpen, setMenuOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [recent, setRecent] = useState<RecentDone[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("ALL");
  const [quickView, setQuickView] = useState<QuickView>("NONE");
  const [newArrivalAt, setNewArrivalAt] = useState<Record<string, number>>({});
  const [arrivalNotice, setArrivalNotice] = useState<ArrivalNotice | null>(null);
  const [lateNotice, setLateNotice] = useState<LateNotice | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => readSoundPreference());
  const [focusMode, setFocusMode] = useState(false);
  const [rushMode, setRushMode] = useState<boolean>(() => readRushPreference());
  const [deniedActions, setDeniedActions] = useState<Partial<Record<CommandAction, true>>>({});
  const [pendingActions, setPendingActions] = useState<Partial<Record<string, CommandAction>>>({});
  const [actionSuccess, setActionSuccess] = useState<ActionSuccess | null>(null);
  const prevRef = useRef<Map<string, Command>>(new Map());
  const initializedRef = useRef(false);
  const lateIdsRef = useRef<Set<string>>(new Set());
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuToggleRef = useRef<HTMLButtonElement | null>(null);
  const firstMenuItemRef = useRef<HTMLButtonElement | null>(null);

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

  useEffect(() => {
    setDeniedActions({});
    setPendingActions({});
    setActionSuccess(null);
    setActionError(null);
    setRecent([]);
    setNewArrivalAt({});
    setArrivalNotice(null);
    setLateNotice(null);
    prevRef.current = new Map();
    initializedRef.current = false;
    lateIdsRef.current = new Set();
  }, [selectedTenantId, stationId]);

  // The API pre-orders commands (priority DESC, receivedAt ASC); trust it.
  const commands = data?.data.commands ?? [];

  // Diff successive snapshots: a command that was in the queue and is now gone
  // was completed / cancelled / handed off. Surface the last few as a throughput
  // strip so cooks get a sense of flow. (The ProductionQueue projection itself
  // only carries non-terminal commands, so terminal ones never reappear.)
  useEffect(() => {
    if (!data) return;
    const observedAt = Date.now();
    const current = new Map(commands.map((c) => [c.id, c]));
    const disappeared: RecentDone[] = [];
    const appeared: Record<string, number> = {};
    for (const [id, prev] of prevRef.current) {
      if (!current.has(id)) {
        disappeared.push({ id, name: prev.payload.displayName, at: observedAt });
      }
    }
    if (initializedRef.current) {
      for (const [id] of current) {
        if (!prevRef.current.has(id)) {
          appeared[id] = observedAt;
        }
      }
    }
    if (disappeared.length > 0) {
      setRecent((r) => [...disappeared, ...r].slice(0, 6));
    }
    const appearedCount = Object.keys(appeared).length;
    if (appearedCount > 0) {
      setArrivalNotice({ count: appearedCount, at: observedAt });
      if (soundEnabled) playTone(appearedCount, "arrival");
    }
    setNewArrivalAt((existing) => {
      const next: Record<string, number> = {};
      for (const [id, ts] of Object.entries(existing)) {
        if (current.has(id) && observedAt - ts < NEW_BADGE_MS) next[id] = ts;
      }
      for (const [id, ts] of Object.entries(appeared)) next[id] = ts;
      return next;
    });
    prevRef.current = current;
    initializedRef.current = true;
  }, [data, commands, soundEnabled]);

  useEffect(() => {
    setNewArrivalAt((existing) => {
      let changed = false;
      const next: Record<string, number> = {};
      for (const [id, ts] of Object.entries(existing)) {
        if (now - ts < NEW_BADGE_MS) {
          next[id] = ts;
        } else {
          changed = true;
        }
      }
      return changed ? next : existing;
    });
  }, [now]);

  useEffect(() => {
    if (!arrivalNotice) return;
    if (now - arrivalNotice.at < NEW_BADGE_MS) return;
    setArrivalNotice((current) => (current?.at === arrivalNotice.at ? null : current));
  }, [arrivalNotice, now]);

  useEffect(() => {
    const lateCommands = commands.filter(
      (command) => urgencyFor(now - new Date(command.receivedAt).getTime()) === "late",
    );
    const lateIds = new Set(lateCommands.map((command) => command.id));
    if (initializedRef.current) {
      let newlyLate = 0;
      for (const id of lateIds) {
        if (!lateIdsRef.current.has(id)) newlyLate += 1;
      }
      if (newlyLate > 0) {
        const observedAt = Date.now();
        setLateNotice({ count: newlyLate, at: observedAt });
        if (soundEnabled) playTone(newlyLate, "late");
      }
    }
    lateIdsRef.current = lateIds;
  }, [commands, now, soundEnabled]);

  useEffect(() => {
    if (!lateNotice) return;
    if (now - lateNotice.at < NEW_BADGE_MS) return;
    setLateNotice((current) => (current?.at === lateNotice.at ? null : current));
  }, [lateNotice, now]);

  useEffect(() => {
    setRecent((current) => current.filter((item) => now - item.at < RECENT_DONE_MS));
  }, [now]);

  useEffect(() => {
    if (!actionSuccess) return;
    if (now - actionSuccess.at < ACTION_SUCCESS_MS) return;
    setActionSuccess((current) => (current?.at === actionSuccess.at ? null : current));
  }, [actionSuccess, now]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SOUND_PREF_KEY, soundEnabled ? "1" : "0");
  }, [soundEnabled]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(RUSH_PREF_KEY, rushMode ? "1" : "0");
  }, [rushMode]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const syncFullscreen = () => setFocusMode(Boolean(document.fullscreenElement));
    syncFullscreen();
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    firstMenuItemRef.current?.focus();

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
        menuToggleRef.current?.focus();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuToggleRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const action = useCommandAction(queryKey);

  function runAction(commandId: string, act: CommandAction, reason?: string) {
    const commandName =
      commands.find((command) => command.id === commandId)?.payload.displayName ?? "la comanda";
    setActionError(null);
    setActionSuccess(null);
    setPendingActions((current) => ({ ...current, [commandId]: act }));
    action.mutate(
      { commandId, action: act, ...(reason !== undefined ? { reason } : {}) },
      {
        onSuccess: () => {
          setActionSuccess({
            message: `${ACTION_SUCCESS_LABEL[act]} · ${commandName}`,
            at: Date.now(),
          });
        },
        onError: (err) => {
          if (err instanceof ApiError && err.status === 403) {
            setDeniedActions((current) => ({ ...current, [act]: true }));
            setActionError("No tenés permiso para esta acción. La ocultamos para no volver a interrumpir el flujo.");
            return;
          }
          setActionError(err.message);
        },
        onSettled: () => {
          setPendingActions((current) => {
            const next = { ...current };
            delete next[commandId];
            return next;
          });
        },
      },
    );
  }

  const branchId = selectedBranch?.id ?? "";
  const filteredByQuickView =
    quickView === "LATE"
      ? commands.filter(
          (command) => urgencyFor(now - new Date(command.receivedAt).getTime()) === "late",
        )
      : quickView === "READY"
        ? commands.filter((command) => command.status === "READY")
        : quickView === "MINE"
          ? commands.filter((command) => command.ownerActorRef === me?.user.id)
        : commands;
  const visibleCommands =
    quickView === "NONE"
      ? activeFilter === "ALL"
        ? commands
        : commands.filter((command) => command.status === activeFilter)
      : activeFilter === "ALL"
        ? filteredByQuickView
        : filteredByQuickView.filter((command) => command.status === activeFilter);
  const groupedCommands =
    activeFilter === "ALL" && quickView !== "READY"
      ? STATUS_SECTIONS.map((section) => ({
          ...section,
          commands: visibleCommands.filter((command) => command.status === section.key),
        })).filter((section) => section.commands.length > 0)
      : [];
  const lateCount = commands.filter((command) => urgencyFor(now - new Date(command.receivedAt).getTime()) === "late").length;
  const readyCount = commands.filter((command) => command.status === "READY").length;
  const mineCount = commands.filter((command) => command.ownerActorRef === me?.user.id).length;
  const newCount = commands.filter((command) => newArrivalAt[command.id] !== undefined).length;
  const quickViewLabel =
    quickView === "LATE"
      ? "Atrasadas"
      : quickView === "READY"
        ? "Listas"
        : quickView === "MINE"
          ? "Mis comandas"
          : null;
  const filterLabel = FILTERS.find((filter) => filter.key === activeFilter)?.label ?? "Todas";
  const activeViewLabel =
    quickViewLabel && activeFilter !== "ALL"
      ? `${quickViewLabel} · ${filterLabel}`
      : quickViewLabel ?? (activeFilter !== "ALL" ? filterLabel : null);
  const emptyTitle =
    commands.length === 0
      ? "Todo al día"
      : quickView === "LATE"
        ? "Sin atrasadas en esta vista"
        : quickView === "READY"
          ? "Nada lista para salir"
          : quickView === "MINE"
            ? "No tenés comandas tomadas"
            : activeFilter === "RECEIVED"
              ? "No entraron comandas nuevas"
              : activeFilter === "CLAIMED"
                ? "No hay comandas tomadas"
                : activeFilter === "IN_PROGRESS"
                  ? "No hay comandas en preparación"
                  : activeFilter === "ON_HOLD"
                    ? "No hay comandas en pausa"
                    : activeFilter === "READY"
                      ? "No hay comandas listas"
                      : "Nada en esta vista";
  const emptyMessage =
    commands.length === 0
      ? "No hay comandas pendientes en esta estación. Buen trabajo. 👏"
      : quickView === "LATE"
        ? "La cola está controlada. Volvé a la vista completa para seguir monitoreando el resto."
        : quickView === "READY"
          ? "Todavía no hay platos listos para handoff desde esta estación."
          : quickView === "MINE"
            ? "Podés tomar una comanda nueva o volver a la vista completa para revisar toda la cola."
            : activeFilter === "RECEIVED"
              ? "No hay ingresos pendientes de tomar en este momento."
              : activeFilter === "CLAIMED"
                ? "Nadie dejó comandas tomadas sin empezar."
                : activeFilter === "IN_PROGRESS"
                  ? "Ahora mismo no hay producción activa en esta vista."
                  : activeFilter === "ON_HOLD"
                    ? "No quedaron comandas pausadas para retomar."
                    : activeFilter === "READY"
                      ? "Todavía no hay preparación terminada para entregar."
                      : "Probá con otro estado o salí del atajo operativo para seguir monitoreando la cola.";
  const emptyIcon =
    commands.length === 0
      ? "✅"
      : quickView === "LATE"
        ? "🟢"
        : quickView === "READY"
          ? "🍽️"
          : quickView === "MINE"
            ? "🧑‍🍳"
            : activeFilter === "RECEIVED"
              ? "📭"
              : activeFilter === "CLAIMED"
                ? "🤝"
                : activeFilter === "IN_PROGRESS"
                  ? "🔥"
                  : activeFilter === "ON_HOLD"
                    ? "⏸️"
                    : activeFilter === "READY"
                      ? "🍽️"
                      : "✅";
  const emptyActionLabel =
    quickView !== "NONE"
      ? "Ver cola completa"
      : activeFilter !== "ALL"
        ? "Ver todas"
        : undefined;
  const handleEmptyAction =
    quickView !== "NONE"
      ? () => setQuickView("NONE")
      : activeFilter !== "ALL"
        ? () => setActiveFilter("ALL")
        : undefined;

  return (
    <div className={`kds ${focusMode ? "kds--focus" : ""} ${rushMode ? "kds--rush" : ""}`}>
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
          <button
            type="button"
            className={`sound-toggle ${soundEnabled ? "sound-toggle--on" : ""}`}
            onClick={() => setSoundEnabled((current) => !current)}
            aria-pressed={soundEnabled}
            title={soundEnabled ? "Silenciar alertas sonoras" : "Activar alertas sonoras"}
          >
            <span aria-hidden="true">{soundEnabled ? "🔊" : "🔇"}</span>
            <span>{soundEnabled ? "Sonido on" : "Sonido off"}</span>
          </button>
          <button
            type="button"
            className={`focus-toggle ${focusMode ? "focus-toggle--on" : ""}`}
            onClick={() => void toggleFullscreen(!focusMode)}
            aria-pressed={focusMode}
            title={focusMode ? "Salir de modo foco" : "Entrar en modo foco"}
          >
            <span aria-hidden="true">{focusMode ? "🡼" : "⛶"}</span>
            <span>{focusMode ? "Salir foco" : "Modo foco"}</span>
          </button>
          <button
            type="button"
            className={`rush-toggle ${rushMode ? "rush-toggle--on" : ""}`}
            onClick={() => setRushMode((current) => !current)}
            aria-pressed={rushMode}
            title={rushMode ? "Volver a vista normal" : "Activar vista compacta para hora pico"}
          >
            <span aria-hidden="true">{rushMode ? "▤" : "☷"}</span>
            <span>{rushMode ? "Rush on" : "Rush off"}</span>
          </button>
          {branchId && <AlertsBanner branchId={branchId} />}
          <div className="kds-menu-wrap" ref={menuRef}>
            <button
              ref={menuToggleRef}
              type="button"
              className="btn btn--icon"
              aria-label="Ajustes"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              aria-controls="kds-settings-menu"
              onClick={() => setMenuOpen((o) => !o)}
            >
              ⚙️
            </button>
            {menuOpen && (
              <div id="kds-settings-menu" className="kds-menu" role="menu">
                <div className="kds-menu-user">{me?.user.displayName}</div>
                <button ref={firstMenuItemRef} type="button" className="kds-menu-item" onClick={() => { setMenuOpen(false); clearStation(); }}>
                  Cambiar estación
                </button>
                <button type="button" className="kds-menu-item" onClick={() => { setMenuOpen(false); void refetch(); }}>
                  Actualizar ahora
                </button>
                <button
                  type="button"
                  className="kds-menu-item"
                  onClick={() => {
                    setMenuOpen(false);
                    void toggleFullscreen(!focusMode);
                  }}
                >
                  {focusMode ? "Salir de modo foco" : "Entrar en modo foco"}
                </button>
                <button
                  type="button"
                  className="kds-menu-item"
                  onClick={() => {
                    setMenuOpen(false);
                    setRushMode((current) => !current);
                  }}
                >
                  {rushMode ? "Desactivar vista rush" : "Activar vista rush"}
                </button>
                <button type="button" className="kds-menu-item kds-menu-item--danger" onClick={() => { setMenuOpen(false); void signOut(); }}>
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

      {actionSuccess && (
        <div className="kds-action-success" role="status" aria-live="polite">
          {actionSuccess.message}
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setActionSuccess(null)}>
            Ocultar
          </button>
        </div>
      )}

      {arrivalNotice && (
        <div className="kds-arrival-banner" role="status" aria-live="polite">
          <div className="kds-arrival-copy">
            <strong>
              Entró {arrivalNotice.count} comanda{arrivalNotice.count === 1 ? "" : "s"} nueva
              {arrivalNotice.count === 1 ? "" : "s"}
            </strong>
            <span>
              Revisá la cola de {selectedStation?.displayName?.toLowerCase() ?? "esta estación"}.
            </span>
          </div>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => setArrivalNotice(null)}
          >
            Ocultar
          </button>
        </div>
      )}

      {lateNotice && (
        <div className="kds-late-banner" role="status" aria-live="polite">
          <div className="kds-arrival-copy">
            <strong>
              {lateNotice.count} comanda{lateNotice.count === 1 ? "" : "s"} pasó
              {lateNotice.count === 1 ? "" : "ron"} a atrasada
            </strong>
            <span>Chequeá rápido las tarjetas en rojo o usá el atajo “Atrasadas”.</span>
          </div>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => setLateNotice(null)}
          >
            Ocultar
          </button>
        </div>
      )}

      <main className="kds-main">
        {focusMode && (
          <section className="focus-banner" aria-label="Modo foco activo">
            <strong>Modo foco activo</strong>
            <span>Vista limpia para servicio continuo. Tocá “Salir foco” para volver al modo normal.</span>
          </section>
        )}
        {rushMode && (
          <section className="rush-banner" aria-label="Vista rush activa">
            <strong>Vista rush activa</strong>
            <span>Cards compactas para meter más comandas en pantalla durante hora pico.</span>
          </section>
        )}
        <section className="kds-critical-bar" aria-label="Métricas críticas">
          <div className="critical-pill">
            <span className="critical-pill__label">Pendientes</span>
            <strong className="critical-pill__value">{commands.length}</strong>
          </div>
          <div className="critical-pill critical-pill--ready">
            <span className="critical-pill__label">Listas</span>
            <strong className="critical-pill__value">{readyCount}</strong>
          </div>
          <div className="critical-pill critical-pill--late">
            <span className="critical-pill__label">Atrasadas</span>
            <strong className="critical-pill__value">{lateCount}</strong>
          </div>
          <div className="critical-pill critical-pill--new">
            <span className="critical-pill__label">Entraron recién</span>
            <strong className="critical-pill__value">{newCount}</strong>
          </div>
        </section>
        <section className="kds-summary" aria-label="Resumen operativo">
          <div className="summary-card">
            <span className="summary-label">Pendientes</span>
            <strong className="summary-value">{commands.length}</strong>
          </div>
          <div className="summary-card">
            <span className="summary-label">Listas</span>
            <strong className="summary-value">{readyCount}</strong>
          </div>
          <div className="summary-card">
            <span className="summary-label">Atrasadas</span>
            <strong className="summary-value">{lateCount}</strong>
          </div>
          <div className="summary-card">
            <span className="summary-label">Mías</span>
            <strong className="summary-value">{mineCount}</strong>
          </div>
          <div className="summary-card">
            <span className="summary-label">Entraron recién</span>
            <strong className="summary-value">{newCount}</strong>
          </div>
        </section>

        <section className="kds-filters" aria-label="Filtros de comandas">
          {FILTERS.map((filter) => {
            const count =
              filter.key === "ALL"
                ? commands.length
                : commands.filter((command) => command.status === filter.key).length;
            return (
              <button
                key={filter.key}
                type="button"
                className={`filter-chip ${activeFilter === filter.key ? "filter-chip--active" : ""}`}
                onClick={() => {
                  setQuickView("NONE");
                  setActiveFilter(filter.key);
                }}
                aria-pressed={activeFilter === filter.key}
              >
                <span>{filter.label}</span>
                <strong>{count}</strong>
              </button>
            );
          })}
        </section>

        <section className="kds-quickviews" aria-label="Atajos operativos">
          <button
            type="button"
            className={`quickview-chip ${quickView === "LATE" ? "quickview-chip--active" : ""}`}
            onClick={() => setQuickView((current) => (current === "LATE" ? "NONE" : "LATE"))}
            aria-pressed={quickView === "LATE"}
          >
            <span>Atrasadas</span>
            <strong>{lateCount}</strong>
          </button>
          <button
            type="button"
            className={`quickview-chip ${quickView === "READY" ? "quickview-chip--active" : ""}`}
            onClick={() => setQuickView((current) => (current === "READY" ? "NONE" : "READY"))}
            aria-pressed={quickView === "READY"}
          >
            <span>Listas</span>
            <strong>{readyCount}</strong>
          </button>
          <button
            type="button"
            className={`quickview-chip ${quickView === "MINE" ? "quickview-chip--active" : ""}`}
            onClick={() => setQuickView((current) => (current === "MINE" ? "NONE" : "MINE"))}
            aria-pressed={quickView === "MINE"}
          >
            <span>Mías</span>
            <strong>{mineCount}</strong>
          </button>
          {quickView !== "NONE" && (
            <button
              type="button"
              className="quickview-clear"
              onClick={() => setQuickView("NONE")}
            >
              Ver cola completa
            </button>
          )}
        </section>

        {activeViewLabel && (
          <section className="kds-view-hint" aria-label="Vista activa">
            <span className="kds-view-hint__label">Viendo</span>
            <strong>{activeViewLabel}</strong>
            <span>
              {visibleCommands.length} comanda{visibleCommands.length === 1 ? "" : "s"}
            </span>
          </section>
        )}

        <StateView
          isLoading={isLoading}
          error={error as Error | null}
          isEmpty={visibleCommands.length === 0}
          loadingLabel="Cargando comandas…"
          emptyTitle={emptyTitle}
          emptyMessage={emptyMessage}
          emptyIcon={emptyIcon}
          emptyActionLabel={emptyActionLabel}
          onEmptyAction={handleEmptyAction}
          onRetry={() => refetch()}
        >
          {activeFilter === "ALL" && quickView !== "READY" ? (
            <div className="queue-groups">
              {groupedCommands.map((section) => (
                <section key={section.key} className={`queue-group queue-group--${section.key.toLowerCase()}`}>
                  <header className="queue-group-head">
                    <div className="queue-group-copy">
                      <h2>{section.label}</h2>
                      <p>
                        {section.commands.length} comanda{section.commands.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <span className="queue-group-count">{section.commands.length}</span>
                  </header>
                  <div className="card-grid">
                    {section.commands.map((command) => (
                      <CommandCard
                        key={command.id}
                        command={command}
                        currentUserId={me?.user.id ?? null}
                        now={now}
                        pending={pendingActions[command.id] !== undefined}
                        pendingLabel={
                          pendingActions[command.id]
                            ? ACTION_PENDING_LABEL[pendingActions[command.id]!]
                            : undefined
                        }
                        isNew={newArrivalAt[command.id] !== undefined}
                        deniedActions={deniedActions}
                        onAction={runAction}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="card-grid">
              {visibleCommands.map((command) => (
                <CommandCard
                  key={command.id}
                  command={command}
                  currentUserId={me?.user.id ?? null}
                  now={now}
                  pending={pendingActions[command.id] !== undefined}
                  pendingLabel={
                    pendingActions[command.id]
                      ? ACTION_PENDING_LABEL[pendingActions[command.id]!]
                      : undefined
                  }
                  isNew={newArrivalAt[command.id] !== undefined}
                  deniedActions={deniedActions}
                  onAction={runAction}
                />
              ))}
            </div>
          )}
        </StateView>
      </main>

      {recent.length > 0 && (
        <footer className="recent-strip" aria-label="Recién completadas">
          <span className="recent-label">Recién salió</span>
          <ul className="recent-list">
            {recent.map((r) => (
              <li key={`${r.id}-${r.at}`} className="recent-item">
                <span className="recent-item__name">✓ {r.name}</span>
                <span className="recent-item__age">{formatRecentAge(now - r.at)}</span>
              </li>
            ))}
          </ul>
          <button type="button" className="recent-clear" onClick={() => setRecent([])}>
            Limpiar
          </button>
        </footer>
      )}
    </div>
  );
}
