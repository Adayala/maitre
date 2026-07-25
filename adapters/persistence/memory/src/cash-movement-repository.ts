import type { CashMovement, CashMovementRepositoryPort } from "@maitre/cash";

export class InMemoryCashMovementRepository implements CashMovementRepositoryPort {
  private readonly byId = new Map<string, CashMovement>();

  async findById(tenantId: string, id: string): Promise<CashMovement | null> {
    const m = this.byId.get(id);
    return m && m.tenantId === tenantId ? m : null;
  }

  async listBySession(tenantId: string, cashSessionId: string): Promise<CashMovement[]> {
    return [...this.byId.values()].filter(
      (m) => m.tenantId === tenantId && m.cashSessionId === cashSessionId,
    );
  }

  async findByRegisterAndSourceReference(
    tenantId: string,
    cashRegisterId: string,
    sourceReference: string,
  ): Promise<CashMovement | null> {
    return (
      [...this.byId.values()].find(
        (m) =>
          m.tenantId === tenantId &&
          m.cashRegisterId === cashRegisterId &&
          m.sourceReference === sourceReference,
      ) ?? null
    );
  }

  async listByBranchAndSessions(tenantId: string, cashSessionIds: string[]): Promise<CashMovement[]> {
    const set = new Set(cashSessionIds);
    return [...this.byId.values()].filter((m) => m.tenantId === tenantId && set.has(m.cashSessionId));
  }

  async save(movement: CashMovement): Promise<void> {
    this.byId.set(movement.id, movement);
  }
}
