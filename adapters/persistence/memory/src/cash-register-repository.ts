import type { CashRegister, CashRegisterRepositoryPort } from "@maitre/cash";

export class InMemoryCashRegisterRepository implements CashRegisterRepositoryPort {
  private readonly byId = new Map<string, CashRegister>();

  async findById(tenantId: string, id: string): Promise<CashRegister | null> {
    const r = this.byId.get(id);
    return r && r.tenantId === tenantId ? r : null;
  }

  async findByCode(tenantId: string, branchId: string, code: string): Promise<CashRegister | null> {
    return (
      [...this.byId.values()].find(
        (r) => r.tenantId === tenantId && r.branchId === branchId && r.code === code,
      ) ?? null
    );
  }

  async listByBranch(tenantId: string, branchId: string): Promise<CashRegister[]> {
    return [...this.byId.values()].filter((r) => r.tenantId === tenantId && r.branchId === branchId);
  }

  async save(register: CashRegister): Promise<void> {
    this.byId.set(register.id, register);
  }
}
