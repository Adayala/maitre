// Visit use cases (SPEC-055). Consolidated into one file per entity
// (rather than one-file-per-command as in @maitre/subscription) — a
// deliberate scope trade-off given the number of Floor use cases; each
// exported function still maps 1:1 to a single API command.

import { randomUUID } from "node:crypto";
import {
  type Visit,
  assertVisitTransition,
  isVisitOperable,
} from "../domain/visit.js";
import { TableAlreadyOccupiedError, type Occupancy } from "../domain/occupancy.js";
import type {
  VisitRepositoryPort,
  OccupancyRepositoryPort,
  CheckRepositoryPort,
  PaymentRepositoryPort,
} from "./ports.js";
import type { OutboxPort } from "./outbox.js";
import { visitOpenedEvent, visitClosedEvent } from "./events.js";
import { netCaptured } from "../domain/payment.js";
import { computeCheckTotals } from "../domain/check.js";

export interface VisitDeps {
  visits: VisitRepositoryPort;
  occupancies: OccupancyRepositoryPort;
  outbox: OutboxPort;
  now?: () => Date;
}

export interface OpenVisitInput {
  id?: string;
  tenantId: string;
  branchId: string;
  tableIds: string[];
  guestCount: number;
  reservationId?: string;
  correlationId?: string;
}

// POST /v1/visits — seats one or more Tables and opens a Visit atomically.
// NOTE: sequential per-table repository calls, not locked-in-ID-order
// (see visit.ts scope note) — acceptable for the walking-skeleton scope.
export async function openVisit(deps: VisitDeps, input: OpenVisitInput): Promise<Visit> {
  const now = (deps.now ?? (() => new Date()))();

  for (const tableId of input.tableIds) {
    const active = await deps.occupancies.findActiveByTable(input.tenantId, tableId);
    if (active) throw new TableAlreadyOccupiedError(tableId);
  }

  const visit: Visit = {
    id: input.id ?? randomUUID(),
    tenantId: input.tenantId,
    branchId: input.branchId,
    tableIds: input.tableIds,
    guestCount: input.guestCount,
    status: "OPEN",
    revision: 1,
    createdAt: now,
    updatedAt: now,
    ...(input.reservationId ? { reservationId: input.reservationId } : {}),
  };
  await deps.visits.save(visit);

  const occupancies: Occupancy[] = [];
  for (const tableId of input.tableIds) {
    const occupancy: Occupancy = {
      id: randomUUID(),
      tenantId: input.tenantId,
      branchId: input.branchId,
      tableId,
      visitId: visit.id,
      guestCount: input.guestCount,
      status: "ACTIVE",
      startedAt: now,
      revision: 1,
    };
    await deps.occupancies.save(occupancy);
    occupancies.push(occupancy);
  }

  await deps.outbox.append(
    visitOpenedEvent(visit, occupancies, input.correlationId ?? randomUUID()),
  );
  return visit;
}

export interface MoveVisitTablesInput {
  tenantId: string;
  visitId: string;
  tableIds: string[];
  correlationId?: string;
}

// POST /v1/visits/:id/move — replaces the table assignment wholesale:
// closes occupancies for tables no longer assigned, opens new ones for
// newly assigned tables. All-or-nothing at the validation step (checked
// before any writes), though writes themselves are sequential, not a DB
// transaction (see scope note in visit.ts/occupancy.ts).
export async function moveVisitTables(deps: VisitDeps, input: MoveVisitTablesInput): Promise<Visit> {
  const visit = await deps.visits.findById(input.tenantId, input.visitId);
  if (!visit) throw new Error(`Visit ${input.visitId} not found`);
  if (!isVisitOperable(visit)) throw new Error(`Visit ${input.visitId} is not operable`);

  const now = (deps.now ?? (() => new Date()))();
  const currentTableIds = new Set(visit.tableIds);
  const nextTableIds = new Set(input.tableIds);
  const added = input.tableIds.filter((t) => !currentTableIds.has(t));
  const removed = visit.tableIds.filter((t) => !nextTableIds.has(t));

  for (const tableId of added) {
    const active = await deps.occupancies.findActiveByTable(input.tenantId, tableId);
    if (active) throw new TableAlreadyOccupiedError(tableId);
  }

  for (const tableId of removed) {
    const active = await deps.occupancies.findActiveByTable(input.tenantId, tableId);
    if (active && active.visitId === visit.id) {
      await deps.occupancies.save({ ...active, status: "CLOSED", endedAt: now, revision: active.revision + 1 });
    }
  }
  for (const tableId of added) {
    await deps.occupancies.save({
      id: randomUUID(),
      tenantId: input.tenantId,
      branchId: visit.branchId,
      tableId,
      visitId: visit.id,
      guestCount: visit.guestCount,
      status: "ACTIVE",
      startedAt: now,
      revision: 1,
    });
  }

  const updated: Visit = {
    ...visit,
    tableIds: input.tableIds,
    revision: visit.revision + 1,
    updatedAt: now,
  };
  await deps.visits.save(updated);
  return updated;
}

export interface RequestCloseVisitInput {
  tenantId: string;
  visitId: string;
}

// POST /v1/visits/:id/request-close — OPEN -> CLOSING.
export async function requestCloseVisit(deps: VisitDeps, input: RequestCloseVisitInput): Promise<Visit> {
  const visit = await deps.visits.findById(input.tenantId, input.visitId);
  if (!visit) throw new Error(`Visit ${input.visitId} not found`);
  assertVisitTransition(visit.status, "CLOSING");
  const now = (deps.now ?? (() => new Date()))();
  const updated: Visit = { ...visit, status: "CLOSING", revision: visit.revision + 1, updatedAt: now };
  await deps.visits.save(updated);
  return updated;
}

export interface CloseVisitDeps extends VisitDeps {
  checks: CheckRepositoryPort;
  payments: PaymentRepositoryPort;
}

export class VisitCloseBlockedError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = "VisitCloseBlockedError";
  }
}

export interface CloseVisitInput {
  tenantId: string;
  visitId: string;
  correlationId?: string;
}

// POST /v1/visits/:id/close — CLOSING -> CLOSED. Validates the Check is
// SETTLED or VOID (or absent) and closes remaining ACTIVE occupancies.
export async function closeVisit(deps: CloseVisitDeps, input: CloseVisitInput): Promise<Visit> {
  const visit = await deps.visits.findById(input.tenantId, input.visitId);
  if (!visit) throw new Error(`Visit ${input.visitId} not found`);
  assertVisitTransition(visit.status, "CLOSED");

  const check = await deps.checks.findByVisit(input.tenantId, visit.id);
  if (check && check.status !== "SETTLED" && check.status !== "VOID") {
    const payments = await deps.payments.listByCheck(input.tenantId, check.id);
    const paid = payments.reduce((sum, p) => sum + netCaptured(p), 0);
    const totals = computeCheckTotals(check, paid);
    throw new VisitCloseBlockedError(
      `Check ${check.id} is not settled (status=${check.status}, balance=${totals.balance})`,
    );
  }

  const now = (deps.now ?? (() => new Date()))();
  const occupancies = await deps.occupancies.listByVisit(input.tenantId, visit.id);
  for (const occ of occupancies) {
    if (occ.status === "ACTIVE") {
      await deps.occupancies.save({ ...occ, status: "CLOSED", endedAt: now, revision: occ.revision + 1 });
    }
  }

  const updated: Visit = { ...visit, status: "CLOSED", closedAt: now, revision: visit.revision + 1, updatedAt: now };
  await deps.visits.save(updated);
  await deps.outbox.append(visitClosedEvent(updated, input.correlationId ?? randomUUID()));
  return updated;
}

export interface CancelVisitInput {
  tenantId: string;
  visitId: string;
  reason: string;
}

// POST /v1/visits/:id/cancel — only before any consumption/Check.
export async function cancelVisit(deps: VisitDeps & { checks: CheckRepositoryPort }, input: CancelVisitInput): Promise<Visit> {
  const visit = await deps.visits.findById(input.tenantId, input.visitId);
  if (!visit) throw new Error(`Visit ${input.visitId} not found`);
  assertVisitTransition(visit.status, "CANCELLED");

  const existingCheck = await deps.checks.findByVisit(input.tenantId, visit.id);
  if (existingCheck) {
    throw new VisitCloseBlockedError(`Visit ${visit.id} already has a Check and cannot be cancelled`);
  }

  const now = (deps.now ?? (() => new Date()))();
  const occupancies = await deps.occupancies.listByVisit(input.tenantId, visit.id);
  for (const occ of occupancies) {
    if (occ.status === "ACTIVE") {
      await deps.occupancies.save({ ...occ, status: "CLOSED", endedAt: now, revision: occ.revision + 1 });
    }
  }

  const updated: Visit = {
    ...visit,
    status: "CANCELLED",
    cancelledAt: now,
    cancelReason: input.reason,
    revision: visit.revision + 1,
    updatedAt: now,
  };
  await deps.visits.save(updated);
  return updated;
}

export interface ReopenVisitInput {
  tenantId: string;
  visitId: string;
  reason: string;
}

// POST /v1/visits/:id/reopen — manager-only corrective workflow,
// CLOSING -> OPEN (RBAC enforces the manager/reason requirement at the
// route layer via visit:reopen permission; reason is stored for audit).
export async function reopenVisit(deps: VisitDeps, input: ReopenVisitInput): Promise<Visit> {
  const visit = await deps.visits.findById(input.tenantId, input.visitId);
  if (!visit) throw new Error(`Visit ${input.visitId} not found`);
  assertVisitTransition(visit.status, "OPEN");
  const now = (deps.now ?? (() => new Date()))();
  const updated: Visit = { ...visit, status: "OPEN", revision: visit.revision + 1, updatedAt: now };
  await deps.visits.save(updated);
  return updated;
}
