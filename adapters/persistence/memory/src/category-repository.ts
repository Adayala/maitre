import type { Category, CategoryRepositoryPort } from "@maitre/catalog";

export class InMemoryCategoryRepository implements CategoryRepositoryPort {
  private readonly byId = new Map<string, Category>();

  async findById(tenantId: string, id: string): Promise<Category | null> {
    const category = this.byId.get(id);
    return category && category.tenantId === tenantId ? category : null;
  }

  async listByMenu(tenantId: string, menuId: string): Promise<Category[]> {
    return [...this.byId.values()].filter(
      (c) => c.tenantId === tenantId && c.menuId === menuId,
    );
  }

  async save(category: Category): Promise<void> {
    this.byId.set(category.id, category);
  }
}
