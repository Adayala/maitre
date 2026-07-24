import type { KitchenTicket, KitchenTicketRepositoryPort } from "@maitre/ordering";

export class InMemoryKitchenTicketRepository implements KitchenTicketRepositoryPort {
  private readonly byId = new Map<string, KitchenTicket>();

  async findById(tenantId: string, id: string): Promise<KitchenTicket | null> {
    const ticket = this.byId.get(id);
    return ticket && ticket.tenantId === tenantId ? ticket : null;
  }

  async findByOrder(tenantId: string, orderId: string): Promise<KitchenTicket | null> {
    return (
      [...this.byId.values()].find((t) => t.tenantId === tenantId && t.orderId === orderId) ?? null
    );
  }

  async listByBranch(tenantId: string, branchId: string): Promise<KitchenTicket[]> {
    return [...this.byId.values()].filter((t) => t.tenantId === tenantId && t.branchId === branchId);
  }

  async save(ticket: KitchenTicket): Promise<void> {
    this.byId.set(ticket.id, ticket);
  }
}
