import { randomUUID } from "node:crypto";
import { slugify } from "../domain/menu.js";
import type { Category } from "../domain/category.js";
import type { MenuRepositoryPort, CategoryRepositoryPort } from "./ports.js";

export class UnknownMenuError extends Error {
  constructor(menuId: string) {
    super(`Menu ${menuId} does not exist for this tenant`);
    this.name = "UnknownMenuError";
  }
}

export interface CreateCategoryInput {
  tenantId: string;
  menuId: string;
  name: string;
  description?: string;
  displayOrder?: number;
  actorId?: string;
  id?: string;
}

export interface CreateCategoryDeps {
  menus: MenuRepositoryPort;
  categories: CategoryRepositoryPort;
  now?: () => Date;
}

export async function createCategory(
  deps: CreateCategoryDeps,
  input: CreateCategoryInput,
): Promise<Category> {
  const menu = await deps.menus.findById(input.tenantId, input.menuId);
  if (!menu) throw new UnknownMenuError(input.menuId);

  const now = (deps.now ?? (() => new Date()))();
  const category: Category = {
    id: input.id ?? randomUUID(),
    tenantId: input.tenantId,
    brandId: menu.brandId,
    menuId: input.menuId,
    name: input.name,
    slug: slugify(input.name),
    displayOrder: input.displayOrder ?? 0,
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.actorId !== undefined
      ? { createdBy: input.actorId, updatedBy: input.actorId }
      : {}),
  };

  await deps.categories.save(category);
  return category;
}
