// SPEC-069 — ReservationPreference domain model.
//
// SCOPE NOTE (approved "CRUD simple + invariantes clave" decision): full
// typed code/value validation, sanitization pipeline and consent-proof
// linkage are simplified to a plain typed record. `kind: REQUIREMENT` still
// carries the real invariant that a REQUIREMENT not satisfied blocks
// confirm/seat (enforced by callers checking `unsatisfiedRequirements`);
// PREFERENCE is best-effort only and never blocks. Subject is either a
// Guest (reusable default) or a Reservation (one-off override).

export type ReservationPreferenceKind = "PREFERENCE" | "REQUIREMENT";
export type ReservationPreferenceSubjectType = "GUEST" | "RESERVATION";

export interface ReservationPreference {
  id: string;
  tenantId: string;
  subjectType: ReservationPreferenceSubjectType;
  subjectId: string;
  code: string;
  value?: string;
  kind: ReservationPreferenceKind;
  notes?: string;
  revision: number;
  createdAt: Date;
  updatedAt: Date;
}

export function isRequirement(pref: ReservationPreference): boolean {
  return pref.kind === "REQUIREMENT";
}
