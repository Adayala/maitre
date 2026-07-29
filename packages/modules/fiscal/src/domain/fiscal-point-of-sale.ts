// SPEC-155 — FiscalPointOfSale. Belongs to a FiscalEntity; defines the
// environment, the official point-of-sale code and the voucher types it may
// emit. Unique per (fiscalEntityId, environment, officialCode).
//
// Numbering (SPEC-155): sequential integer numbering serializes per
// (fiscalEntityId, environment, pointOfSaleId, voucherType) and is assigned only
// at a successful `issue` (never reserved earlier as a candidate). See
// invoice-commands.ts::issueInvoice for the strictly-increasing, no-gap, no-reuse
// assignment. The full candidate/checkpoint/BLOCKED_RECONCILIATION reconciliation
// state machine (for ambiguous remote-authority timeouts) is DEFERRED entirely:
// the SimulatedArcaAdapter always resolves synchronously, so there is no
// ambiguous case to reconcile.

import type { FiscalEnvironment, VoucherType } from "./invoice.js";

export type FiscalPointOfSaleStatus = "ACTIVE" | "INACTIVE";
export type ArcaRegistrationStatus = "DECLARED" | "VERIFIED" | "REJECTED" | "INACTIVE";
export type FiscalIssuingSystem =
  | "WSFEV1"
  | "CONTROLLER_FISCAL"
  | "COMPROBANTES_EN_LINEA"
  | "OTHER";

export interface FiscalPointOfSale {
  id: string;
  tenantId: string;
  fiscalEntityId: string;
  /** Physical/operational branch whose ARCA domicile owns this point of sale. */
  branchId?: string;
  environment: FiscalEnvironment;
  officialCode: string;
  arcaDomicileCode?: string;
  arcaDomicileLabel?: string;
  issuingSystem?: FiscalIssuingSystem;
  registrationStatus?: ArcaRegistrationStatus;
  registrationEvidenceRef?: string;
  declaredAt?: Date;
  declaredBy?: string;
  verifiedAt?: Date;
  verifiedBy?: string;
  rejectionReason?: string;
  allowedVoucherTypes: VoucherType[];
  status: FiscalPointOfSaleStatus;
  revision: number;
  createdAt: Date;
  updatedAt: Date;
}

export class DuplicatePointOfSaleError extends Error {
  constructor(fiscalEntityId: string, environment: string, officialCode: string) {
    super(
      `A FiscalPointOfSale already exists for (${fiscalEntityId}, ${environment}, ${officialCode})`,
    );
    this.name = "DuplicatePointOfSaleError";
  }
}

export class PointOfSaleInactiveError extends Error {
  constructor(id: string) {
    super(`FiscalPointOfSale ${id} is INACTIVE and cannot emit vouchers`);
    this.name = "PointOfSaleInactiveError";
  }
}

export class VoucherTypeNotAllowedError extends Error {
  constructor(voucherType: string, pointOfSaleId: string) {
    super(`Voucher type ${voucherType} is not allowed for point of sale ${pointOfSaleId}`);
    this.name = "VoucherTypeNotAllowedError";
  }
}

export function assertCanEmit(pos: FiscalPointOfSale, voucherType: VoucherType): void {
  if (pos.status !== "ACTIVE") throw new PointOfSaleInactiveError(pos.id);
  if (pos.environment === "PRODUCTION" && pos.registrationStatus !== "VERIFIED") {
    throw new PointOfSaleRegistrationError(pos.id, pos.registrationStatus);
  }
  if (!pos.allowedVoucherTypes.includes(voucherType)) {
    throw new VoucherTypeNotAllowedError(voucherType, pos.id);
  }
}

export class PointOfSaleRegistrationError extends Error {
  constructor(id: string, status: ArcaRegistrationStatus | undefined) {
    super(`FiscalPointOfSale ${id} is ${status ?? "UNREGISTERED"}; production emission requires VERIFIED registration`);
    this.name = "PointOfSaleRegistrationError";
  }
}
