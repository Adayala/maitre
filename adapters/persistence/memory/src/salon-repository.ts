import type { Salon, SalonRepositoryPort } from "@maitre/organization";

export class InMemorySalonRepository implements SalonRepositoryPort {
  private readonly byId = new Map<string, Salon>();

  async findById(tenantId: string, id: string): Promise<Salon | null> {
    const salon = this.byId.get(id);
    return salon && salon.tenantId === tenantId ? salon : null;
  }

  async listByBranch(tenantId: string, branchId: string): Promise<Salon[]> {
    return [...this.byId.values()].filter(
      (s) => s.tenantId === tenantId && s.branchId === branchId,
    );
  }

  async save(salon: Salon): Promise<void> {
    this.byId.set(salon.id, salon);
  }
}
