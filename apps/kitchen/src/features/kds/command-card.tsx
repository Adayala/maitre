import type { Command, CommandStatus } from "../../lib/kitchen-types.js";
import { formatElapsed, urgencyFor, type Urgency } from "./use-now.js";
import type { CommandAction } from "./use-command-action.js";

const STATUS_LABEL: Record<CommandStatus, string> = {
  RECEIVED: "Nueva",
  CLAIMED: "Tomada",
  IN_PROGRESS: "En preparación",
  ON_HOLD: "En pausa",
  READY: "Lista",
  COMPLETED: "Entregada",
  CANCELLED: "Cancelada",
};

interface ActionButton {
  action: CommandAction;
  label: string;
  variant: "primary" | "success" | "neutral";
  needsReason?: boolean;
}

// The cook-facing next steps for each status, per the SPEC-110 machine.
function primaryActionsFor(status: CommandStatus): ActionButton[] {
  switch (status) {
    case "RECEIVED":
      return [{ action: "claim", label: "Tomar", variant: "primary" }];
    case "CLAIMED":
      return [
        { action: "start", label: "Empezar", variant: "primary" },
        { action: "release", label: "Soltar", variant: "neutral" },
      ];
    case "IN_PROGRESS":
      return [
        { action: "mark-ready", label: "Marcar lista", variant: "success" },
        { action: "hold", label: "Pausar", variant: "neutral" },
      ];
    case "ON_HOLD":
      return [{ action: "resume", label: "Reanudar", variant: "primary" }];
    case "READY":
      return [{ action: "complete-handoff", label: "Entregar", variant: "success" }];
    default:
      return [];
  }
}

interface CommandCardProps {
  command: Command;
  currentUserId: string | null;
  now: number;
  pending: boolean;
  isNew: boolean;
  onAction: (commandId: string, action: CommandAction, reason?: string) => void;
}

export function CommandCard({
  command,
  currentUserId,
  now,
  pending,
  isNew,
  onAction,
}: CommandCardProps) {
  const receivedMs = new Date(command.receivedAt).getTime();
  const elapsedMs = now - receivedMs;
  const urgency: Urgency = urgencyFor(elapsedMs);
  const newAndUrgent = isNew && urgency !== "calm";
  const { payload, status } = command;

  const ownedByMe = Boolean(command.ownerActorRef && command.ownerActorRef === currentUserId);
  const ownedByOther = Boolean(
    command.ownerActorRef && command.ownerActorRef !== currentUserId,
  );

  const actions = primaryActionsFor(status);
  const canCancel = status !== "READY"; // keep the destructive tap away from the hand-off moment

  function handleCancel() {
    const reason = window.prompt("Motivo de la cancelación:");
    if (reason && reason.trim()) onAction(command.id, "cancel", reason.trim());
  }

  return (
    <article
      className={[
        "card",
        `card--${status.toLowerCase()}`,
        `card--u-${urgency}`,
        newAndUrgent ? "card--new-urgent" : "",
        ownedByOther ? "card--other-owner" : "",
        ownedByMe ? "card--mine" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={`${payload.displayName}, ${STATUS_LABEL[status]}`}
    >
      <header className="card-top">
        <span className="card-qty" aria-label={`Cantidad ${payload.quantity}`}>
          ×{payload.quantity}
        </span>
        <div className="card-heading">
          <div className="card-heading-top">
            <h3 className="card-name">{payload.displayName}</h3>
            <div className="card-flags">
              {isNew && <span className="pill pill--new">Nueva</span>}
              {newAndUrgent && (
                <span className={`pill ${urgency === "late" ? "pill--rush" : "pill--warn"}`}>
                  {urgency === "late" ? "Urgente" : "Atención"}
                </span>
              )}
            </div>
          </div>
          <span className={`pill pill--${status.toLowerCase()}`}>{STATUS_LABEL[status]}</span>
        </div>
        <span
          className={`timer timer--${urgency}`}
          title="Tiempo desde que se recibió"
          aria-label={`Hace ${formatElapsed(elapsedMs)}`}
        >
          {formatElapsed(elapsedMs)}
        </span>
      </header>

      {payload.allergenFlags.length > 0 && (
        <div className="allergens" role="group" aria-label="Alérgenos">
          <span className="allergens-icon" aria-hidden="true">
            ⚠
          </span>
          {payload.allergenFlags.map((a) => (
            <span key={a} className="allergen-badge">
              {a}
            </span>
          ))}
        </div>
      )}

      {payload.modifierSummary && <p className="card-mods">{payload.modifierSummary}</p>}

      {payload.notes && (
        <p className="card-notes">
          <span className="card-notes-label">Nota</span>
          {payload.notes}
        </p>
      )}

      <footer className="card-foot">
        {(ownedByMe || ownedByOther) && (
          <span className={`owner ${ownedByMe ? "owner--me" : "owner--other"}`}>
            {ownedByMe ? "Vos" : `Otro cocinero`}
          </span>
        )}
        <div className="card-actions">
          {canCancel && (
            <button
              type="button"
              className="btn btn--danger-ghost"
              disabled={pending}
              onClick={handleCancel}
            >
              Cancelar
            </button>
          )}
          {actions.map((a) => (
            <button
              key={a.action}
              type="button"
              className={`btn btn--${a.variant} btn--action`}
              disabled={pending}
              onClick={() => onAction(command.id, a.action)}
            >
              {a.label}
            </button>
          ))}
        </div>
      </footer>
    </article>
  );
}
