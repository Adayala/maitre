import type { CashRegister } from "../domain/cash-register.js";
import type { CashSession } from "../domain/cash-session.js";
import type { CashMovement } from "../domain/cash-movement.js";
import type { CashReconciliation } from "../domain/cash-reconciliation.js";
import type { Discount } from "../domain/discount.js";
import type { DiscountApplication } from "../domain/discount-application.js";

export interface CashRegisterRepositoryPort {
  findById(tenantId: string, id: string): Promise<CashRegister | null>;
  findByCode(tenantId: string, branchId: string, code: string): Promise<CashRegister | null>;
  listByBranch(tenantId: string, branchId: string): Promise<CashRegister[]>;
  save(register: CashRegister): Promise<void>;
}

export interface CashSessionRepositoryPort {
  findById(tenantId: string, id: string): Promise<CashSession | null>;
  // The one-OPEN/CLOSING-per-(register,currency) invariant is enforced against
  // this lookup (returns the live session if any).
  findLiveByRegisterAndCurrency(
    tenantId: string,
    cashRegisterId: string,
    currency: string,
  ): Promise<CashSession | null>;
  listByRegister(tenantId: string, cashRegisterId: string): Promise<CashSession[]>;
  listByBranchAndBusinessDate(
    tenantId: string,
    branchId: string,
    businessDate: string,
    currency: string,
  ): Promise<CashSession[]>;
  save(session: CashSession): Promise<void>;
}

export interface CashMovementRepositoryPort {
  findById(tenantId: string, id: string): Promise<CashMovement | null>;
  listBySession(tenantId: string, cashSessionId: string): Promise<CashMovement[]>;
  // Dedup support: has a movement already used this sourceReference for the
  // register? (SPEC-125 stable convergence — reject a duplicate source.)
  findByRegisterAndSourceReference(
    tenantId: string,
    cashRegisterId: string,
    sourceReference: string,
  ): Promise<CashMovement | null>;
  listByBranchAndSessions(tenantId: string, cashSessionIds: string[]): Promise<CashMovement[]>;
  save(movement: CashMovement): Promise<void>;
}

export interface CashReconciliationRepositoryPort {
  findById(tenantId: string, id: string): Promise<CashReconciliation | null>;
  findBySession(tenantId: string, cashSessionId: string): Promise<CashReconciliation | null>;
  save(reconciliation: CashReconciliation): Promise<void>;
}

export interface DiscountRepositoryPort {
  findById(tenantId: string, id: string): Promise<Discount | null>;
  listByTenant(tenantId: string): Promise<Discount[]>;
  save(discount: Discount): Promise<void>;
}

export interface DiscountApplicationRepositoryPort {
  findById(tenantId: string, id: string): Promise<DiscountApplication | null>;
  listByTarget(tenantId: string, targetType: "ORDER" | "CHECK", targetId: string): Promise<DiscountApplication[]>;
  save(application: DiscountApplication): Promise<void>;
}
