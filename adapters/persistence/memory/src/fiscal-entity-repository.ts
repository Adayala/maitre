import type { FiscalEntity, FiscalEntityRepositoryPort } from "@maitre/organization";

export class InMemoryFiscalEntityRepository implements FiscalEntityRepositoryPort {
  private readonly byId = new Map<string, FiscalEntity>();

  async findById(tenantId: string, id: string): Promise<FiscalEntity | null> {
    const entity = this.byId.get(id);
    return entity && entity.tenantId === tenantId ? entity : null;
  }

  async findByCuit(tenantId: string, cuit: string): Promise<FiscalEntity | null> {
    for (const entity of this.byId.values()) {
      if (entity.tenantId === tenantId && entity.cuit === cuit) return entity;
    }
    return null;
  }

  async findByCreateIdempotencyKey(
    tenantId: string,
    idempotencyKey: string,
  ): Promise<FiscalEntity | null> {
    for (const entity of this.byId.values()) {
      if (entity.tenantId === tenantId && entity.createIdempotencyKey === idempotencyKey) {
        return entity;
      }
    }
    return null;
  }

  async listByTenant(tenantId: string): Promise<FiscalEntity[]> {
    return [...this.byId.values()].filter((e) => e.tenantId === tenantId);
  }

  async save(entity: FiscalEntity): Promise<void> {
    this.byId.set(entity.id, entity);
  }
}
