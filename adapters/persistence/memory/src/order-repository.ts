import type { Order, OrderRepositoryPort } from "@maitre/ordering";

export class InMemoryOrderRepository implements OrderRepositoryPort {
  private readonly byId = new Map<string, Order>();

  async findById(tenantId: string, id: string): Promise<Order | null> {
    const order = this.byId.get(id);
    return order && order.tenantId === tenantId ? order : null;
  }

  async listByVisit(tenantId: string, visitId: string): Promise<Order[]> {
    return [...this.byId.values()].filter((o) => o.tenantId === tenantId && o.visitId === visitId);
  }

  async save(order: Order): Promise<void> {
    this.byId.set(order.id, order);
  }
}
