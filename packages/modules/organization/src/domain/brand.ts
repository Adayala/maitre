// SPEC-002 — Brand domain model and invariants.

export type BrandStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export interface BrandConfig {
  cancellationPolicy?: string;
  brandVoice?: string;
  allergenPolicy?: string;
  language: string;
  currency: string;
}

export interface Brand {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description?: string;
  status: BrandStatus;
  logoUrl?: string;
  website?: string;
  defaultMenuId?: string;
  config: BrandConfig;
  createdAt: Date;
  createdBy?: string;
  updatedAt: Date;
  updatedBy?: string;
  archivedAt?: Date | null;
  archivedBy?: string | null;
}

const allowedTransitions: Record<BrandStatus, BrandStatus[]> = {
  ACTIVE: ["INACTIVE", "ARCHIVED"],
  INACTIVE: ["ACTIVE", "ARCHIVED"],
  ARCHIVED: [],
};

export class InvalidBrandTransitionError extends Error {
  constructor(from: BrandStatus, to: BrandStatus) {
    super(`Brand cannot transition from ${from} to ${to}`);
    this.name = "InvalidBrandTransitionError";
  }
}

export function canTransitionBrand(from: BrandStatus, to: BrandStatus): boolean {
  return allowedTransitions[from].includes(to);
}

export function transitionBrand(brand: Brand, to: BrandStatus, now: Date): Brand {
  if (!canTransitionBrand(brand.status, to)) {
    throw new InvalidBrandTransitionError(brand.status, to);
  }
  const archived = to === "ARCHIVED";
  return {
    ...brand,
    status: to,
    updatedAt: now,
    archivedAt: archived ? now : (brand.archivedAt ?? null),
  };
}

// SPEC-002 §Reglas 5 — ARCHIVED is read-only; no new branches, no config changes.
export function canCreateBranchUnderBrand(brand: Brand): boolean {
  return brand.status === "ACTIVE";
}

export function canModifyBrandConfig(brand: Brand): boolean {
  return brand.status !== "ARCHIVED";
}

const combiningDiacriticalMarks = /[̀-ͯ]/g;

export function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(combiningDiacriticalMarks, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
