// SPEC-067 — Guest domain model.
//
// SCOPE NOTE (approved "CRUD simple + invariantes clave" decision): the spec
// models per-field PII with purpose/treatment-basis/consent-version/
// capturedAt/source/visibility/retention plus canonical-id + alias merge
// ledger. This implementation stores Guest as a simple profile instead:
// displayName/email/phone/locale/consentGiven boolean/notes. No per-field
// consent ledger, no merge/unmerge (documented TODO below), no async
// export pipeline — `anonymize` is a synchronous command that nulls PII
// fields and marks a status.
export type GuestStatus = "ACTIVE" | "ANONYMIZED";

export interface Guest {
  id: string;
  tenantId: string;
  displayName: string;
  email?: string;
  phone?: string;
  locale?: string;
  consentGiven: boolean;
  notes?: string;
  status: GuestStatus;
  anonymizedAt?: Date | null;
  revision: number;
  createdAt: Date;
  updatedAt: Date;
}

// TODO(SPEC-067): Guest merge/unmerge with alias ledger is NOT implemented.
// Duplicate Guest profiles for the same person are not deduplicated in I0;
// there is no merge endpoint, no canonical/alias resolution, and no
// reversible unmerge workflow. Revisit once real guest-facing volume
// surfaces duplicate-contact conflicts.

export function anonymizeGuestFields(guest: Guest, now: Date): Guest {
  const { email: _email, phone: _phone, notes: _notes, locale: _locale, ...rest } = guest;
  return {
    ...rest,
    displayName: "Anonymized Guest",
    consentGiven: false,
    status: "ANONYMIZED",
    anonymizedAt: now,
    revision: guest.revision + 1,
    updatedAt: now,
  };
}
