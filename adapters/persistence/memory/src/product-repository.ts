import type { Product, ProductRepositoryPort } from "@maitre/catalog";

export class InMemoryProductRepository implements ProductRepositoryPort {
  private readonly byId = new Map<string, Product>();

  async findById(tenantId: string, id: string): Promise<Product | null> {
    const product = this.byId.get(id);
    return product && product.tenantId === tenantId ? product : null;
  }

  async listByCategory(tenantId: string, categoryId: string): Promise<Product[]> {
    return [...this.byId.values()].filter(
      (p) => p.tenantId === tenantId && p.categoryId === categoryId,
    );
  }

  async save(product: Product): Promise<void> {
    this.byId.set(product.id, product);
  }
}
