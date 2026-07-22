// SPEC-005 — Salon domain model.

export type SalonStatus = "ACTIVE" | "INACTIVE";

export interface Salon {
  id: string;
  tenantId: string;
  branchId: string;
  name: string;
  capacity: number;
  description?: string;
  status: SalonStatus;
  createdAt: Date;
  createdBy?: string;
  updatedAt: Date;
  updatedBy?: string;
}

export function isSalonOperable(salon: Salon): boolean {
  return salon.status === "ACTIVE";
}
