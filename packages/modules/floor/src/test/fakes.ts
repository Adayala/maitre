import type { Visit } from "../domain/visit.js";
import type { Occupancy } from "../domain/occupancy.js";
import type { Check } from "../domain/check.js";
import type { Payment } from "../domain/payment.js";
import type { ServicePeriod } from "../domain/service-period.js";
import type {
  VisitRepositoryPort,
  OccupancyRepositoryPort,
  CheckRepositoryPort,
  PaymentRepositoryPort,
  ServicePeriodRepositoryPort,
} from "../application/ports.js";
import type { OutboxPort, OutboxRecord } from "../application/outbox.js";

export class FakeVisitRepository implements VisitRepositoryPort {
  private readonly items: Visit[] = [];
  async findById(tenantId: string, id: string) {
    return this.items.find((v) => v.tenantId === tenantId && v.id === id) ?? null;
  }
  async listByBranch(tenantId: string, branchId: string) {
    return this.items.filter((v) => v.tenantId === tenantId && v.branchId === branchId);
  }
  async save(visit: Visit) {
    const i = this.items.findIndex((v) => v.id === visit.id);
    if (i >= 0) this.items[i] = visit;
    else this.items.push(visit);
  }
}

export class FakeOccupancyRepository implements OccupancyRepositoryPort {
  private readonly items: Occupancy[] = [];
  async findById(tenantId: string, id: string) {
    return this.items.find((o) => o.tenantId === tenantId && o.id === id) ?? null;
  }
  async listByVisit(tenantId: string, visitId: string) {
    return this.items.filter((o) => o.tenantId === tenantId && o.visitId === visitId);
  }
  async listByTable(tenantId: string, tableId: string) {
    return this.items.filter((o) => o.tenantId === tenantId && o.tableId === tableId);
  }
  async findActiveByTable(tenantId: string, tableId: string) {
    return (
      this.items.find(
        (o) => o.tenantId === tenantId && o.tableId === tableId && o.status === "ACTIVE",
      ) ?? null
    );
  }
  async save(occupancy: Occupancy) {
    const i = this.items.findIndex((o) => o.id === occupancy.id);
    if (i >= 0) this.items[i] = occupancy;
    else this.items.push(occupancy);
  }
}

export class FakeCheckRepository implements CheckRepositoryPort {
  private readonly items: Check[] = [];
  async findById(tenantId: string, id: string) {
    return this.items.find((c) => c.tenantId === tenantId && c.id === id) ?? null;
  }
  async findByVisit(tenantId: string, visitId: string) {
    return this.items.find((c) => c.tenantId === tenantId && c.visitId === visitId) ?? null;
  }
  async listByBranch(tenantId: string, branchId: string) {
    return this.items
      .filter((c) => c.tenantId === tenantId && c.branchId === branchId)
      .sort((left, right) => right.updatedAt.getTime() - left.updatedAt.getTime());
  }
  async save(check: Check) {
    const i = this.items.findIndex((c) => c.id === check.id);
    if (i >= 0) this.items[i] = check;
    else this.items.push(check);
  }
}

export class FakePaymentRepository implements PaymentRepositoryPort {
  private readonly items: Payment[] = [];
  async findById(tenantId: string, id: string) {
    return this.items.find((p) => p.tenantId === tenantId && p.id === id) ?? null;
  }
  async findByIdempotencyKey(tenantId: string, idempotencyKey: string) {
    return (
      this.items.find((p) => p.tenantId === tenantId && p.idempotencyKey === idempotencyKey) ??
      null
    );
  }
  async listByCheck(tenantId: string, checkId: string) {
    return this.items.filter((p) => p.tenantId === tenantId && p.checkId === checkId);
  }
  async save(payment: Payment) {
    const i = this.items.findIndex((p) => p.id === payment.id);
    if (i >= 0) this.items[i] = payment;
    else this.items.push(payment);
  }
}

export class FakeServicePeriodRepository implements ServicePeriodRepositoryPort {
  private readonly items: ServicePeriod[] = [];
  async findById(tenantId: string, id: string) {
    return this.items.find((s) => s.tenantId === tenantId && s.id === id) ?? null;
  }
  async listByBranch(tenantId: string, branchId: string) {
    return this.items.filter((s) => s.tenantId === tenantId && s.branchId === branchId);
  }
  async findActiveByBranch(tenantId: string, branchId: string) {
    return (
      this.items.find(
        (s) =>
          s.tenantId === tenantId &&
          s.branchId === branchId &&
          (s.status === "OPEN" || s.status === "CLOSING"),
      ) ?? null
    );
  }
  async save(period: ServicePeriod) {
    const i = this.items.findIndex((s) => s.id === period.id);
    if (i >= 0) this.items[i] = period;
    else this.items.push(period);
  }
}

export class FakeOutboxRepository implements OutboxPort {
  readonly records: OutboxRecord[] = [];
  async append(record: OutboxRecord) {
    this.records.push(record);
  }
}
