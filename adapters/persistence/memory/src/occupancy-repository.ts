import type { Occupancy, OccupancyRepositoryPort } from "@maitre/floor";

export class InMemoryOccupancyRepository implements OccupancyRepositoryPort {
  private readonly byId = new Map<string, Occupancy>();

  async findById(tenantId: string, id: string): Promise<Occupancy | null> {
    const occ = this.byId.get(id);
    return occ && occ.tenantId === tenantId ? occ : null;
  }

  async listByVisit(tenantId: string, visitId: string): Promise<Occupancy[]> {
    return [...this.byId.values()].filter((o) => o.tenantId === tenantId && o.visitId === visitId);
  }

  async listByTable(tenantId: string, tableId: string): Promise<Occupancy[]> {
    return [...this.byId.values()].filter((o) => o.tenantId === tenantId && o.tableId === tableId);
  }

  async findActiveByTable(tenantId: string, tableId: string): Promise<Occupancy | null> {
    return (
      [...this.byId.values()].find(
        (o) => o.tenantId === tenantId && o.tableId === tableId && o.status === "ACTIVE",
      ) ?? null
    );
  }

  async save(occupancy: Occupancy): Promise<void> {
    this.byId.set(occupancy.id, occupancy);
  }
}
