import type { DiscountApplication, DiscountApplicationRepositoryPort } from "@maitre/cash";

export class InMemoryDiscountApplicationRepository implements DiscountApplicationRepositoryPort {
  private readonly byId = new Map<string, DiscountApplication>();

  async findById(tenantId: string, id: string): Promise<DiscountApplication | null> {
    const a = this.byId.get(id);
    return a && a.tenantId === tenantId ? a : null;
  }

  async listByTarget(
    tenantId: string,
    targetType: "ORDER" | "CHECK",
    targetId: string,
  ): Promise<DiscountApplication[]> {
    return [...this.byId.values()].filter(
      (a) =>
        a.tenantId === tenantId &&
        (targetType === "ORDER" ? a.orderId === targetId : a.checkId === targetId),
    );
  }

  async save(application: DiscountApplication): Promise<void> {
    this.byId.set(application.id, application);
  }
}
