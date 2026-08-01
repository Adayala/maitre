// KitchenAlert use cases (SPEC-105). create-if-not-duplicate / acknowledge /
// resolve / escalate, plus a synchronous evaluate-and-raise over a branch's
// Commands. No background scheduler (see alert-rules.ts).

import { randomUUID } from "node:crypto";
import {
  type KitchenAlert,
  type AlertSeverity,
  type AlertStatus,
  assertAlertTransition,
} from "../domain/kitchen-alert.js";
import type { CommandRepositoryPort, KitchenAlertRepositoryPort } from "./ports.js";
import { evaluateCommandAlert } from "./alert-rules.js";

export interface AlertDeps {
  alerts: KitchenAlertRepositoryPort;
  now?: () => Date;
}

function nowFrom(deps: { now?: () => Date }): Date {
  return (deps.now ?? (() => new Date()))();
}

async function loadAlert(deps: AlertDeps, tenantId: string, id: string): Promise<KitchenAlert> {
  const alert = await deps.alerts.findById(tenantId, id);
  if (!alert) throw new Error(`KitchenAlert ${id} not found`);
  return alert;
}

export interface CreateAlertInput {
  tenantId: string;
  brandId?: string;
  branchId: string;
  stationId?: string;
  commandId: string;
  ruleCode: string;
  severity: AlertSeverity;
}

// The one real dedup invariant: never create a second OPEN alert for the same
// (commandId + ruleCode). Returns the existing OPEN alert when one is present.
export async function createAlertIfNotDuplicate(deps: AlertDeps, input: CreateAlertInput): Promise<KitchenAlert> {
  const existing = await deps.alerts.findOpenByCommandAndRule(input.tenantId, input.commandId, input.ruleCode);
  if (existing) return existing;

  const now = nowFrom(deps);
  const alert: KitchenAlert = {
    id: randomUUID(),
    tenantId: input.tenantId,
    branchId: input.branchId,
    commandId: input.commandId,
    ruleCode: input.ruleCode,
    severity: input.severity,
    status: "OPEN",
    openedAt: now,
    escalationLevel: null,
    resolutionReason: null,
    revision: 1,
    createdAt: now,
    updatedAt: now,
    ...(input.brandId ? { brandId: input.brandId } : {}),
    ...(input.stationId ? { stationId: input.stationId } : {}),
  };
  await deps.alerts.save(alert);
  return alert;
}

async function transition(
  deps: AlertDeps,
  alert: KitchenAlert,
  to: AlertStatus,
  patch: Partial<KitchenAlert>,
  transitionedAt = nowFrom(deps),
): Promise<KitchenAlert> {
  assertAlertTransition(alert.status, to);
  const updated: KitchenAlert = {
    ...alert,
    ...patch,
    status: to,
    revision: alert.revision + 1,
    updatedAt: transitionedAt,
  };
  await deps.alerts.save(updated);
  return updated;
}

export async function acknowledgeAlert(deps: AlertDeps, input: { tenantId: string; id: string }): Promise<KitchenAlert> {
  const alert = await loadAlert(deps, input.tenantId, input.id);
  const now = nowFrom(deps);
  return transition(deps, alert, "ACKNOWLEDGED", { acknowledgedAt: now }, now);
}

export async function resolveAlert(
  deps: AlertDeps,
  input: { tenantId: string; id: string; reasonCode: string },
): Promise<KitchenAlert> {
  const alert = await loadAlert(deps, input.tenantId, input.id);
  const now = nowFrom(deps);
  return transition(deps, alert, "RESOLVED", { resolvedAt: now, resolutionReason: input.reasonCode }, now);
}

// ESCALATED conserves the operational severity and raises escalationLevel.
export async function escalateAlert(deps: AlertDeps, input: { tenantId: string; id: string }): Promise<KitchenAlert> {
  const alert = await loadAlert(deps, input.tenantId, input.id);
  const nextLevel = (alert.escalationLevel ?? 0) + 1;
  return transition(deps, alert, "ESCALATED", { escalationLevel: nextLevel });
}

// Synchronous on-demand evaluation: scans a branch's Commands, and for each one
// currently violating a threshold rule, raises an alert (dedup-guarded). Returns
// the alerts that are OPEN as a result. This replaces a real-time evaluator.
export interface EvaluateAlertsDeps extends AlertDeps {
  commands: CommandRepositoryPort;
}

export async function evaluateAndRaiseAlerts(
  deps: EvaluateAlertsDeps,
  input: { tenantId: string; branchId: string },
): Promise<KitchenAlert[]> {
  const now = nowFrom(deps);
  const commands = await deps.commands.listByBranch(input.tenantId, input.branchId);
  const raised: KitchenAlert[] = [];
  for (const command of commands) {
    const hit = evaluateCommandAlert(command, now);
    if (!hit) continue;
    const alert = await createAlertIfNotDuplicate(deps, {
      tenantId: input.tenantId,
      branchId: input.branchId,
      commandId: command.id,
      ruleCode: hit.ruleCode,
      severity: hit.severity,
      ...(command.brandId ? { brandId: command.brandId } : {}),
      ...(command.stationId ? { stationId: command.stationId } : {}),
    });
    raised.push(alert);
  }
  return raised;
}
