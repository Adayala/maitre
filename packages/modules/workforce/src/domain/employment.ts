// Workforce employment authority. Authentication does not prove employment.

export type EmploymentStatus = "ACTIVE" | "INACTIVE" | "TERMINATED";
export type EmploymentRelationshipType = "EMPLOYEE" | "CONTRACTOR" | "TEMPORARY";

export interface Employment {
  id: string;
  tenantId: string;
  personRef: string;
  employeeCode: string;
  relationshipType: EmploymentRelationshipType;
  eligibleBranchIds: string[];
  status: EmploymentStatus;
  validFrom: Date;
  validUntil?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export function isEmploymentActiveAt(employment: Employment, at: Date): boolean {
  if (employment.status !== "ACTIVE") return false;
  if (employment.validFrom.getTime() > at.getTime()) return false;
  if (employment.validUntil && employment.validUntil.getTime() < at.getTime()) return false;
  return true;
}

export function isEmploymentEligibleForBranch(employment: Employment, branchId: string): boolean {
  return employment.eligibleBranchIds.includes(branchId);
}
