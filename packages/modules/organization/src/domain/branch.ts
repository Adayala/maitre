// SPEC-004 — Branch domain model and invariants.

export type BranchStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  subdivision?: string;
  postalCode?: string;
  countryCode: string;
}

export interface Branch {
  id: string;
  tenantId: string;
  brandId: string;
  fiscalEntityId?: string;
  code: string;
  name: string;
  timezone: string;
  status: BranchStatus;
  address?: Address;
  contactEmail?: string;
  contactPhone?: string;
  createdAt: Date;
  createdBy?: string;
  updatedAt: Date;
  updatedBy?: string;
}

const branchCodePattern = /^[A-Z0-9][A-Z0-9_-]{0,31}$/;

const allowedTransitions: Record<BranchStatus, BranchStatus[]> = {
  ACTIVE: ["INACTIVE", "ARCHIVED"],
  INACTIVE: ["ACTIVE", "ARCHIVED"],
  ARCHIVED: [],
};

export class InvalidBranchTransitionError extends Error {
  constructor(from: BranchStatus, to: BranchStatus) {
    super(`Branch cannot transition from ${from} to ${to}`);
    this.name = "InvalidBranchTransitionError";
  }
}

export class InvalidBranchCodeError extends Error {
  constructor(code: string) {
    super(`Branch code "${code}" does not match required pattern`);
    this.name = "InvalidBranchCodeError";
  }
}

export function normalizeBranchCode(code: string): string {
  const normalized = code.trim().toUpperCase();
  if (!branchCodePattern.test(normalized)) {
    throw new InvalidBranchCodeError(code);
  }
  return normalized;
}

export function canTransitionBranch(from: BranchStatus, to: BranchStatus): boolean {
  return allowedTransitions[from].includes(to);
}

export function transitionBranch(branch: Branch, to: BranchStatus, now: Date): Branch {
  if (!canTransitionBranch(branch.status, to)) {
    throw new InvalidBranchTransitionError(branch.status, to);
  }
  return { ...branch, status: to, updatedAt: now };
}

export function isBranchOperable(branch: Branch): boolean {
  return branch.status === "ACTIVE";
}
