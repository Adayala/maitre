// SPEC-038 — Category domain model (simple CRUD; see menu.ts's note on
// the deferred versioned/snapshot model from contract.md).

export type CategoryStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export interface Category {
  id: string;
  tenantId: string;
  brandId: string;
  menuId: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  status: CategoryStatus;
  createdAt: Date;
  createdBy?: string;
  updatedAt: Date;
  updatedBy?: string;
}

const allowedTransitions: Record<CategoryStatus, CategoryStatus[]> = {
  ACTIVE: ["INACTIVE", "ARCHIVED"],
  INACTIVE: ["ACTIVE", "ARCHIVED"],
  ARCHIVED: [],
};

export class InvalidCategoryTransitionError extends Error {
  constructor(from: CategoryStatus, to: CategoryStatus) {
    super(`Category cannot transition from ${from} to ${to}`);
    this.name = "InvalidCategoryTransitionError";
  }
}

export function canTransitionCategory(from: CategoryStatus, to: CategoryStatus): boolean {
  return allowedTransitions[from].includes(to);
}

export function transitionCategory(category: Category, to: CategoryStatus, now: Date): Category {
  if (!canTransitionCategory(category.status, to)) {
    throw new InvalidCategoryTransitionError(category.status, to);
  }
  return { ...category, status: to, updatedAt: now };
}
