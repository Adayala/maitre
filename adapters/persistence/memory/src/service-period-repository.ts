import type { ServicePeriod, ServicePeriodRepositoryPort } from "@maitre/floor";

export class InMemoryServicePeriodRepository implements ServicePeriodRepositoryPort {
  private readonly byId = new Map<string, ServicePeriod>();

  async findById(tenantId: string, id: string): Promise<ServicePeriod | null> {
    const period = this.byId.get(id);
    return period && period.tenantId === tenantId ? period : null;
  }

  async listByBranch(tenantId: string, branchId: string): Promise<ServicePeriod[]> {
    return [...this.byId.values()].filter((s) => s.tenantId === tenantId && s.branchId === branchId);
  }

  async findActiveByBranch(tenantId: string, branchId: string): Promise<ServicePeriod | null> {
    return (
      [...this.byId.values()].find(
        (s) =>
          s.tenantId === tenantId &&
          s.branchId === branchId &&
          (s.status === "OPEN" || s.status === "CLOSING"),
      ) ?? null
    );
  }

  async save(period: ServicePeriod): Promise<void> {
    this.byId.set(period.id, period);
  }
}
