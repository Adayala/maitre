// SPEC-017 — User domain model and invariants.

export type UserStatus = "ACTIVE" | "SUSPENDED" | "DEACTIVATED";

export interface User {
  id: string;
  identityProvider: string;
  externalIdentityId: string;
  displayName: string;
  email?: string | null;
  status: UserStatus;
  createdAt: Date;
  createdBy?: string | null;
  updatedAt: Date;
  updatedBy?: string | null;
  suspendedAt?: Date | null;
  deactivatedAt?: Date | null;
}

const allowedTransitions: Record<UserStatus, UserStatus[]> = {
  ACTIVE: ["SUSPENDED", "DEACTIVATED"],
  SUSPENDED: ["ACTIVE", "DEACTIVATED"],
  DEACTIVATED: [],
};

export class InvalidUserTransitionError extends Error {
  constructor(from: UserStatus, to: UserStatus) {
    super(`User cannot transition from ${from} to ${to}`);
    this.name = "InvalidUserTransitionError";
  }
}

export function canTransitionUser(from: UserStatus, to: UserStatus): boolean {
  return allowedTransitions[from].includes(to);
}

export function isUserEligibleForSession(user: User): boolean {
  return user.status === "ACTIVE";
}

export function externalIdentityKey(provider: string, subject: string): string {
  return `${provider}:${subject}`;
}
