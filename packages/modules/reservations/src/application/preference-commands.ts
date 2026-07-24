// ReservationPreference use cases (SPEC-069). Simple CRUD — no versioning,
// no consent-proof linkage (see reservation-preference.ts scope note).

import { randomUUID } from "node:crypto";
import type { ReservationPreference } from "../domain/reservation-preference.js";
import type { ReservationPreferenceRepositoryPort } from "./ports.js";

export interface PreferenceDeps {
  preferences: ReservationPreferenceRepositoryPort;
  now?: () => Date;
}

export interface CreatePreferenceInput {
  id?: string;
  tenantId: string;
  subjectType: "GUEST" | "RESERVATION";
  subjectId: string;
  code: string;
  value?: string;
  kind: "PREFERENCE" | "REQUIREMENT";
  notes?: string;
}

export async function createReservationPreference(
  deps: PreferenceDeps,
  input: CreatePreferenceInput,
): Promise<ReservationPreference> {
  const now = (deps.now ?? (() => new Date()))();
  const preference: ReservationPreference = {
    id: input.id ?? randomUUID(),
    tenantId: input.tenantId,
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    code: input.code,
    kind: input.kind,
    revision: 1,
    createdAt: now,
    updatedAt: now,
    ...(input.value !== undefined ? { value: input.value } : {}),
    ...(input.notes ? { notes: input.notes } : {}),
  };
  await deps.preferences.save(preference);
  return preference;
}
