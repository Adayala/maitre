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

export interface FiscalPointOfSale {
  id: string;
  tenantId: string;
  fiscalEntityId: string;
  environment: FiscalEnvironment;
  officialCode: string;
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
  if (!pos.allowedVoucherTypes.includes(voucherType)) {
    throw new VoucherTypeNotAllowedError(voucherType, pos.id);
  }
}
