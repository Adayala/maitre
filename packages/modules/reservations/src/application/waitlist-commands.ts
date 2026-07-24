// WaitlistEntry use cases (SPEC-073). See waitlist-entry.ts for the scope
// note on the simplified FIFO + priorityOverride ordering model.

import { randomUUID } from "node:crypto";
import { type WaitlistEntry, assertWaitlistTransition } from "../domain/waitlist-entry.js";
import type { WaitlistEntryRepositoryPort } from "./ports.js";

export interface WaitlistDeps {
  waitlistEntries: WaitlistEntryRepositoryPort;
  now?: () => Date;
}

export interface AddWaitlistEntryInput {
  id?: string;
  tenantId: string;
  branchId: string;
  guestId?: string;
  partySize: number;
  quotedMinutes?: number;
  notes?: string;
}

// POST /v1/branches/{branchId}/waitlist-entries — creates WAITING with a
// server-assigned arrivedAt (used as the arrival sequence per spec).
export async function addWaitlistEntry(
  deps: WaitlistDeps,
  input: AddWaitlistEntryInput,
): Promise<WaitlistEntry> {
  const now = (deps.now ?? (() => new Date()))();
  const entry: WaitlistEntry = {
    id: input.id ?? randomUUID(),
    tenantId: input.tenantId,
    branchId: input.branchId,
    partySize: input.partySize,
    arrivedAt: now,
    priorityOverride: 0,
    status: "WAITING",
    revision: 1,
    createdAt: now,
    updatedAt: now,
    ...(input.guestId ? { guestId: input.guestId } : {}),
    ...(input.quotedMinutes !== undefined ? { quotedMinutes: input.quotedMinutes } : {}),
    ...(input.notes ? { notes: input.notes } : {}),
  };
  await deps.waitlistEntries.save(entry);
  return entry;
}

export interface NotifyWaitlistEntryInput {
  tenantId: string;
  entryId: string;
}

// POST /v1/waitlist-entries/{entryId}/notify — WAITING -> NOTIFIED. Does
// not create a capacity hold (per spec: "Notify no crea hold").
export async function notifyWaitlistEntry(
  deps: WaitlistDeps,
  input: NotifyWaitlistEntryInput,
): Promise<WaitlistEntry> {
  const entry = await deps.waitlistEntries.findById(input.tenantId, input.entryId);
  if (!entry) throw new Error(`WaitlistEntry ${input.entryId} not found`);
  assertWaitlistTransition(entry.status, "NOTIFIED");

  const now = (deps.now ?? (() => new Date()))();
  const updated: WaitlistEntry = {
    ...entry,
    status: "NOTIFIED",
    notifiedAt: now,
    revision: entry.revision + 1,
    updatedAt: now,
  };
  await deps.waitlistEntries.save(updated);
  return updated;
}

export interface SeatWaitlistEntryInput {
  tenantId: string;
  entryId: string;
  visitId: string;
}

// POST /v1/waitlist-entries/{entryId}/seat — WAITING|NOTIFIED -> SEATED.
// Links (does not create) a Visit — same approach as seatReservation: the
// route layer opens the Visit via @maitre/floor and passes visitId here.
export async function seatWaitlistEntry(
  deps: WaitlistDeps,
  input: SeatWaitlistEntryInput,
): Promise<WaitlistEntry> {
  const entry = await deps.waitlistEntries.findById(input.tenantId, input.entryId);
  if (!entry) throw new Error(`WaitlistEntry ${input.entryId} not found`);
  assertWaitlistTransition(entry.status, "SEATED");

  const now = (deps.now ?? (() => new Date()))();
  const updated: WaitlistEntry = {
    ...entry,
    status: "SEATED",
    seatedAt: now,
    visitId: input.visitId,
    revision: entry.revision + 1,
    updatedAt: now,
  };
  await deps.waitlistEntries.save(updated);
  return updated;
}

export interface CancelWaitlistEntryInput {
  tenantId: string;
  entryId: string;
  reason: string;
}

// POST /v1/waitlist-entries/{entryId}/cancel
export async function cancelWaitlistEntry(
  deps: WaitlistDeps,
  input: CancelWaitlistEntryInput,
): Promise<WaitlistEntry> {
  const entry = await deps.waitlistEntries.findById(input.tenantId, input.entryId);
  if (!entry) throw new Error(`WaitlistEntry ${input.entryId} not found`);
  assertWaitlistTransition(entry.status, "CANCELLED");

  const now = (deps.now ?? (() => new Date()))();
  const updated: WaitlistEntry = {
    ...entry,
    status: "CANCELLED",
    cancelReason: input.reason,
    revision: entry.revision + 1,
    updatedAt: now,
  };
  await deps.waitlistEntries.save(updated);
  return updated;
}

export interface ExpireWaitlistEntryInput {
  tenantId: string;
  entryId: string;
}

// POST /v1/waitlist-entries/{entryId}/expire
export async function expireWaitlistEntry(
  deps: WaitlistDeps,
  input: ExpireWaitlistEntryInput,
): Promise<WaitlistEntry> {
  const entry = await deps.waitlistEntries.findById(input.tenantId, input.entryId);
  if (!entry) throw new Error(`WaitlistEntry ${input.entryId} not found`);
  assertWaitlistTransition(entry.status, "EXPIRED");

  const now = (deps.now ?? (() => new Date()))();
  const updated: WaitlistEntry = {
    ...entry,
    status: "EXPIRED",
    revision: entry.revision + 1,
    updatedAt: now,
  };
  await deps.waitlistEntries.save(updated);
  return updated;
}

export interface SetPriorityOverrideInput {
  tenantId: string;
  entryId: string;
  priorityOverride: number;
  reason: string;
}

// POST /v1/waitlist-entries/{entryId}/priority-overrides — manual integer
// override, sortable ahead of FIFO order (see waitlist-entry.ts). Does not
// mutate arrivedAt.
export async function setWaitlistPriorityOverride(
  deps: WaitlistDeps,
  input: SetPriorityOverrideInput,
): Promise<WaitlistEntry> {
  const entry = await deps.waitlistEntries.findById(input.tenantId, input.entryId);
  if (!entry) throw new Error(`WaitlistEntry ${input.entryId} not found`);

  const now = (deps.now ?? (() => new Date()))();
  const updated: WaitlistEntry = {
    ...entry,
    priorityOverride: input.priorityOverride,
    overrideReason: input.reason,
    revision: entry.revision + 1,
    updatedAt: now,
  };
  await deps.waitlistEntries.save(updated);
  return updated;
}
