// SPEC-150 — Invoice / Libro IVA Digital export. Implemented as a SYNCHRONOUS
// function that filters AUTHORIZED invoices (and authorized credit/debit notes)
// for a period + fiscalEntity (+ optional pointOfSale), sums totals by
// voucher/currency, and returns a manifest object.
//
// DEFERRED (documented): no async job queue, no file-artifact generation, no
// signed download URLs / expiry mechanics. This returns the manifest data
// synchronously. Per SPEC-150 it NEVER marks anything as "presented to ARCA" —
// export means "dataset assembled", never "submitted to the tax authority".
// pending/rejected documents are surfaced in an exceptions list, never as sales.

import type { Invoice, VoucherType } from "../domain/invoice.js";
import type { InvoiceRepositoryPort } from "./ports.js";

export interface InvoiceExportRequest {
  tenantId: string;
  fiscalEntityId: string;
  pointOfSaleId?: string;
  periodFrom: Date;
  periodTo: Date;
}

export interface VoucherTotals {
  voucherType: VoucherType;
  currency: string;
  count: number;
  netMinorUnits: number;
  taxableBaseMinorUnits: number;
  exemptBaseMinorUnits: number;
  nonTaxedBaseMinorUnits: number;
  taxAmountMinorUnits: number;
  grossMinorUnits: number;
}

export interface InvoiceExportManifest {
  tenantId: string;
  fiscalEntityId: string;
  pointOfSaleId: string | null;
  periodFrom: string;
  periodTo: string;
  formatVersion: string;
  authorizedCount: number;
  totalsByVoucher: VoucherTotals[];
  grandTotalGrossMinorUnits: number;
  grandTotalTaxMinorUnits: number;
  // Documents in the window that are NOT authorized (excluded from totals).
  exceptions: { invoiceId: string; status: string; voucherType: VoucherType }[];
  presented: false; // never true — export is not a submission (SPEC-150)
}

export const INVOICE_EXPORT_FORMAT_VERSION = "mvp-manifest-1";

export interface ExportDeps {
  invoices: InvoiceRepositoryPort;
}

function inWindow(invoice: Invoice, from: Date, to: Date): boolean {
  const at = (invoice.authorizedAt ?? invoice.createdAt).getTime();
  return at >= from.getTime() && at <= to.getTime();
}

export async function buildInvoiceExportManifest(
  deps: ExportDeps,
  request: InvoiceExportRequest,
): Promise<InvoiceExportManifest> {
  const all = await deps.invoices.listByFiscalEntity(request.tenantId, request.fiscalEntityId);
  const scoped = all.filter(
    (inv) =>
      (!request.pointOfSaleId || inv.pointOfSaleId === request.pointOfSaleId) &&
      inWindow(inv, request.periodFrom, request.periodTo),
  );

  const authorized = scoped.filter((inv) => inv.status === "AUTHORIZED");
  const exceptions = scoped
    .filter((inv) => inv.status !== "AUTHORIZED")
    .map((inv) => ({ invoiceId: inv.id, status: inv.status, voucherType: inv.voucherType }));

  const byKey = new Map<string, VoucherTotals>();
  for (const inv of authorized) {
    const key = `${inv.voucherType}|${inv.currency}`;
    const acc =
      byKey.get(key) ??
      {
        voucherType: inv.voucherType,
        currency: inv.currency,
        count: 0,
        netMinorUnits: 0,
        taxableBaseMinorUnits: 0,
        exemptBaseMinorUnits: 0,
        nonTaxedBaseMinorUnits: 0,
        taxAmountMinorUnits: 0,
        grossMinorUnits: 0,
      };
    acc.count += 1;
    acc.netMinorUnits += inv.totals.netMinorUnits;
    acc.taxableBaseMinorUnits += inv.totals.taxableBaseMinorUnits;
    acc.exemptBaseMinorUnits += inv.totals.exemptBaseMinorUnits;
    acc.nonTaxedBaseMinorUnits += inv.totals.nonTaxedBaseMinorUnits;
    acc.taxAmountMinorUnits += inv.totals.taxAmountMinorUnits;
    acc.grossMinorUnits += inv.totals.grossMinorUnits;
    byKey.set(key, acc);
  }

  const totalsByVoucher = [...byKey.values()].sort((a, b) => a.voucherType.localeCompare(b.voucherType));
  const grandTotalGrossMinorUnits = totalsByVoucher.reduce((s, v) => s + v.grossMinorUnits, 0);
  const grandTotalTaxMinorUnits = totalsByVoucher.reduce((s, v) => s + v.taxAmountMinorUnits, 0);

  return {
    tenantId: request.tenantId,
    fiscalEntityId: request.fiscalEntityId,
    pointOfSaleId: request.pointOfSaleId ?? null,
    periodFrom: request.periodFrom.toISOString(),
    periodTo: request.periodTo.toISOString(),
    formatVersion: INVOICE_EXPORT_FORMAT_VERSION,
    authorizedCount: authorized.length,
    totalsByVoucher,
    grandTotalGrossMinorUnits,
    grandTotalTaxMinorUnits,
    exceptions,
    presented: false,
  };
}
