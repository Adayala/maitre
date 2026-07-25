import type { Command, CommandRepositoryPort } from "@maitre/kitchen";
import { NON_TERMINAL_STATUSES } from "@maitre/kitchen";

export class InMemoryCommandRepository implements CommandRepositoryPort {
  private readonly byId = new Map<string, Command>();

  async findById(tenantId: string, id: string): Promise<Command | null> {
    const c = this.byId.get(id);
    return c && c.tenantId === tenantId ? c : null;
  }

  async listByStation(tenantId: string, stationId: string): Promise<Command[]> {
    return [...this.byId.values()].filter((c) => c.tenantId === tenantId && c.stationId === stationId);
  }

  async listByOrder(tenantId: string, orderId: string): Promise<Command[]> {
    return [...this.byId.values()].filter((c) => c.tenantId === tenantId && c.orderId === orderId);
  }

  async listByBranch(tenantId: string, branchId: string): Promise<Command[]> {
    return [...this.byId.values()].filter((c) => c.tenantId === tenantId && c.branchId === branchId);
  }

  async countNonTerminalByStation(tenantId: string, stationId: string): Promise<number> {
    return [...this.byId.values()].filter(
      (c) => c.tenantId === tenantId && c.stationId === stationId && NON_TERMINAL_STATUSES.includes(c.status),
    ).length;
  }

  async save(command: Command): Promise<void> {
    this.byId.set(command.id, command);
  }
}
