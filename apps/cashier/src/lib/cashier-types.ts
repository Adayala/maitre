export interface ApiData<T> {
  data: T;
}

export type PaymentMethod = "CASH" | "CARD" | "OTHER";

export interface Payment {
  id: string;
  tenantId: string;
  branchId: string;
  checkId: string;
  amountMinorUnits: number;
  currency: string;
  method: PaymentMethod;
  status: "PENDING" | "AUTHORIZED" | "CAPTURED" | "FAILED" | "VOID";
  idempotencyKey: string;
  revision: number;
  createdAt: string;
  updatedAt: string;
}

export interface PendingCheck {
  id: string;
  tenantId: string;
  branchId: string;
  visitId: string;
  currency: string;
  lines: Array<{
    id: string;
    description: string;
    amountMinorUnits: number;
  }>;
  status: "PAYMENT_PENDING";
  updatedAt: string;
  totals: {
    gross: number;
    discounts: number;
    estimatedTax: number;
    serviceCharges: number;
    netDue: number;
    paid: number;
    balance: number;
  };
  paymentsSummary: {
    count: number;
    capturedCount: number;
    refundCount: number;
    paidMinorUnits: number;
  };
  visit: {
    id: string;
    status: "OPEN" | "CLOSING" | "CLOSED" | "CANCELLED";
    guestCount: number;
    tableIds: string[];
  } | null;
  tables: Array<{
    id: string;
    number: string;
    name?: string;
  }>;
}

export interface CashRegister {
  id: string;
  tenantId: string;
  branchId: string;
  code: string;
  displayName: string;
  allowedCurrencies: string[];
  status: "ACTIVE" | "SUSPENDED" | "RETIRED";
  revision: number;
  createdAt: string;
  updatedAt: string;
}

export interface CashSession {
  id: string;
  tenantId: string;
  branchId: string;
  cashRegisterId: string;
  currency: string;
  businessDate: string;
  timezone: string;
  openingAmountMinorUnits: number;
  openedAt: string;
  openedBy: string;
  cutoffAt?: string | null;
  closedAt?: string | null;
  closedBy?: string | null;
  ledgerRevision: number;
  status: "OPEN" | "CLOSING" | "CLOSED" | "RECONCILED";
  suspended: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CashMovementDirection = "IN" | "OUT";
export type CashMovementType =
  | "OPENING"
  | "CASH_SALE"
  | "CASH_REFUND"
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "TIP_IN"
  | "TIP_OUT"
  | "ADJUSTMENT"
  | "CLOSING_COUNT";

export interface CashMovement {
  id: string;
  tenantId: string;
  branchId: string;
  cashRegisterId: string;
  cashSessionId: string;
  currency: string;
  type: CashMovementType;
  direction: CashMovementDirection;
  amountMinorUnits: number;
  ledgerRevision: number;
  occurredAt: string;
  recordedAt: string;
}

export interface CashReconciliation {
  id: string;
  tenantId: string;
  branchId: string;
  cashRegisterId: string;
  cashSessionId: string;
  currency: string;
  ledgerRevision: number;
  attempt: number;
  countedMinorUnits: number | null;
  expectedMinorUnits: number;
  differenceMinorUnits: number | null;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
  preparedBy: string;
  preparedAt: string;
  submittedAt?: string | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
  rejectedBy?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExpectedSummary {
  cashReconciliationId: string;
  cashSessionId: string;
  currency: string;
  ledgerRevision: number;
  openingMinorUnits: number;
  expectedMinorUnits: number;
  countedMinorUnits: number | null;
  differenceMinorUnits: number | null;
  status: CashReconciliation["status"];
}

export interface DailySettlementSessionLine {
  cashSessionId: string;
  cashRegisterId: string;
  status: CashSession["status"];
  openingMinorUnits: number;
  expectedMinorUnits: number;
  countedMinorUnits: number | null;
  differenceMinorUnits: number | null;
}

export interface DailySettlement {
  tenantId: string;
  branchId: string;
  businessDate: string;
  timezone: string;
  currency: string;
  sessionCount: number;
  openingsMinorUnits: number;
  movementsByType: Record<string, number>;
  expectedMinorUnits: number;
  countedMinorUnits: number;
  differenceMinorUnits: number;
  sessions: DailySettlementSessionLine[];
}
