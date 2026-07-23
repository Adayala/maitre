import { randomUUID } from "node:crypto";
import { slugify, type Menu } from "../domain/menu.js";
import type { MenuRepositoryPort } from "./ports.js";

export class DuplicateMenuSlugError extends Error {
  constructor(slug: string, brandId: string) {
    super(`Menu slug "${slug}" already exists for brand ${brandId}`);
    this.name = "DuplicateMenuSlugError";
  }
}

export interface CreateMenuInput {
  tenantId: string;
  brandId: string;
  name: string;
  description?: string;
  isDefault?: boolean;
  displayOrder?: number;
  actorId?: string;
  id?: string;
}

export interface CreateMenuDeps {
  menus: MenuRepositoryPort;
  now?: () => Date;
}

export async function createMenu(deps: CreateMenuDeps, input: CreateMenuInput): Promise<Menu> {
  const slug = slugify(input.name);
  const existing = await deps.menus.findBySlug(input.tenantId, input.brandId, slug);
  if (existing) throw new DuplicateMenuSlugError(slug, input.brandId);

  const now = (deps.now ?? (() => new Date()))();
  const menu: Menu = {
    id: input.id ?? randomUUID(),
    tenantId: input.tenantId,
    brandId: input.brandId,
    name: input.name,
    slug,
    status: "ACTIVE",
    isDefault: input.isDefault ?? false,
    displayOrder: input.displayOrder ?? 0,
    createdAt: now,
    updatedAt: now,
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.actorId !== undefined
      ? { createdBy: input.actorId, updatedBy: input.actorId }
      : {}),
  };

  await deps.menus.save(menu);
  return menu;
}
