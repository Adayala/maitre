// SPEC-144 / SPEC-154 / SPEC-155 — Invoice use cases: create, validate, issue,
// reconcile (no-op), credit, debit, void-draft.
//
// Numbering (SPEC-155): a strictly-increasing, no-gap, no-reuse integer per
// (fiscalEntityId, environment, pointOfSaleId, voucherType), assigned ONLY on a
// successful issue (max+1). A REJECTED issue consumes NO number. The
// candidate/checkpoint/BLOCKED_RECONCILIATION recovery machine is deferred — the
// simulated adapter always resolves synchronously (see simulated-arca-adapter.ts).
//
// Cross-module: the Floor Check is read by the CALLER (the API route), which maps
// the Check's lines into `lines` and passes `sourceCheckId`/`sourceCheckRevision`.
// This is a direct read snapshotted at create time, not a transactional saga.

import { randomUUID } from "node:crypto";
import {
  type Invoice,
  type InvoiceLineItem,
  type FiscalEnvironment,
  type VoucherType,
  type RecipientSnapshot,
  assertInvoiceTransition,
  computeInvoiceTotals,
  InvalidInvoiceTransitionError,
  InvoiceNotCreditableError,
} from "../domain/invoice.js";
import { computeLineItem, type TaxLineInput } from "../domain/tax-calculation.js";
import { resolveTaxRate, NoEffectiveTaxRateError } from "../domain/tax-rate.js";
import { assertCanEmit } from "../domain/fiscal-point-of-sale.js";
import type {
  InvoiceRepositoryPort,
  FiscalPointOfSaleRepositoryPort,
  TaxRateRepositoryPort,
  ArcaAdapterPort,
} from "./ports.js";
import type { OutboxPort } from "./outbox.js";
import { invoiceValidatedEvent, invoiceAuthorizedEvent } from "./events.js";

// MVP default fiscal mapping: every line resolves against a single hardcoded
// (jurisdiction, taxType). A real Product/Category -> TaxRate mapping is DEFERRED
// (Catalog's Product carries no tax category yet).
export const DEFAULT_JURISDICTION = "AR";
export const DEFAULT_TAX_TYPE = "IVA";
export const DEFAULT_NORMATIVE_VERSION = "SIMULATED-NONE";

export interface InvoiceDeps {
  invoices: InvoiceRepositoryPort;
  pointsOfSale: FiscalPointOfSaleRepositoryPort;
  taxRates: TaxRateRepositoryPort;
  arca: ArcaAdapterPort;
  outbox: OutboxPort;
  now?: () => Date;
}

function nowFrom(deps: { now?: () => Date }): Date {
  return (deps.now ?? (() => new Date()))();
}

function notFound(label: string, id: string): Error {
  return new Error(`${label} ${id} not found`);
}

export interface CreateInvoiceInput {
  id?: string;
  tenantId: string;
  fiscalEntityId: string;
  environment: FiscalEnvironment;
  pointOfSaleId: string;
  voucherType: VoucherType;
  currency: string;
  recipient?: RecipientSnapshot;
  lines: TaxLineInput[];
  sourceCheckId?: string;
  sourceCheckRevision?: number;
}

// Resolves the single MVP tax rate (fails closed) and snapshots line items.
async function buildLineItems(deps: InvoiceDeps, lines: TaxLineInput[], at: Date): Promise<InvoiceLineItem[]> {
  const all = await deps.taxRates.listAll();
  const rate = resolveTaxRate(all, DEFAULT_JURISDICTION, DEFAULT_TAX_TYPE, at);
  if (!rate) throw new NoEffectiveTaxRateError(DEFAULT_JURISDICTION, DEFAULT_TAX_TYPE, at);
  return lines.map((line) => computeLineItem({ ...line, id: line.id || randomUUID() }, rate));
}

export async function createInvoice(deps: InvoiceDeps, input: CreateInvoiceInput): Promise<Invoice> {
  const pos = await deps.pointsOfSale.findById(input.tenantId, input.pointOfSaleId);
  if (!pos) throw notFound("FiscalPointOfSale", input.pointOfSaleId);
  if (pos.fiscalEntityId !== input.fiscalEntityId) {
    throw new Error(`FiscalPointOfSale ${pos.id} does not belong to fiscal entity ${input.fiscalEntityId}`);
  }
  assertCanEmit(pos, input.voucherType);

  const now = nowFrom(deps);
  const lineItems = await buildLineItems(deps, input.lines, now);
  const totals = computeInvoiceTotals(lineItems);

  const invoice: Invoice = {
    id: input.id ?? randomUUID(),
    tenantId: input.tenantId,
    fiscalEntityId: input.fiscalEntityId,
    environment: input.environment,
    pointOfSaleId: input.pointOfSaleId,
    voucherType: input.voucherType,
    number: null,
    status: "DRAFT",
    currency: input.currency,
    recipient: input.recipient ?? null,
    lineItems,
    totals,
    sourceCheckId: input.sourceCheckId ?? null,
    sourceCheckRevision: input.sourceCheckRevision ?? null,
    linkedInvoiceId: null,
    authorizationProviderRef: null,
    cae: null,
    caeExpiresAt: null,
    rejectionReason: null,
    normativeVersion: DEFAULT_NORMATIVE_VERSION,
    revision: 1,
    createdAt: now,
    updatedAt: now,
    validatedAt: null,
    authorizedAt: null,
  };
  await deps.invoices.save(invoice);
  return invoice;
}

async function loadInvoice(deps: InvoiceDeps, tenantId: string, id: string): Promise<Invoice> {
  const invoice = await deps.invoices.findById(tenantId, id);
  if (!invoice) throw notFound("Invoice", id);
  return invoice;
}

export async function validateInvoice(
  deps: InvoiceDeps,
  input: { tenantId: string; id: string; correlationId?: string },
): Promise<Invoice> {
  const invoice = await loadInvoice(deps, input.tenantId, input.id);
  assertInvoiceTransition(invoice.status, "VALIDATED");
  const now = nowFrom(deps);
  const updated: Invoice = { ...invoice, status: "VALIDATED", validatedAt: now, updatedAt: now, revision: invoice.revision + 1 };
  await deps.invoices.save(updated);
  await deps.outbox.append(invoiceValidatedEvent(updated, input.correlationId ?? randomUUID()));
  return updated;
}

export interface IssueInvoiceInput {
  tenantId: string;
  id: string;
  cuit: string; // resolved by the caller from the FiscalEntity (direct read)
  correlationId?: string;
}

// SPEC-144 — the ONLY command that can move DRAFT|VALIDATED -> AUTHORIZED|REJECTED.
// AUTHORIZATION_PENDING is a transient conceptual state within this synchronous
// call (the simulated adapter never leaves it pending). Number is assigned only
// on AUTHORIZED.
export async function issueInvoice(deps: InvoiceDeps, input: IssueInvoiceInput): Promise<Invoice> {
  const invoice = await loadInvoice(deps, input.tenantId, input.id);
  if (invoice.status !== "DRAFT" && invoice.status !== "VALIDATED") {
    // e.g. re-issuing an AUTHORIZED invoice => lifecycle conflict (409).
    throw new InvalidInvoiceTransitionError(invoice.status, "AUTHORIZATION_PENDING");
  }

  const pos = await deps.pointsOfSale.findById(input.tenantId, invoice.pointOfSaleId);
  if (!pos) throw notFound("FiscalPointOfSale", invoice.pointOfSaleId);
  assertCanEmit(pos, invoice.voucherType);

  const now = nowFrom(deps);
  const maxNumber = await deps.invoices.findMaxNumber(
    input.tenantId,
    invoice.fiscalEntityId,
    invoice.environment,
    invoice.pointOfSaleId,
    invoice.voucherType,
  );
  const candidateNumber = (maxNumber ?? 0) + 1;

  const result = await deps.arca.authorize({
    tenantId: input.tenantId,
    fiscalEntityId: invoice.fiscalEntityId,
    environment: invoice.environment,
    pointOfSaleCode: pos.officialCode,
    voucherType: invoice.voucherType,
    number: candidateNumber,
    cuit: input.cuit,
    currency: invoice.currency,
    amountMinorUnits: invoice.totals.grossMinorUnits,
  });

  if (result.outcome === "REJECTED") {
    // No number consumed on rejection (no reuse, no gap). REJECTED is terminal.
    const rejected: Invoice = {
      ...invoice,
      status: "REJECTED",
      rejectionReason: result.rejectionReason ?? "ARCA rejected the authorization request",
      authorizationProviderRef: result.providerRef ?? null,
      updatedAt: now,
      revision: invoice.revision + 1,
    };
    await deps.invoices.save(rejected);
    return rejected;
  }

  const authorized: Invoice = {
    ...invoice,
    status: "AUTHORIZED",
    number: candidateNumber,
    cae: result.cae ?? null,
    caeExpiresAt: result.caeExpiresAt ?? null,
    authorizationProviderRef: result.providerRef ?? null,
    authorizedAt: now,
    updatedAt: now,
    revision: invoice.revision + 1,
  };
  await deps.invoices.save(authorized);
  await deps.outbox.append(invoiceAuthorizedEvent(authorized, input.correlationId ?? randomUUID()));
  return authorized;
}

// SPEC-144 :reconcile — no-op in this MVP. The simulated adapter always resolves
// synchronously, so no invoice is ever left PENDING_RECONCILIATION. Returns the
// invoice unchanged; a real adapter would query the provider by logical identity
// here and resolve to AUTHORIZED|REJECTED.
export async function reconcileInvoice(deps: InvoiceDeps, input: { tenantId: string; id: string }): Promise<Invoice> {
  return loadInvoice(deps, input.tenantId, input.id);
}

const CREDIT_NOTE_FOR: Record<string, VoucherType> = {
  FACTURA_A: "NOTA_CREDITO_A",
  FACTURA_B: "NOTA_CREDITO_B",
  FACTURA_C: "NOTA_CREDITO_C",
};
const DEBIT_NOTE_FOR: Record<string, VoucherType> = {
  FACTURA_A: "NOTA_DEBITO_A",
  FACTURA_B: "NOTA_DEBITO_B",
  FACTURA_C: "NOTA_DEBITO_C",
};

async function createLinkedNote(
  deps: InvoiceDeps,
  input: { tenantId: string; id: string; kind: "credit" | "debit" },
): Promise<Invoice> {
  const original = await loadInvoice(deps, input.tenantId, input.id);
  if (original.status !== "AUTHORIZED") throw new InvoiceNotCreditableError(original.id, original.status);

  const map = input.kind === "credit" ? CREDIT_NOTE_FOR : DEBIT_NOTE_FOR;
  const noteType = map[original.voucherType];
  if (!noteType) {
    throw new Error(`No ${input.kind} note voucher type is defined for ${original.voucherType}`);
  }

  const now = nowFrom(deps);
  // The note snapshots the original's line items/totals. It does NOT mutate the
  // original (which stays AUTHORIZED and untouched). It goes through the normal
  // issue/numbering/simulated-CAE flow when issued.
  const note: Invoice = {
    id: randomUUID(),
    tenantId: original.tenantId,
    fiscalEntityId: original.fiscalEntityId,
    environment: original.environment,
    pointOfSaleId: original.pointOfSaleId,
    voucherType: noteType,
    number: null,
    status: "DRAFT",
    currency: original.currency,
    recipient: original.recipient ?? null,
    lineItems: original.lineItems.map((l) => ({ ...l })),
    totals: { ...original.totals },
    sourceCheckId: original.sourceCheckId ?? null,
    sourceCheckRevision: original.sourceCheckRevision ?? null,
    linkedInvoiceId: original.id,
    authorizationProviderRef: null,
    cae: null,
    caeExpiresAt: null,
    rejectionReason: null,
    normativeVersion: original.normativeVersion,
    revision: 1,
    createdAt: now,
    updatedAt: now,
    validatedAt: null,
    authorizedAt: null,
  };
  await deps.invoices.save(note);
  return note;
}

export function creditInvoice(deps: InvoiceDeps, input: { tenantId: string; id: string }): Promise<Invoice> {
  return createLinkedNote(deps, { ...input, kind: "credit" });
}

export function debitInvoice(deps: InvoiceDeps, input: { tenantId: string; id: string }): Promise<Invoice> {
  return createLinkedNote(deps, { ...input, kind: "debit" });
}

export async function voidDraftInvoice(deps: InvoiceDeps, input: { tenantId: string; id: string }): Promise<Invoice> {
  const invoice = await loadInvoice(deps, input.tenantId, input.id);
  assertInvoiceTransition(invoice.status, "VOIDED_DRAFT");
  const now = nowFrom(deps);
  const voided: Invoice = { ...invoice, status: "VOIDED_DRAFT", updatedAt: now, revision: invoice.revision + 1 };
  await deps.invoices.save(voided);
  return voided;
}
