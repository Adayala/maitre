// SPEC-137 / SPEC-138 — Invoice aggregate with embedded InvoiceLineItem value
// objects (Floor Check precedent: lines live inside the aggregate, persisted as
// JSONB, rather than in a separate table).
//
// State machine (SPEC-137):
//   DRAFT -> VALIDATED -> AUTHORIZATION_PENDING -> AUTHORIZED | REJECTED
//   AUTHORIZATION_PENDING -> PENDING_RECONCILIATION (ambiguous timeout)
//   DRAFT | VALIDATED -> VOIDED_DRAFT (abandon a pre-authorization draft)
//   AUTHORIZED, REJECTED, VOIDED_DRAFT are TERMINAL.
//
// NOTE on PENDING_RECONCILIATION: the state is retained for completeness /
// future-proofing, but this MVP's SimulatedArcaAdapter always resolves
// synchronously (AUTHORIZED|REJECTED), so no code path intentionally produces
// PENDING_RECONCILIATION — there is no real ambiguous-timeout scenario to
// simulate. The `reconcile` command is therefore a documented no-op here.
//
// AUTHORIZED is immutable: once a comprobante is authorized its fiscal identity
// (environment + fiscalEntity + pointOfSale + voucherType + number), recipient,
// line items, totals, currency and CAE/expiry are frozen forever. Corrections
// are new Credit/Debit notes referencing the original (linkedInvoiceId), never a
// mutation of the AUTHORIZED row.
//
// Money is always integer minor units. `quantity` is a whole-unit integer for
// this MVP (decimal quantities are a documented deferral — real fiscal software
// needs decimal quantity with explicit rounding-residue handling per SPEC-138).

export type InvoiceStatus =
  | "DRAFT"
  | "VALIDATED"
  | "AUTHORIZATION_PENDING"
  | "AUTHORIZED"
  | "REJECTED"
  | "PENDING_RECONCILIATION"
  | "VOIDED_DRAFT";

export type FiscalEnvironment = "HOMOLOGATION" | "PRODUCTION";

// Argentine-style voucher types kept as plain strings for the MVP. A real
// integration maps these to AFIP/ARCA numeric CbteTipo codes. Credit/Debit notes
// are ordinary Invoice rows whose voucherType reflects the note kind and which
// carry a linkedInvoiceId back to the authorized original.
export type VoucherType =
  | "FACTURA_A"
  | "FACTURA_B"
  | "FACTURA_C"
  | "NOTA_CREDITO_A"
  | "NOTA_CREDITO_B"
  | "NOTA_CREDITO_C"
  | "NOTA_DEBITO_A"
  | "NOTA_DEBITO_B"
  | "NOTA_DEBITO_C";

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number; // whole units (MVP); decimal quantities deferred
  unit: string;
  unitNetMinorUnits: number;
  discountsAppliedMinorUnits: number;
  taxRateVersion: string; // normativeSourceVersion of the resolved TaxRate
  taxTreatment: "TAXED" | "EXEMPT" | "NON_TAXED";
  taxableBaseMinorUnits: number;
  exemptBaseMinorUnits: number;
  nonTaxedBaseMinorUnits: number;
  taxAmountMinorUnits: number;
  grossTotalMinorUnits: number;
  sourceCheckLineRef?: string | null;
  discountApplicationRefs: string[];
}

export interface InvoiceTotals {
  netMinorUnits: number; // taxable + exempt + nonTaxed (net after discounts)
  taxableBaseMinorUnits: number;
  exemptBaseMinorUnits: number;
  nonTaxedBaseMinorUnits: number;
  taxAmountMinorUnits: number;
  grossMinorUnits: number; // net + tax
}

// Recipient snapshot is minimal and treated as PII — never emitted in events.
export interface RecipientSnapshot {
  legalName?: string | null;
  taxId?: string | null;
  taxCondition?: string | null;
}

export interface Invoice {
  id: string;
  tenantId: string;
  fiscalEntityId: string;
  environment: FiscalEnvironment;
  pointOfSaleId: string;
  voucherType: VoucherType;
  number?: number | null; // assigned only at successful issue
  status: InvoiceStatus;
  currency: string;
  recipient?: RecipientSnapshot | null;
  lineItems: InvoiceLineItem[];
  totals: InvoiceTotals;
  sourceCheckId?: string | null;
  sourceCheckRevision?: number | null;
  linkedInvoiceId?: string | null; // set on credit/debit notes
  authorizationProviderRef?: string | null;
  cae?: string | null;
  caeExpiresAt?: Date | null;
  rejectionReason?: string | null;
  normativeVersion: string;
  revision: number; // aggregateRevision, bumped on every accepted transition
  createdAt: Date;
  updatedAt: Date;
  validatedAt?: Date | null;
  authorizedAt?: Date | null;
}

const TERMINAL: InvoiceStatus[] = ["AUTHORIZED", "REJECTED", "VOIDED_DRAFT"];

const allowedTransitions: Record<InvoiceStatus, InvoiceStatus[]> = {
  DRAFT: ["VALIDATED", "VOIDED_DRAFT"],
  VALIDATED: ["AUTHORIZATION_PENDING", "DRAFT", "VOIDED_DRAFT"],
  AUTHORIZATION_PENDING: ["AUTHORIZED", "REJECTED", "PENDING_RECONCILIATION"],
  PENDING_RECONCILIATION: ["AUTHORIZED", "REJECTED"],
  AUTHORIZED: [],
  REJECTED: [],
  VOIDED_DRAFT: [],
};

export class InvalidInvoiceTransitionError extends Error {
  constructor(from: InvoiceStatus, to: InvoiceStatus) {
    super(`Invoice cannot transition from ${from} to ${to}`);
    this.name = "InvalidInvoiceTransitionError";
  }
}

export class ImmutableInvoiceError extends Error {
  constructor(id: string) {
    super(`Invoice ${id} is AUTHORIZED and immutable; corrections require a credit/debit note`);
    this.name = "ImmutableInvoiceError";
  }
}

export class InvoiceNotCreditableError extends Error {
  constructor(id: string, status: InvoiceStatus) {
    super(`Invoice ${id} is ${status}; only an AUTHORIZED invoice can be credited or debited`);
    this.name = "InvoiceNotCreditableError";
  }
}

export function isTerminal(status: InvoiceStatus): boolean {
  return TERMINAL.includes(status);
}

export function assertInvoiceTransition(from: InvoiceStatus, to: InvoiceStatus): void {
  if (!allowedTransitions[from].includes(to)) {
    throw new InvalidInvoiceTransitionError(from, to);
  }
}

// Recomputes aggregate totals as the exact sum of the embedded line items. The
// line-sum must reconcile with the Invoice totals bit-for-bit (SPEC-138).
export function computeInvoiceTotals(lineItems: readonly InvoiceLineItem[]): InvoiceTotals {
  const taxableBaseMinorUnits = lineItems.reduce((s, l) => s + l.taxableBaseMinorUnits, 0);
  const exemptBaseMinorUnits = lineItems.reduce((s, l) => s + l.exemptBaseMinorUnits, 0);
  const nonTaxedBaseMinorUnits = lineItems.reduce((s, l) => s + l.nonTaxedBaseMinorUnits, 0);
  const taxAmountMinorUnits = lineItems.reduce((s, l) => s + l.taxAmountMinorUnits, 0);
  const netMinorUnits = taxableBaseMinorUnits + exemptBaseMinorUnits + nonTaxedBaseMinorUnits;
  const grossMinorUnits = netMinorUnits + taxAmountMinorUnits;
  return {
    netMinorUnits,
    taxableBaseMinorUnits,
    exemptBaseMinorUnits,
    nonTaxedBaseMinorUnits,
    taxAmountMinorUnits,
    grossMinorUnits,
  };
}

export function isCreditNote(voucherType: VoucherType): boolean {
  return voucherType.startsWith("NOTA_CREDITO");
}

export function isDebitNote(voucherType: VoucherType): boolean {
  return voucherType.startsWith("NOTA_DEBITO");
}
