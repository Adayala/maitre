import type { CashRegister } from "../domain/cash-register.js";
import type { CashSession } from "../domain/cash-session.js";
import type { CashMovement } from "../domain/cash-movement.js";
import type { CashReconciliation } from "../domain/cash-reconciliation.js";
import type { Discount } from "../domain/discount.js";
import type { DiscountApplication } from "../domain/discount-application.js";
import { isSessionLive } from "../domain/cash-session.js";
import type {
  CashRegisterRepositoryPort,
  CashSessionRepositoryPort,
  CashMovementRepositoryPort,
  CashReconciliationRepositoryPort,
  DiscountRepositoryPort,
  DiscountApplicationRepositoryPort,
} from "../application/ports.js";
import type { OutboxPort, OutboxRecord } from "../application/outbox.js";

export class FakeCashRegisterRepository implements CashRegisterRepositoryPort {
  private readonly items: CashRegister[] = [];
  async findById(tenantId: string, id: string) {
    return this.items.find((r) => r.tenantId === tenantId && r.id === id) ?? null;
  }
  async findByCode(tenantId: string, branchId: string, code: string) {
    return this.items.find((r) => r.tenantId === tenantId && r.branchId === branchId && r.code === code) ?? null;
  }
  async listByBranch(tenantId: string, branchId: string) {
    return this.items.filter((r) => r.tenantId === tenantId && r.branchId === branchId);
  }
  async save(register: CashRegister) {
    const i = this.items.findIndex((r) => r.id === register.id);
    if (i >= 0) this.items[i] = register;
    else this.items.push(register);
  }
}

export class FakeCashSessionRepository implements CashSessionRepositoryPort {
  private readonly items: CashSession[] = [];
  async findById(tenantId: string, id: string) {
    return this.items.find((s) => s.tenantId === tenantId && s.id === id) ?? null;
  }
  async findLiveByRegisterAndCurrency(tenantId: string, cashRegisterId: string, currency: string) {
    return (
      this.items.find(
        (s) =>
          s.tenantId === tenantId &&
          s.cashRegisterId === cashRegisterId &&
          s.currency === currency &&
          isSessionLive(s),
      ) ?? null
    );
  }
  async listByRegister(tenantId: string, cashRegisterId: string) {
    return this.items.filter((s) => s.tenantId === tenantId && s.cashRegisterId === cashRegisterId);
  }
  async listByBranchAndBusinessDate(tenantId: string, branchId: string, businessDate: string, currency: string) {
    return this.items.filter(
      (s) =>
        s.tenantId === tenantId &&
        s.branchId === branchId &&
        s.businessDate === businessDate &&
        s.currency === currency,
    );
  }
  async save(session: CashSession) {
    const i = this.items.findIndex((s) => s.id === session.id);
    if (i >= 0) this.items[i] = session;
    else this.items.push(session);
  }
}

export class FakeCashMovementRepository implements CashMovementRepositoryPort {
  private readonly items: CashMovement[] = [];
  async findById(tenantId: string, id: string) {
    return this.items.find((m) => m.tenantId === tenantId && m.id === id) ?? null;
  }
  async listBySession(tenantId: string, cashSessionId: string) {
    return this.items.filter((m) => m.tenantId === tenantId && m.cashSessionId === cashSessionId);
  }
  async findByRegisterAndSourceReference(tenantId: string, cashRegisterId: string, sourceReference: string) {
    return (
      this.items.find(
        (m) =>
          m.tenantId === tenantId &&
          m.cashRegisterId === cashRegisterId &&
          m.sourceReference === sourceReference,
      ) ?? null
    );
  }
  async listByBranchAndSessions(tenantId: string, cashSessionIds: string[]) {
    return this.items.filter((m) => m.tenantId === tenantId && cashSessionIds.includes(m.cashSessionId));
  }
  async save(movement: CashMovement) {
    const i = this.items.findIndex((m) => m.id === movement.id);
    if (i >= 0) this.items[i] = movement;
    else this.items.push(movement);
  }
}

export class FakeCashReconciliationRepository implements CashReconciliationRepositoryPort {
  private readonly items: CashReconciliation[] = [];
  async findById(tenantId: string, id: string) {
    return this.items.find((r) => r.tenantId === tenantId && r.id === id) ?? null;
  }
  async findBySession(tenantId: string, cashSessionId: string) {
    return this.items.find((r) => r.tenantId === tenantId && r.cashSessionId === cashSessionId) ?? null;
  }
  async save(reconciliation: CashReconciliation) {
    const i = this.items.findIndex((r) => r.id === reconciliation.id);
    if (i >= 0) this.items[i] = reconciliation;
    else this.items.push(reconciliation);
  }
}

export class FakeDiscountRepository implements DiscountRepositoryPort {
  private readonly items: Discount[] = [];
  async findById(tenantId: string, id: string) {
    return this.items.find((d) => d.tenantId === tenantId && d.id === id) ?? null;
  }
  async listByTenant(tenantId: string) {
    return this.items.filter((d) => d.tenantId === tenantId);
  }
  async save(discount: Discount) {
    const i = this.items.findIndex((d) => d.id === discount.id);
    if (i >= 0) this.items[i] = discount;
    else this.items.push(discount);
  }
}

export class FakeDiscountApplicationRepository implements DiscountApplicationRepositoryPort {
  private readonly items: DiscountApplication[] = [];
  async findById(tenantId: string, id: string) {
    return this.items.find((a) => a.tenantId === tenantId && a.id === id) ?? null;
  }
  async listByTarget(tenantId: string, targetType: "ORDER" | "CHECK", targetId: string) {
    return this.items.filter(
      (a) =>
        a.tenantId === tenantId &&
        (targetType === "ORDER" ? a.orderId === targetId : a.checkId === targetId),
    );
  }
  async save(application: DiscountApplication) {
    const i = this.items.findIndex((a) => a.id === application.id);
    if (i >= 0) this.items[i] = application;
    else this.items.push(application);
  }
}

export class FakeOutboxRepository implements OutboxPort {
  readonly records: OutboxRecord[] = [];
  async append(record: OutboxRecord) {
    this.records.push(record);
  }
}
