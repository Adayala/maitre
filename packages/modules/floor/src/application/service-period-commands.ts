// ServicePeriod use cases (SPEC-060).

import { randomUUID } from "node:crypto";
import {
  type ServicePeriod,
  assertServicePeriodTransition,
  ConflictingServicePeriodError,
} from "../domain/service-period.js";
import type { ServicePeriodRepositoryPort } from "./ports.js";

export interface ServicePeriodDeps {
  servicePeriods: ServicePeriodRepositoryPort;
  now?: () => Date;
}

export interface CreateServicePeriodInput {
  tenantId: string;
  branchId: string;
  businessDate: string;
  name: string;
  type: ServicePeriod["type"];
  plannedOpen?: Date;
  plannedClose?: Date;
}

// POST /v1/branches/:id/service-periods — always starts PLANNED.
export async function createServicePeriod(deps: ServicePeriodDeps, input: CreateServicePeriodInput): Promise<ServicePeriod> {
  const now = (deps.now ?? (() => new Date()))();
  const period: ServicePeriod = {
    id: randomUUID(),
    tenantId: input.tenantId,
    branchId: input.branchId,
    businessDate: input.businessDate,
    name: input.name,
    type: input.type,
    status: "PLANNED",
    revision: 1,
    createdAt: now,
    updatedAt: now,
    ...(input.plannedOpen ? { plannedOpen: input.plannedOpen } : {}),
    ...(input.plannedClose ? { plannedClose: input.plannedClose } : {}),
  };
  await deps.servicePeriods.save(period);
  return period;
}

export interface OpenServicePeriodInput {
  tenantId: string;
  servicePeriodId: string;
}

// POST /v1/service-periods/:id/open — enforces the one hard rule: at
// most one OPEN/CLOSING ServicePeriod per branch.
export async function openServicePeriod(deps: ServicePeriodDeps, input: OpenServicePeriodInput): Promise<ServicePeriod> {
  const period = await deps.servicePeriods.findById(input.tenantId, input.servicePeriodId);
  if (!period) throw new Error(`ServicePeriod ${input.servicePeriodId} not found`);
  assertServicePeriodTransition(period.status, "OPEN");

  const active = await deps.servicePeriods.findActiveByBranch(input.tenantId, period.branchId);
  if (active && active.id !== period.id) throw new ConflictingServicePeriodError(period.branchId);

  const now = (deps.now ?? (() => new Date()))();
  const updated: ServicePeriod = { ...period, status: "OPEN", actualOpen: now, revision: period.revision + 1, updatedAt: now };
  await deps.servicePeriods.save(updated);
  return updated;
}

export interface BeginCloseServicePeriodInput {
  tenantId: string;
  servicePeriodId: string;
}

// POST /v1/service-periods/:id/begin-close — OPEN -> CLOSING, blocks new Visits.
export async function beginCloseServicePeriod(deps: ServicePeriodDeps, input: BeginCloseServicePeriodInput): Promise<ServicePeriod> {
  const period = await deps.servicePeriods.findById(input.tenantId, input.servicePeriodId);
  if (!period) throw new Error(`ServicePeriod ${input.servicePeriodId} not found`);
  assertServicePeriodTransition(period.status, "CLOSING");
  const now = (deps.now ?? (() => new Date()))();
  const updated: ServicePeriod = { ...period, status: "CLOSING", revision: period.revision + 1, updatedAt: now };
  await deps.servicePeriods.save(updated);
  return updated;
}

export interface CloseServicePeriodInput {
  tenantId: string;
  servicePeriodId: string;
  force?: boolean;
  reason?: string;
}

export class ServicePeriodCloseBlockedError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = "ServicePeriodCloseBlockedError";
  }
}

// POST /v1/service-periods/:id/close (and force-close via force:true +
// reason). Blocker check (pending Visits/Checks/Payments) is deferred to
// the caller passing `force` — this MVP doesn't wire the full blockers
// typed-response contract, just the hard CLOSING->CLOSED transition and
// the force+reason requirement.
export async function closeServicePeriod(deps: ServicePeriodDeps, input: CloseServicePeriodInput): Promise<ServicePeriod> {
  const period = await deps.servicePeriods.findById(input.tenantId, input.servicePeriodId);
  if (!period) throw new Error(`ServicePeriod ${input.servicePeriodId} not found`);
  assertServicePeriodTransition(period.status, "CLOSED");
  if (input.force && !input.reason) {
    throw new ServicePeriodCloseBlockedError("force-close requires a reason");
  }
  const now = (deps.now ?? (() => new Date()))();
  const updated: ServicePeriod = { ...period, status: "CLOSED", actualClose: now, revision: period.revision + 1, updatedAt: now };
  await deps.servicePeriods.save(updated);
  return updated;
}

export interface CancelPlannedServicePeriodInput {
  tenantId: string;
  servicePeriodId: string;
}

// POST /v1/service-periods/:id/cancel-planned — only PLANNED.
export async function cancelPlannedServicePeriod(deps: ServicePeriodDeps, input: CancelPlannedServicePeriodInput): Promise<ServicePeriod> {
  const period = await deps.servicePeriods.findById(input.tenantId, input.servicePeriodId);
  if (!period) throw new Error(`ServicePeriod ${input.servicePeriodId} not found`);
  assertServicePeriodTransition(period.status, "CANCELLED");
  const now = (deps.now ?? (() => new Date()))();
  const updated: ServicePeriod = { ...period, status: "CANCELLED", revision: period.revision + 1, updatedAt: now };
  await deps.servicePeriods.save(updated);
  return updated;
}
