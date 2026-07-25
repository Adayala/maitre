import type { CashReconciliation, CashReconciliationRepositoryPort } from "@maitre/cash";

export class InMemoryCashReconciliationRepository implements CashReconciliationRepositoryPort {
  private readonly byId = new Map<string, CashReconciliation>();

  async findById(tenantId: string, id: string): Promise<CashReconciliation | null> {
    const r = this.byId.get(id);
    return r && r.tenantId === tenantId ? r : null;
  }

  async findBySession(tenantId: string, cashSessionId: string): Promise<CashReconciliation | null> {
    return (
      [...this.byId.values()].find(
        (r) => r.tenantId === tenantId && r.cashSessionId === cashSessionId,
      ) ?? null
    );
  }

  async save(reconciliation: CashReconciliation): Promise<void> {
    this.byId.set(reconciliation.id, reconciliation);
  }
}
