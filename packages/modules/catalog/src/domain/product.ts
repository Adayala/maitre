// SPEC-039 — Product domain model (simple CRUD; see menu.ts's note).
//
// specification.md says "price: decimal (8,2)" but SPEC-215 §1 mandates
// money in minor units as an integer, never float — priceMinorUnits (e.g.
// cents) follows the later, authoritative transversal contract instead.

export type ProductStatus = "AVAILABLE" | "UNAVAILABLE" | "ARCHIVED";

export interface NutritionalInfo {
  calories?: number;
  protein?: number;
}

export interface Product {
  id: string;
  tenantId: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  priceMinorUnits: number;
  currency: string;
  imageUrl?: string;
  status: ProductStatus;
  allergens: string[];
  nutritional?: NutritionalInfo;
  displayOrder: number;
  createdAt: Date;
  createdBy?: string;
  updatedAt: Date;
  updatedBy?: string;
}

const allowedTransitions: Record<ProductStatus, ProductStatus[]> = {
  AVAILABLE: ["UNAVAILABLE", "ARCHIVED"],
  UNAVAILABLE: ["AVAILABLE", "ARCHIVED"],
  ARCHIVED: [],
};

export class InvalidProductTransitionError extends Error {
  constructor(from: ProductStatus, to: ProductStatus) {
    super(`Product cannot transition from ${from} to ${to}`);
    this.name = "InvalidProductTransitionError";
  }
}

export class InvalidPriceError extends Error {
  constructor(priceMinorUnits: number) {
    super(`Price ${priceMinorUnits} must be a non-negative integer (minor units)`);
    this.name = "InvalidPriceError";
  }
}

export function assertValidPrice(priceMinorUnits: number): void {
  if (!Number.isInteger(priceMinorUnits) || priceMinorUnits < 0) {
    throw new InvalidPriceError(priceMinorUnits);
  }
}

export function canTransitionProduct(from: ProductStatus, to: ProductStatus): boolean {
  return allowedTransitions[from].includes(to);
}

export function transitionProduct(product: Product, to: ProductStatus, now: Date): Product {
  if (!canTransitionProduct(product.status, to)) {
    throw new InvalidProductTransitionError(product.status, to);
  }
  return { ...product, status: to, updatedAt: now };
}
