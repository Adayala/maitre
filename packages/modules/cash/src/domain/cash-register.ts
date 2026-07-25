// SPEC-124 — CashRegister domain model.
//
// A CashRegister configures a physical or logical cash point per Branch. It
// never holds a running balance and never represents a concrete opening — its
// responsibility ends at configuration and availability. The authoritative
// per-opening aggregate is CashSession (cash-session.ts).
//
// SCOPE NOTE (approved "CRUD simple + invariantes clave"): the only enforced
// invariant here is `code` uniqueness per branch (checked in the use case
// layer against the repository, mirroring how Floor/Catalog enforce their
// unique codes). `allowedCurrencies` is a free-form string list; no ISO-4217
// validation or currency-config entity exists yet (deferred).

export type CashRegisterStatus = "ACTIVE" | "SUSPENDED" | "RETIRED";

export interface CashRegister {
  id: string;
  tenantId: string;
  branchId: string;
  code: string;
  displayName: string;
  allowedCurrencies: string[];
  status: CashRegisterStatus;
  revision: number;
  createdAt: Date;
  updatedAt: Date;
}

const allowedTransitions: Record<CashRegisterStatus, CashRegisterStatus[]> = {
  ACTIVE: ["SUSPENDED", "RETIRED"],
  SUSPENDED: ["ACTIVE", "RETIRED"],
  RETIRED: [],
};

export class InvalidCashRegisterTransitionError extends Error {
  constructor(from: CashRegisterStatus, to: CashRegisterStatus) {
    super(`CashRegister cannot transition from ${from} to ${to}`);
    this.name = "InvalidCashRegisterTransitionError";
  }
}

export function assertCashRegisterTransition(from: CashRegisterStatus, to: CashRegisterStatus): void {
  if (from === to) return;
  if (!allowedTransitions[from].includes(to)) {
    throw new InvalidCashRegisterTransitionError(from, to);
  }
}

export class DuplicateCashRegisterCodeError extends Error {
  constructor(code: string, branchId: string) {
    super(`CashRegister code "${code}" already exists for branch ${branchId}`);
    this.name = "DuplicateCashRegisterCodeError";
  }
}
