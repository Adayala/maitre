import type { Order } from "../domain/order.js";
import type { CapabilityToken } from "../domain/capability-token.js";
import type { KitchenTicket } from "../domain/kitchen-ticket.js";
import type { SpecialRequest } from "../domain/special-request.js";
import type {
  OrderRepositoryPort,
  CapabilityTokenRepositoryPort,
  KitchenTicketRepositoryPort,
  SpecialRequestRepositoryPort,
} from "../application/ports.js";
import type { OutboxPort, OutboxRecord } from "../application/outbox.js";

export class FakeOrderRepository implements OrderRepositoryPort {
  private readonly items: Order[] = [];
  async findById(tenantId: string, id: string) {
    return this.items.find((o) => o.tenantId === tenantId && o.id === id) ?? null;
  }
  async listByVisit(tenantId: string, visitId: string) {
    return this.items.filter((o) => o.tenantId === tenantId && o.visitId === visitId);
  }
  async save(order: Order) {
    const i = this.items.findIndex((o) => o.id === order.id);
    if (i >= 0) this.items[i] = order;
    else this.items.push(order);
  }
}

export class FakeCapabilityTokenRepository implements CapabilityTokenRepositoryPort {
  private readonly items: CapabilityToken[] = [];
  async findById(tenantId: string, id: string) {
    return this.items.find((t) => t.tenantId === tenantId && t.id === id) ?? null;
  }
  async findByHash(tokenHash: string) {
    return this.items.find((t) => t.tokenHash === tokenHash) ?? null;
  }
  async save(token: CapabilityToken) {
    const i = this.items.findIndex((t) => t.id === token.id);
    if (i >= 0) this.items[i] = token;
    else this.items.push(token);
  }
}

export class FakeKitchenTicketRepository implements KitchenTicketRepositoryPort {
  private readonly items: KitchenTicket[] = [];
  async findById(tenantId: string, id: string) {
    return this.items.find((t) => t.tenantId === tenantId && t.id === id) ?? null;
  }
  async findByOrder(tenantId: string, orderId: string) {
    return this.items.find((t) => t.tenantId === tenantId && t.orderId === orderId) ?? null;
  }
  async listByBranch(tenantId: string, branchId: string) {
    return this.items.filter((t) => t.tenantId === tenantId && t.branchId === branchId);
  }
  async save(ticket: KitchenTicket) {
    const i = this.items.findIndex((t) => t.id === ticket.id);
    if (i >= 0) this.items[i] = ticket;
    else this.items.push(ticket);
  }
}

export class FakeSpecialRequestRepository implements SpecialRequestRepositoryPort {
  private readonly items: SpecialRequest[] = [];
  async findById(tenantId: string, id: string) {
    return this.items.find((r) => r.tenantId === tenantId && r.id === id) ?? null;
  }
  async listByTarget(tenantId: string, targetType: string, targetId: string) {
    return this.items.filter(
      (r) => r.tenantId === tenantId && r.targetType === targetType && r.targetId === targetId,
    );
  }
  async save(request: SpecialRequest) {
    const i = this.items.findIndex((r) => r.id === request.id);
    if (i >= 0) this.items[i] = request;
    else this.items.push(request);
  }
}

export class FakeOutboxRepository implements OutboxPort {
  readonly records: OutboxRecord[] = [];
  async append(record: OutboxRecord) {
    this.records.push(record);
  }
}
