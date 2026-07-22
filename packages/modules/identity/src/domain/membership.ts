// SPEC-020 — Membership domain model and invariants.

export type MembershipStatus = "INVITED" | "ACTIVE" | "SUSPENDED" | "REVOKED";
export type BranchScopeType = "ALL_BRANCHES" | "SELECTED_BRANCHES";

export interface Membership {
  id: string;
  tenantId: string;
  userId: string;
  status: MembershipStatus;
  branchScopeType: BranchScopeType;
  roleIds: string[];
  branchIds: string[];
  invitedAt?: Date | null;
  activatedAt?: Date | null;
  suspendedAt?: Date | null;
  revokedAt?: Date | null;
  createdAt: Date;
  createdBy?: string | null;
  updatedAt: Date;
  updatedBy?: string | null;
}

const allowedTransitions: Record<MembershipStatus, MembershipStatus[]> = {
  INVITED: ["ACTIVE", "REVOKED"],
  ACTIVE: ["SUSPENDED", "REVOKED"],
  SUSPENDED: ["ACTIVE", "REVOKED"],
  REVOKED: [],
};

export class InvalidMembershipTransitionError extends Error {
  constructor(from: MembershipStatus, to: MembershipStatus) {
    super(`Membership cannot transition from ${from} to ${to}`);
    this.name = "InvalidMembershipTransitionError";
  }
}

export class MembershipInvariantError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MembershipInvariantError";
  }
}

export function canTransitionMembership(
  from: MembershipStatus,
  to: MembershipStatus,
): boolean {
  return allowedTransitions[from].includes(to);
}

export function assertMembershipInvariants(membership: Membership): void {
  if (
    membership.branchScopeType === "SELECTED_BRANCHES" &&
    membership.branchIds.length === 0
  ) {
    throw new MembershipInvariantError(
      "SELECTED_BRANCHES requires at least one branch id",
    );
  }
  if (membership.status === "ACTIVE" && membership.roleIds.length === 0) {
    throw new MembershipInvariantError("ACTIVE membership requires at least one role");
  }
}

export function isMembershipActive(membership: Membership): boolean {
  return membership.status === "ACTIVE";
}

export function branchInScope(membership: Membership, branchId: string): boolean {
  if (membership.branchScopeType === "ALL_BRANCHES") return true;
  return membership.branchIds.includes(branchId);
}
