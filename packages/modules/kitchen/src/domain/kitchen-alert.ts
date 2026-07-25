// SPEC-101 — KitchenAlert, an operational signal derived from an SLA rule
// crossing a threshold on a Command.
//
// SCOPE NOTE (approved simplification): this is the SIMPLE version. There is no
// versioned rule/clock policy and no fingerprint-based evidence-window dedup.
// The one real invariant kept: no two OPEN alerts for the same
// (commandId + ruleCode) pair — a repeated detection does not create a duplicate
// while an OPEN one already exists (enforced in alert-commands.ts). The
// threshold rules themselves (alert-rules.ts) are two hardcoded checks evaluated
// synchronously on-demand, NOT a background scheduler/evaluator.

export type AlertSeverity = "LOW" | "MEDIUM" | "HIGH";

export type AlertStatus = "OPEN" | "ACKNOWLEDGED" | "RESOLVED" | "ESCALATED";

export interface KitchenAlert {
  id: string;
  tenantId: string;
  brandId?: string | null;
  branchId: string;
  stationId?: string | null;
  commandId: string;
  ruleCode: string;
  severity: AlertSeverity;
  status: AlertStatus;
  escalationLevel?: number | null;
  resolutionReason?: string | null;
  openedAt: Date;
  acknowledgedAt?: Date | null;
  resolvedAt?: Date | null;
  revision: number;
  createdAt: Date;
  updatedAt: Date;
}

// Lifecycle: OPEN -> ACKNOWLEDGED -> RESOLVED, with OPEN|ACKNOWLEDGED|ESCALATED
// able to ESCALATE (raising escalationLevel while conserving the operational
// state semantics), and ESCALATED able to return to ACKNOWLEDGED or RESOLVED.
// RESOLVED is terminal (a later condition creates a NEW alert, never reopens).
const allowedTransitions: Record<AlertStatus, AlertStatus[]> = {
  OPEN: ["ACKNOWLEDGED", "RESOLVED", "ESCALATED"],
  ACKNOWLEDGED: ["RESOLVED", "ESCALATED"],
  ESCALATED: ["ACKNOWLEDGED", "RESOLVED"],
  RESOLVED: [],
};

export class InvalidAlertTransitionError extends Error {
  constructor(from: AlertStatus, to: AlertStatus) {
    super(`KitchenAlert cannot transition from ${from} to ${to}`);
    this.name = "InvalidAlertTransitionError";
  }
}

export function canTransitionAlert(from: AlertStatus, to: AlertStatus): boolean {
  return allowedTransitions[from].includes(to);
}

export function assertAlertTransition(from: AlertStatus, to: AlertStatus): void {
  if (!canTransitionAlert(from, to)) {
    throw new InvalidAlertTransitionError(from, to);
  }
}
