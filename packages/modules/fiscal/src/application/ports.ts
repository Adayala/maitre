import type { Invoice, FiscalEnvironment, VoucherType } from "../domain/invoice.js";
import type { FiscalPointOfSale } from "../domain/fiscal-point-of-sale.js";
import type { FiscalPrinter } from "../domain/fiscal-printer.js";
import type { FiscalCertificate } from "../domain/fiscal-certificate.js";
import type { InvoiceTemplate } from "../domain/invoice-template.js";
import type { TaxRate } from "../domain/tax-rate.js";
import type { AuthorizationAttempt } from "../domain/authorization-attempt.js";
import type { InvoiceDelivery } from "../domain/invoice-delivery.js";

export interface InvoiceRepositoryPort {
  findById(tenantId: string, id: string): Promise<Invoice | null>;
  listByFiscalEntity(tenantId: string, fiscalEntityId: string): Promise<Invoice[]>;
  listByTenant(tenantId: string): Promise<Invoice[]>;
  // Numbering support (SPEC-155): the highest assigned number for a numbering
  // sequence key, or null if none assigned yet. Assignment happens only at a
  // successful issue; the sequence is strictly increasing, no gaps, no reuse.
  findMaxNumber(
    tenantId: string,
    fiscalEntityId: string,
    environment: FiscalEnvironment,
    pointOfSaleId: string,
    voucherType: VoucherType,
  ): Promise<number | null>;
  save(invoice: Invoice): Promise<void>;
}

export interface AuthorizationAttemptRepositoryPort {
  findLatestByInvoice(tenantId: string, invoiceId: string): Promise<AuthorizationAttempt | null>;
  save(attempt: AuthorizationAttempt): Promise<void>;
}

export interface InvoiceDeliveryRepositoryPort {
  findById(tenantId: string, id: string): Promise<InvoiceDelivery | null>;
  findByIdempotencyKey(
    tenantId: string,
    idempotencyKey: string,
  ): Promise<InvoiceDelivery | null>;
  listByInvoice(tenantId: string, invoiceId: string): Promise<InvoiceDelivery[]>;
  claimForProcessing(
    tenantId: string,
    id: string,
    updatedAt: Date,
  ): Promise<InvoiceDelivery | null>;
  save(delivery: InvoiceDelivery): Promise<void>;
}

export interface FiscalPointOfSaleRepositoryPort {
  findById(tenantId: string, id: string): Promise<FiscalPointOfSale | null>;
  findByIdentity(
    tenantId: string,
    fiscalEntityId: string,
    environment: FiscalEnvironment,
    officialCode: string,
  ): Promise<FiscalPointOfSale | null>;
  listByFiscalEntity(tenantId: string, fiscalEntityId: string): Promise<FiscalPointOfSale[]>;
  save(pos: FiscalPointOfSale): Promise<void>;
}

export interface FiscalPrinterRepositoryPort {
  findById(tenantId: string, id: string): Promise<FiscalPrinter | null>;
  listByBranch(tenantId: string, branchId: string): Promise<FiscalPrinter[]>;
  save(printer: FiscalPrinter): Promise<void>;
}

export interface FiscalCertificateRepositoryPort {
  findById(tenantId: string, id: string): Promise<FiscalCertificate | null>;
  listByFiscalEntity(tenantId: string, fiscalEntityId: string): Promise<FiscalCertificate[]>;
  save(cert: FiscalCertificate): Promise<void>;
}

export interface InvoiceTemplateRepositoryPort {
  findById(tenantId: string, id: string): Promise<InvoiceTemplate | null>;
  listByTenant(tenantId: string): Promise<InvoiceTemplate[]>;
  save(template: InvoiceTemplate): Promise<void>;
}

export interface TaxRateRepositoryPort {
  findById(id: string): Promise<TaxRate | null>;
  listAll(): Promise<TaxRate[]>;
  // Published siblings sharing the identity key (jurisdiction, taxType,
  // officialCode) — used to enforce the no-overlap invariant at publish time.
  listByKey(jurisdiction: string, taxType: string, officialCode: string): Promise<TaxRate[]>;
  save(rate: TaxRate): Promise<void>;
}

// ---------------------------------------------------------------------------
// ArcaAdapterPort — the domain/application layer depends on THIS port, never on
// the concrete SimulatedArcaAdapter. A real WSAA/WSFEv1 client implements the
// same interface and is swapped in behind the composition root without touching
// Invoice's domain/application code. See adapters/simulated-arca-adapter.ts.
// ---------------------------------------------------------------------------
export interface ArcaAuthorizationRequest {
  tenantId: string;
  fiscalEntityId: string;
  environment: FiscalEnvironment;
  pointOfSaleCode: string;
  voucherType: VoucherType;
  number: number;
  cuit: string;
  currency: string;
  issuedAt: Date;
  recipientDocumentType: number;
  recipientDocumentNumber: string;
  recipientVatConditionId?: number;
  taxableBaseMinorUnits: number;
  nonTaxedBaseMinorUnits: number;
  exemptBaseMinorUnits: number;
  taxAmountMinorUnits: number;
  grossMinorUnits: number;
  vatBreakdown: Array<{
    officialCode: string;
    taxableBaseMinorUnits: number;
    taxAmountMinorUnits: number;
  }>;
  associatedVoucher?: {
    voucherType: VoucherType;
    pointOfSaleCode: string;
    number: number;
  };
}

export interface ArcaAuthorizationResult {
  outcome: "AUTHORIZED" | "REJECTED" | "PENDING_RECONCILIATION";
  assignedNumber?: number;
  cae?: string;
  caeExpiresAt?: Date;
  providerRef?: string;
  rejectionReason?: string;
}

export interface ArcaAdapterPort {
  authorize(request: ArcaAuthorizationRequest): Promise<ArcaAuthorizationResult>;
  reconcile?(request: {
    cuit: string;
    environment: FiscalEnvironment;
    pointOfSaleCode: string;
    voucherType: VoucherType;
    number: number;
  }): Promise<ArcaAuthorizationResult>;
}
