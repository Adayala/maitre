import { randomUUID } from "node:crypto";
import { slugify } from "../domain/menu.js";
import { assertValidPrice, type Product, type NutritionalInfo } from "../domain/product.js";
import type { CategoryRepositoryPort, ProductRepositoryPort } from "./ports.js";

export class UnknownCategoryError extends Error {
  constructor(categoryId: string) {
    super(`Category ${categoryId} does not exist for this tenant`);
    this.name = "UnknownCategoryError";
  }
}

export interface CreateProductInput {
  tenantId: string;
  categoryId: string;
  name: string;
  description?: string;
  priceMinorUnits: number;
  currency: string;
  imageUrl?: string;
  allergens?: string[];
  nutritional?: NutritionalInfo;
  displayOrder?: number;
  actorId?: string;
  id?: string;
}

export interface CreateProductDeps {
  categories: CategoryRepositoryPort;
  products: ProductRepositoryPort;
  now?: () => Date;
}

export async function createProduct(
  deps: CreateProductDeps,
  input: CreateProductInput,
): Promise<Product> {
  const category = await deps.categories.findById(input.tenantId, input.categoryId);
  if (!category) throw new UnknownCategoryError(input.categoryId);

  assertValidPrice(input.priceMinorUnits);

  const now = (deps.now ?? (() => new Date()))();
  const product: Product = {
    id: input.id ?? randomUUID(),
    tenantId: input.tenantId,
    categoryId: input.categoryId,
    name: input.name,
    slug: slugify(input.name),
    priceMinorUnits: input.priceMinorUnits,
    currency: input.currency,
    status: "AVAILABLE",
    allergens: input.allergens ?? [],
    displayOrder: input.displayOrder ?? 0,
    createdAt: now,
    updatedAt: now,
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
    ...(input.nutritional !== undefined ? { nutritional: input.nutritional } : {}),
    ...(input.actorId !== undefined
      ? { createdBy: input.actorId, updatedBy: input.actorId }
      : {}),
  };

  await deps.products.save(product);
  return product;
}
