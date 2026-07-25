// SPEC-101 alert rules — the two hardcoded threshold checks (approved
// simplification: no versioned rule/clock policy, no evidence-window fingerprint).
// Evaluated synchronously on-demand (see alert-commands.ts evaluateCommandAlerts),
// NOT by a background scheduler.

import type { Command } from "../domain/command.js";
import type { AlertSeverity } from "../domain/kitchen-alert.js";

// A Command sitting in RECEIVED/CLAIMED longer than this without starting
// production is stale.
export const STALE_BEFORE_START_MINUTES = 15;
// A Command IN_PROGRESS longer than this without reaching READY is stale.
export const STALE_IN_PROGRESS_MINUTES = 30;

export const RULE_STALE_BEFORE_START = "STALE_BEFORE_START";
export const RULE_STALE_IN_PROGRESS = "STALE_IN_PROGRESS";

export interface AlertRuleHit {
  ruleCode: string;
  severity: AlertSeverity;
}

function minutesBetween(from: Date, to: Date): number {
  return (to.getTime() - from.getTime()) / 60_000;
}

// Returns a rule hit if `command` currently violates a threshold at `now`, else null.
export function evaluateCommandAlert(command: Command, now: Date): AlertRuleHit | null {
  if (command.status === "RECEIVED" || command.status === "CLAIMED") {
    if (minutesBetween(command.receivedAt, now) > STALE_BEFORE_START_MINUTES) {
      return { ruleCode: RULE_STALE_BEFORE_START, severity: "MEDIUM" };
    }
  }
  if (command.status === "IN_PROGRESS" && command.startedAt) {
    if (minutesBetween(command.startedAt, now) > STALE_IN_PROGRESS_MINUTES) {
      return { ruleCode: RULE_STALE_IN_PROGRESS, severity: "HIGH" };
    }
  }
  return null;
}
