import type { Plaza, PlazaRepositoryPort } from "@maitre/floor";

export class InMemoryPlazaRepository implements PlazaRepositoryPort {
  private readonly byId = new Map<string, Plaza>();

  async findById(tenantId: string, id: string): Promise<Plaza | null> {
    const plaza = this.byId.get(id);
    return plaza?.tenantId === tenantId ? plaza : null;
  }

  async listBySalon(tenantId: string, salonId: string): Promise<Plaza[]> {
    return [...this.byId.values()].filter(
      (plaza) => plaza.tenantId === tenantId && plaza.salonId === salonId,
    );
  }

  async listByServicePeriod(
    tenantId: string,
    servicePeriodId: string,
  ): Promise<Plaza[]> {
    return [...this.byId.values()].filter(
      (plaza) =>
        plaza.tenantId === tenantId &&
        plaza.servicePeriodId === servicePeriodId,
    );
  }

  async findByTableInServicePeriod(
    tenantId: string,
    servicePeriodId: string,
    tableId: string,
  ): Promise<Plaza | null> {
    return (
      [...this.byId.values()].find(
        (plaza) =>
          plaza.tenantId === tenantId &&
          plaza.servicePeriodId === servicePeriodId &&
          plaza.tableIds.includes(tableId),
      ) ?? null
    );
  }

  async save(plaza: Plaza): Promise<void> {
    this.byId.set(plaza.id, plaza);
  }
}
