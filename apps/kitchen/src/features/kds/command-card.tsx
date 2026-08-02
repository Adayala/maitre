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
      return [
        { action: "complete-handoff", label: "Entregar", variant: "success" },
      ];
    default:
      return [];
  }
}

interface CommandCardProps {
  command: Command;
  currentUserId: string | null;
  now: number;
  pending: boolean;
  pendingLabel?: string;
  isNew: boolean;
  deniedActions?: Partial<Record<CommandAction, true>>;
  onAction: (commandId: string, action: CommandAction, reason?: string) => void;
}

export function CommandCard({
  command,
  currentUserId,
  now,
  pending,
  pendingLabel,
  isNew,
  deniedActions,
  onAction,
}: CommandCardProps) {
  const receivedMs = new Date(command.receivedAt).getTime();
  const elapsedMs = now - receivedMs;
  const urgency: Urgency = urgencyFor(elapsedMs);
  const newAndUrgent = isNew && urgency !== "calm";
  const { payload, status } = command;

  const ownedByMe = Boolean(
    command.ownerActorRef && command.ownerActorRef === currentUserId,
  );
  const ownedByOther = Boolean(
    command.ownerActorRef && command.ownerActorRef !== currentUserId,
  );
  const lockedByOtherOwner =
    ownedByOther && status !== "COMPLETED" && status !== "CANCELLED";
  const flowHint = lockedByOtherOwner
    ? { label: "Bloqueada", tone: "blocked" as const }
    : ownedByMe
      ? { label: "Tuya", tone: "mine" as const }
      : status === "RECEIVED"
        ? { label: "Tomable", tone: "claimable" as const }
        : status === "ON_HOLD"
          ? { label: "Retomar", tone: "hold" as const }
          : status === "READY"
            ? { label: "Despachar", tone: "ready" as const }
            : null;

  const actions = lockedByOtherOwner
    ? []
    : primaryActionsFor(status).filter(
        (action) => !deniedActions?.[action.action],
      );
  const decisionNote = getDecisionNote({
    status,
    lockedByOtherOwner,
    ownedByMe,
    hasAllergens: payload.allergenFlags.length > 0,
    hasNotes: Boolean(payload.notes),
  });

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
      data-command-id={command.id}
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
                <span
                  className={`pill ${urgency === "late" ? "pill--rush" : "pill--warn"}`}
                >
                  {urgency === "late" ? "Urgente" : "Atención"}
                </span>
              )}
            </div>
          </div>
          <span className={`pill pill--${status.toLowerCase()}`}>
            {STATUS_LABEL[status]}
          </span>
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

      {payload.modifierSummary && (
        <p className="card-mods">{payload.modifierSummary}</p>
      )}

      {payload.notes && (
        <p className="card-notes">
          <span className="card-notes-label">Nota</span>
          {payload.notes}
        </p>
      )}

      <footer className="card-foot">
        {(ownedByMe || ownedByOther || flowHint) && (
          <div className="card-meta">
            {(ownedByMe || ownedByOther) && (
              <span
                className={`owner ${ownedByMe ? "owner--me" : "owner--other"}`}
              >
                {ownedByMe ? "Vos" : `Otro cocinero`}
              </span>
            )}
            {flowHint && (
              <span className={`flow-hint flow-hint--${flowHint.tone}`}>
                {flowHint.label}
              </span>
            )}
          </div>
        )}
        {lockedByOtherOwner && (
          <p className="card-lock-note">
            Esta comanda está en manos de otro cocinero. Desde esta pantalla
            queda en solo lectura.
          </p>
        )}
        {pending && pendingLabel && (
          <p className="card-pending-note" role="status" aria-live="polite">
            {pendingLabel}
          </p>
        )}
        {decisionNote ? (
          <p className="card-decision-note">{decisionNote}</p>
        ) : null}
        <div className="card-actions">
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

function getDecisionNote({
  status,
  lockedByOtherOwner,
  ownedByMe,
  hasAllergens,
  hasNotes,
}: {
  status: CommandStatus;
  lockedByOtherOwner: boolean;
  ownedByMe: boolean;
  hasAllergens: boolean;
  hasNotes: boolean;
}) {
  if (lockedByOtherOwner) {
    return "Quedó tomada por otro cocinero; seguí sólo cuando se libere o llegue el handoff.";
  }

  if (status === "RECEIVED") {
    return hasAllergens || hasNotes
      ? "Antes de tomarla, mirá alérgenos y nota para no arrancar con un supuesto incorrecto."
      : "Si esta estación la va a producir ahora, el siguiente paso natural es tomarla.";
  }

  if (status === "CLAIMED") {
    return ownedByMe
      ? "Ya está tomada por vos: empezá preparación o soltala si no corresponde a esta estación."
      : "La comanda está tomada y lista para arrancar preparación.";
  }

  if (status === "IN_PROGRESS") {
    return "Seguí producción y marcala lista sólo cuando toda la línea pueda salir sin bloqueo.";
  }

  if (status === "ON_HOLD") {
    return "Retomala cuando el bloqueo operativo esté resuelto y el flujo pueda continuar.";
  }

  if (status === "READY") {
    return "Confirmá handoff cuando efectivamente salga de cocina para no dejar falsas listas.";
  }

  return null;
}
