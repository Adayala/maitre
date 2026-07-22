import type { Table, TableRepositoryPort } from "@maitre/organization";

export class InMemoryTableRepository implements TableRepositoryPort {
  private readonly byId = new Map<string, Table>();

  async findById(tenantId: string, id: string): Promise<Table | null> {
    const table = this.byId.get(id);
    return table && table.tenantId === tenantId ? table : null;
  }

  async findByNumber(
    tenantId: string,
    salonId: string,
    number: string,
  ): Promise<Table | null> {
    for (const table of this.byId.values()) {
      if (
        table.tenantId === tenantId &&
        table.salonId === salonId &&
        table.number === number
      ) {
        return table;
      }
    }
    return null;
  }

  async listBySalon(tenantId: string, salonId: string): Promise<Table[]> {
    return [...this.byId.values()].filter(
      (t) => t.tenantId === tenantId && t.salonId === salonId,
    );
  }

  async save(table: Table): Promise<void> {
    this.byId.set(table.id, table);
  }
}
