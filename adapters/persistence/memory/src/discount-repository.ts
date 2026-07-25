import type { Discount, DiscountRepositoryPort } from "@maitre/cash";

export class InMemoryDiscountRepository implements DiscountRepositoryPort {
  private readonly byId = new Map<string, Discount>();

  async findById(tenantId: string, id: string): Promise<Discount | null> {
    const d = this.byId.get(id);
    return d && d.tenantId === tenantId ? d : null;
  }

  async listByTenant(tenantId: string): Promise<Discount[]> {
    return [...this.byId.values()].filter((d) => d.tenantId === tenantId);
  }

  async save(discount: Discount): Promise<void> {
    this.byId.set(discount.id, discount);
  }
}
