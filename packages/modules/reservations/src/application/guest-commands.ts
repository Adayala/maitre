// Guest use cases (SPEC-072). See guest.ts for the scope note on the
// simplified profile model (no per-field consent ledger, no merge/unmerge,
// no async export pipeline).

import { randomUUID } from "node:crypto";
import { type Guest, anonymizeGuestFields } from "../domain/guest.js";
import type { GuestRepositoryPort } from "./ports.js";

export interface GuestDeps {
  guests: GuestRepositoryPort;
  now?: () => Date;
}

export interface CreateGuestInput {
  id?: string;
  tenantId: string;
  displayName: string;
  email?: string;
  phone?: string;
  locale?: string;
  consentGiven?: boolean;
  notes?: string;
}

// POST /v1/guests
export async function createGuest(deps: GuestDeps, input: CreateGuestInput): Promise<Guest> {
  const now = (deps.now ?? (() => new Date()))();
  const guest: Guest = {
    id: input.id ?? randomUUID(),
    tenantId: input.tenantId,
    displayName: input.displayName,
    consentGiven: input.consentGiven ?? false,
    status: "ACTIVE",
    revision: 1,
    createdAt: now,
    updatedAt: now,
    ...(input.email ? { email: input.email } : {}),
    ...(input.phone ? { phone: input.phone } : {}),
    ...(input.locale ? { locale: input.locale } : {}),
    ...(input.notes ? { notes: input.notes } : {}),
  };
  await deps.guests.save(guest);
  return guest;
}

export interface UpdateGuestInput {
  tenantId: string;
  guestId: string;
  displayName?: string;
  email?: string;
  phone?: string;
  locale?: string;
  consentGiven?: boolean;
  notes?: string;
}

// PATCH /v1/guests/{guestId}
export async function updateGuest(deps: GuestDeps, input: UpdateGuestInput): Promise<Guest> {
  const guest = await deps.guests.findById(input.tenantId, input.guestId);
  if (!guest) throw new Error(`Guest ${input.guestId} not found`);
  if (guest.status === "ANONYMIZED") throw new Error(`Guest ${input.guestId} is anonymized`);

  const now = (deps.now ?? (() => new Date()))();
  const updated: Guest = {
    ...guest,
    ...(input.displayName !== undefined ? { displayName: input.displayName } : {}),
    ...(input.email !== undefined ? { email: input.email } : {}),
    ...(input.phone !== undefined ? { phone: input.phone } : {}),
    ...(input.locale !== undefined ? { locale: input.locale } : {}),
    ...(input.consentGiven !== undefined ? { consentGiven: input.consentGiven } : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
    revision: guest.revision + 1,
    updatedAt: now,
  };
  await deps.guests.save(updated);
  return updated;
}

export interface AnonymizeGuestInput {
  tenantId: string;
  guestId: string;
}

// POST /v1/guests/{guestId}/anonymizations — SPEC-072 simplified: a
// synchronous command (not an async workflow) that nulls PII fields and
// marks status ANONYMIZED. Does not touch Reservation/Audit records
// referencing this guestId (matches spec: "no elimina Reservation, Audit").
export async function anonymizeGuest(deps: GuestDeps, input: AnonymizeGuestInput): Promise<Guest> {
  const guest = await deps.guests.findById(input.tenantId, input.guestId);
  if (!guest) throw new Error(`Guest ${input.guestId} not found`);
  const now = (deps.now ?? (() => new Date()))();
  const updated = anonymizeGuestFields(guest, now);
  await deps.guests.save(updated);
  return updated;
}
