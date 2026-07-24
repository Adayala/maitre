// SPEC-068 — WaitlistEntry domain model.
//
// SCOPE NOTE (approved "CRUD simple + invariantes clave" decision): the
// spec's OrderingPolicyVersion with priority bands + anti-starvation aging
// is simplified to plain FIFO by `arrivedAt` plus one manual integer
// `priorityOverride` field (higher sorts first); no bands, no aging
// algorithm, no override audit trail beyond a plain `overrideReason` string.

export type WaitlistEntryStatus = "WAITING" | "NOTIFIED" | "SEATED" | "CANCELLED" | "EXPIRED";

export interface WaitlistEntry {
  id: string;
  tenantId: string;
  branchId: string;
  guestId?: string;
  partySize: number;
  arrivedAt: Date;
  quotedMinutes?: number;
  priorityOverride: number;
  overrideReason?: string;
  status: WaitlistEntryStatus;
  notifiedAt?: Date | null;
  seatedAt?: Date | null;
  visitId?: string;
  cancelReason?: string;
  notes?: string;
  revision: number;
  createdAt: Date;
  updatedAt: Date;
}

const allowedTransitions: Record<WaitlistEntryStatus, WaitlistEntryStatus[]> = {
  WAITING: ["NOTIFIED", "SEATED", "CANCELLED", "EXPIRED"],
  NOTIFIED: ["SEATED", "CANCELLED", "EXPIRED"],
  SEATED: [],
  CANCELLED: [],
  EXPIRED: [],
};

export class InvalidWaitlistTransitionError extends Error {
  constructor(from: WaitlistEntryStatus, to: WaitlistEntryStatus) {
    super(`WaitlistEntry cannot transition from ${from} to ${to}`);
    this.name = "InvalidWaitlistTransitionError";
  }
}

export function assertWaitlistTransition(from: WaitlistEntryStatus, to: WaitlistEntryStatus): void {
  if (!allowedTransitions[from].includes(to)) {
    throw new InvalidWaitlistTransitionError(from, to);
  }
}

// Orders entries: higher priorityOverride first, then earlier arrivedAt,
// then id (stable tiebreaker). Does NOT mutate arrivedAt.
export function compareWaitlistEntries(a: WaitlistEntry, b: WaitlistEntry): number {
  if (a.priorityOverride !== b.priorityOverride) return b.priorityOverride - a.priorityOverride;
  const arrivalDiff = a.arrivedAt.getTime() - b.arrivedAt.getTime();
  if (arrivalDiff !== 0) return arrivalDiff;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

export function sortWaitlistEntries(entries: WaitlistEntry[]): WaitlistEntry[] {
  return [...entries].sort(compareWaitlistEntries);
}
