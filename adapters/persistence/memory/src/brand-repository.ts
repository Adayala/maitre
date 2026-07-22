import type { Brand, BrandRepositoryPort } from "@maitre/organization";

export class InMemoryBrandRepository implements BrandRepositoryPort {
  private readonly byId = new Map<string, Brand>();

  async findById(tenantId: string, id: string): Promise<Brand | null> {
    const brand = this.byId.get(id);
    return brand && brand.tenantId === tenantId ? brand : null;
  }

  async findBySlug(tenantId: string, slug: string): Promise<Brand | null> {
    for (const brand of this.byId.values()) {
      if (brand.tenantId === tenantId && brand.slug === slug) return brand;
    }
    return null;
  }

  async listByTenant(tenantId: string): Promise<Brand[]> {
    return [...this.byId.values()].filter((b) => b.tenantId === tenantId);
  }

  async save(brand: Brand): Promise<void> {
    this.byId.set(brand.id, brand);
  }
}
