import type { Station, StationRepositoryPort } from "@maitre/kitchen";

export class InMemoryStationRepository implements StationRepositoryPort {
  private readonly byId = new Map<string, Station>();

  async findById(tenantId: string, id: string): Promise<Station | null> {
    const s = this.byId.get(id);
    return s && s.tenantId === tenantId ? s : null;
  }

  async findByCode(tenantId: string, branchId: string, code: string): Promise<Station | null> {
    return (
      [...this.byId.values()].find(
        (s) => s.tenantId === tenantId && s.branchId === branchId && s.code === code,
      ) ?? null
    );
  }

  async listByBranch(tenantId: string, branchId: string): Promise<Station[]> {
    return [...this.byId.values()].filter((s) => s.tenantId === tenantId && s.branchId === branchId);
  }

  async firstActiveByBranch(tenantId: string, branchId: string): Promise<Station | null> {
    return (
      [...this.byId.values()]
        .filter((s) => s.tenantId === tenantId && s.branchId === branchId && s.status === "ACTIVE")
        .sort((a, b) => (a.displayOrder !== b.displayOrder ? a.displayOrder - b.displayOrder : a.code < b.code ? -1 : 1))[0] ??
      null
    );
  }

  async save(station: Station): Promise<void> {
    this.byId.set(station.id, station);
  }
}
