// SPEC-037 — Menu domain model.
//
// NOTE: contract.md for this spec describes a versioned Menu with
// DRAFT/PUBLISHED/ARCHIVED revisions and immutable snapshots. That model
// conflicts with specification.md (simple ACTIVE/INACTIVE/ARCHIVED CRUD)
// and with SPEC-040's plain POST/GET/PATCH API. This implementation
// follows the simpler CRUD model — the versioned/snapshot model is a
// deliberately deferred gap, not an oversight.

export type MenuStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export interface Menu {
  id: string;
  tenantId: string;
  brandId: string;
  name: string;
  slug: string;
  description?: string;
  status: MenuStatus;
  isDefault: boolean;
  displayOrder: number;
  createdAt: Date;
  createdBy?: string;
  updatedAt: Date;
  updatedBy?: string;
}

const allowedTransitions: Record<MenuStatus, MenuStatus[]> = {
  ACTIVE: ["INACTIVE", "ARCHIVED"],
  INACTIVE: ["ACTIVE", "ARCHIVED"],
  ARCHIVED: [],
};

export class InvalidMenuTransitionError extends Error {
  constructor(from: MenuStatus, to: MenuStatus) {
    super(`Menu cannot transition from ${from} to ${to}`);
    this.name = "InvalidMenuTransitionError";
  }
}

export function canTransitionMenu(from: MenuStatus, to: MenuStatus): boolean {
  return allowedTransitions[from].includes(to);
}

export function transitionMenu(menu: Menu, to: MenuStatus, now: Date): Menu {
  if (!canTransitionMenu(menu.status, to)) {
    throw new InvalidMenuTransitionError(menu.status, to);
  }
  return { ...menu, status: to, updatedAt: now };
}

export function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
