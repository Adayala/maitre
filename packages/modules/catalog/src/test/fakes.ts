import type { Menu } from "../domain/menu.js";
import type { Category } from "../domain/category.js";
import type { Product } from "../domain/product.js";
import type {
  MenuRepositoryPort,
  CategoryRepositoryPort,
  ProductRepositoryPort,
} from "../application/ports.js";

export class FakeMenuRepository implements MenuRepositoryPort {
  private readonly items: Menu[] = [];
  constructor(seed: Menu[] = []) {
    this.items = [...seed];
  }
  async findById(tenantId: string, id: string) {
    return this.items.find((m) => m.tenantId === tenantId && m.id === id) ?? null;
  }
  async findBySlug(tenantId: string, brandId: string, slug: string) {
    return (
      this.items.find(
        (m) => m.tenantId === tenantId && m.brandId === brandId && m.slug === slug,
      ) ?? null
    );
  }
  async listByBrand(tenantId: string, brandId: string) {
    return this.items.filter((m) => m.tenantId === tenantId && m.brandId === brandId);
  }
  async save(menu: Menu) {
    const i = this.items.findIndex((m) => m.id === menu.id);
    if (i >= 0) this.items[i] = menu;
    else this.items.push(menu);
  }
}

export class FakeCategoryRepository implements CategoryRepositoryPort {
  private readonly items: Category[] = [];
  constructor(seed: Category[] = []) {
    this.items = [...seed];
  }
  async findById(tenantId: string, id: string) {
    return this.items.find((c) => c.tenantId === tenantId && c.id === id) ?? null;
  }
  async listByMenu(tenantId: string, menuId: string) {
    return this.items.filter((c) => c.tenantId === tenantId && c.menuId === menuId);
  }
  async save(category: Category) {
    const i = this.items.findIndex((c) => c.id === category.id);
    if (i >= 0) this.items[i] = category;
    else this.items.push(category);
  }
}

export class FakeProductRepository implements ProductRepositoryPort {
  private readonly items: Product[] = [];
  constructor(seed: Product[] = []) {
    this.items = [...seed];
  }
  async findById(tenantId: string, id: string) {
    return this.items.find((p) => p.tenantId === tenantId && p.id === id) ?? null;
  }
  async listByCategory(tenantId: string, categoryId: string) {
    return this.items.filter((p) => p.tenantId === tenantId && p.categoryId === categoryId);
  }
  async save(product: Product) {
    const i = this.items.findIndex((p) => p.id === product.id);
    if (i >= 0) this.items[i] = product;
    else this.items.push(product);
  }
}

export function aMenu(overrides: Partial<Menu> = {}): Menu {
  const now = new Date("2026-01-01T00:00:00Z");
  return {
    id: "11111111-1111-1111-1111-111111111111",
    tenantId: "22222222-2222-2222-2222-222222222222",
    brandId: "33333333-3333-3333-3333-333333333333",
    name: "Main Menu",
    slug: "main-menu",
    status: "ACTIVE",
    isDefault: true,
    displayOrder: 0,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function aCategory(overrides: Partial<Category> = {}): Category {
  const now = new Date("2026-01-01T00:00:00Z");
  return {
    id: "44444444-4444-4444-4444-444444444444",
    tenantId: "22222222-2222-2222-2222-222222222222",
    brandId: "33333333-3333-3333-3333-333333333333",
    menuId: "11111111-1111-1111-1111-111111111111",
    name: "Starters",
    slug: "starters",
    displayOrder: 0,
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}
