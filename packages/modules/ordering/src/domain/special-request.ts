// SPEC-093 — SpecialRequest, a typed request against a Reservation/Visit/Order.
//
// SCOPE NOTE (approved simplification): the per-field purpose / visibility /
// retentionPolicy / consentBasis tracking is deferred — those are stored (if at
// all) as plain optional strings. Free text is optional and length-capped; it
// is NOT a substitute for allergen codes. Lifecycle is the authoritative
// PENDING -> ACCEPTED | REJECTED, and ACCEPTED -> FULFILLED (FULFILLED only
// after ACCEPTED). Actor fields are plain strings supplied by the route layer.

export type SpecialRequestStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "FULFILLED";
export type SpecialRequestTargetType = "RESERVATION" | "VISIT" | "ORDER";

export const MAX_FREE_TEXT_LENGTH = 500;

export interface SpecialRequest {
  id: string;
  tenantId: string;
  branchId?: string;
  requestType: string;
  targetType: SpecialRequestTargetType;
  targetId: string;
  status: SpecialRequestStatus;
  freeText?: string;
  createdByActor?: string;
  resolvedByActor?: string;
  reasonCode?: string;
  revision: number;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date | null;
}

const allowedTransitions: Record<SpecialRequestStatus, SpecialRequestStatus[]> = {
  PENDING: ["ACCEPTED", "REJECTED"],
  ACCEPTED: ["FULFILLED"],
  REJECTED: [],
  FULFILLED: [],
};

export class InvalidSpecialRequestTransitionError extends Error {
  constructor(from: SpecialRequestStatus, to: SpecialRequestStatus) {
    super(`SpecialRequest cannot transition from ${from} to ${to}`);
    this.name = "InvalidSpecialRequestTransitionError";
  }
}

export function assertSpecialRequestTransition(
  from: SpecialRequestStatus,
  to: SpecialRequestStatus,
): void {
  if (!allowedTransitions[from].includes(to)) {
    throw new InvalidSpecialRequestTransitionError(from, to);
  }
}

export class FreeTextTooLongError extends Error {
  constructor(length: number) {
    super(`Free text length ${length} exceeds the ${MAX_FREE_TEXT_LENGTH} character cap`);
    this.name = "FreeTextTooLongError";
  }
}

// Trim + collapse internal whitespace; reject anything over the cap. Minimal
// sanitization — no HTML/script stripping beyond whitespace normalization,
// documented as sufficient for the plain-text storage model.
export function normalizeFreeText(text: string): string {
  const normalized = text.trim().replace(/\s+/g, " ");
  if (normalized.length > MAX_FREE_TEXT_LENGTH) {
    throw new FreeTextTooLongError(normalized.length);
  }
  return normalized;
}
