import type { Menu } from "../domain/menu.js";
import type { Category } from "../domain/category.js";
import type { Product } from "../domain/product.js";

export interface MenuRepositoryPort {
  findById(tenantId: string, id: string): Promise<Menu | null>;
  findBySlug(tenantId: string, brandId: string, slug: string): Promise<Menu | null>;
  listByBrand(tenantId: string, brandId: string): Promise<Menu[]>;
  save(menu: Menu): Promise<void>;
}

export interface CategoryRepositoryPort {
  findById(tenantId: string, id: string): Promise<Category | null>;
  listByMenu(tenantId: string, menuId: string): Promise<Category[]>;
  save(category: Category): Promise<void>;
}

export interface ProductRepositoryPort {
  findById(tenantId: string, id: string): Promise<Product | null>;
  listByCategory(tenantId: string, categoryId: string): Promise<Product[]>;
  save(product: Product): Promise<void>;
}
