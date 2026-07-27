import type {
  FiscalPointOfSale,
  FiscalEnvironment,
  FiscalPointOfSaleRepositoryPort,
} from "@maitre/fiscal";

export class InMemoryFiscalPointOfSaleRepository implements FiscalPointOfSaleRepositoryPort {
  private readonly byId = new Map<string, FiscalPointOfSale>();

  async findById(tenantId: string, id: string): Promise<FiscalPointOfSale | null> {
    const pos = this.byId.get(id);
    return pos && pos.tenantId === tenantId ? pos : null;
  }

  async findByIdentity(
    tenantId: string,
    fiscalEntityId: string,
    environment: FiscalEnvironment,
    officialCode: string,
  ): Promise<FiscalPointOfSale | null> {
    return (
      [...this.byId.values()].find(
        (p) =>
          p.tenantId === tenantId &&
          p.fiscalEntityId === fiscalEntityId &&
          p.environment === environment &&
          p.officialCode === officialCode,
      ) ?? null
    );
  }

  async listByFiscalEntity(tenantId: string, fiscalEntityId: string): Promise<FiscalPointOfSale[]> {
    return [...this.byId.values()].filter((p) => p.tenantId === tenantId && p.fiscalEntityId === fiscalEntityId);
  }

  async save(pos: FiscalPointOfSale): Promise<void> {
    this.byId.set(pos.id, pos);
  }
}
