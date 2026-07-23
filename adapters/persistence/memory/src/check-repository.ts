import type { Check, CheckRepositoryPort } from "@maitre/floor";

export class InMemoryCheckRepository implements CheckRepositoryPort {
  private readonly byId = new Map<string, Check>();

  async findById(tenantId: string, id: string): Promise<Check | null> {
    const check = this.byId.get(id);
    return check && check.tenantId === tenantId ? check : null;
  }

  async findByVisit(tenantId: string, visitId: string): Promise<Check | null> {
    return (
      [...this.byId.values()].find((c) => c.tenantId === tenantId && c.visitId === visitId) ?? null
    );
  }

  async save(check: Check): Promise<void> {
    this.byId.set(check.id, check);
  }
}
