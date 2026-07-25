import type { KitchenAlert, KitchenAlertRepositoryPort } from "@maitre/kitchen";

export class InMemoryKitchenAlertRepository implements KitchenAlertRepositoryPort {
  private readonly byId = new Map<string, KitchenAlert>();

  async findById(tenantId: string, id: string): Promise<KitchenAlert | null> {
    const a = this.byId.get(id);
    return a && a.tenantId === tenantId ? a : null;
  }

  // "Duplicate" = any non-RESOLVED activation for the same (command + rule).
  async findOpenByCommandAndRule(
    tenantId: string,
    commandId: string,
    ruleCode: string,
  ): Promise<KitchenAlert | null> {
    return (
      [...this.byId.values()].find(
        (a) =>
          a.tenantId === tenantId &&
          a.commandId === commandId &&
          a.ruleCode === ruleCode &&
          a.status !== "RESOLVED",
      ) ?? null
    );
  }

  async listByBranch(tenantId: string, branchId: string): Promise<KitchenAlert[]> {
    return [...this.byId.values()].filter((a) => a.tenantId === tenantId && a.branchId === branchId);
  }

  async save(alert: KitchenAlert): Promise<void> {
    this.byId.set(alert.id, alert);
  }
}
