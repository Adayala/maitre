import type { Menu, MenuRepositoryPort } from "@maitre/catalog";

export class InMemoryMenuRepository implements MenuRepositoryPort {
  private readonly byId = new Map<string, Menu>();

  async findById(tenantId: string, id: string): Promise<Menu | null> {
    const menu = this.byId.get(id);
    return menu && menu.tenantId === tenantId ? menu : null;
  }

  async findBySlug(tenantId: string, brandId: string, slug: string): Promise<Menu | null> {
    for (const menu of this.byId.values()) {
      if (menu.tenantId === tenantId && menu.brandId === brandId && menu.slug === slug) {
        return menu;
      }
    }
    return null;
  }

  async listByBrand(tenantId: string, brandId: string): Promise<Menu[]> {
    return [...this.byId.values()].filter(
      (m) => m.tenantId === tenantId && m.brandId === brandId,
    );
  }

  async save(menu: Menu): Promise<void> {
    this.byId.set(menu.id, menu);
  }
}
