import type { FiscalEnvironment, VoucherType } from "./invoice.js";

export type AuthorizationAttemptStatus =
  | "CREATED"
  | "DISPATCHED"
  | "AUTHORIZED"
  | "REJECTED"
  | "PENDING_RECONCILIATION";

export interface AuthorizationAttempt {
  id: string;
  tenantId: string;
  invoiceId: string;
  fiscalEntityId: string;
  pointOfSaleId: string;
  environment: FiscalEnvironment;
  voucherType: VoucherType;
  requestedNumber: number;
  requestHash: string;
  status: AuthorizationAttemptStatus;
  providerRef?: string;
  rejectionReason?: string;
  createdAt: Date;
  dispatchedAt?: Date;
  resolvedAt?: Date;
  updatedAt: Date;
}
