import { type CashSession, type CashSessionRepositoryPort, isSessionLive } from "@maitre/cash";

export class InMemoryCashSessionRepository implements CashSessionRepositoryPort {
  private readonly byId = new Map<string, CashSession>();

  async findById(tenantId: string, id: string): Promise<CashSession | null> {
    const s = this.byId.get(id);
    return s && s.tenantId === tenantId ? s : null;
  }

  async findLiveByRegisterAndCurrency(
    tenantId: string,
    cashRegisterId: string,
    currency: string,
  ): Promise<CashSession | null> {
    return (
      [...this.byId.values()].find(
        (s) =>
          s.tenantId === tenantId &&
          s.cashRegisterId === cashRegisterId &&
          s.currency === currency &&
          isSessionLive(s),
      ) ?? null
    );
  }

  async listByRegister(tenantId: string, cashRegisterId: string): Promise<CashSession[]> {
    return [...this.byId.values()].filter(
      (s) => s.tenantId === tenantId && s.cashRegisterId === cashRegisterId,
    );
  }

  async listByBranchAndBusinessDate(
    tenantId: string,
    branchId: string,
    businessDate: string,
    currency: string,
  ): Promise<CashSession[]> {
    return [...this.byId.values()].filter(
      (s) =>
        s.tenantId === tenantId &&
        s.branchId === branchId &&
        s.businessDate === businessDate &&
        s.currency === currency,
    );
  }

  async save(session: CashSession): Promise<void> {
    this.byId.set(session.id, session);
  }
}
