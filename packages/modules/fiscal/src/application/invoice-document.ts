import { createHash } from "node:crypto";
import type { FiscalQrCode } from "../domain/fiscal-qr-code.js";
import type { Invoice } from "../domain/invoice.js";

export const INVOICE_DOCUMENT_FORMAT_VERSION = "html-v1";

export interface InvoiceDocumentIssuer {
  cuit: string;
  legalName: string;
  displayName?: string | null;
  fiscalAddress?: string | null;
  taxCondition: string;
}

export interface InvoiceDocumentPointOfSale {
  officialCode: string;
  domicileLabel?: string | null;
}

export interface RenderedInvoiceDocument {
  invoiceId: string;
  fileName: string;
  mediaType: "text/html";
  formatVersion: string;
  normativeVersion: string;
  contentHash: string;
  html: string;
}

export class InvoiceDocumentNotRenderableError extends Error {
  constructor(invoiceId: string) {
    super(
      `Invoice ${invoiceId} must be AUTHORIZED before rendering a fiscal document`,
    );
    this.name = "InvoiceDocumentNotRenderableError";
  }
}

export function renderAuthorizedInvoiceDocument(input: {
  invoice: Invoice;
  issuer: InvoiceDocumentIssuer;
  pointOfSale: InvoiceDocumentPointOfSale;
  qr: FiscalQrCode;
}): RenderedInvoiceDocument {
  const { invoice, issuer, pointOfSale, qr } = input;
  if (
    invoice.status !== "AUTHORIZED" ||
    invoice.number == null ||
    !invoice.cae ||
    !invoice.caeExpiresAt ||
    !invoice.authorizedAt
  ) {
    throw new InvoiceDocumentNotRenderableError(invoice.id);
  }

  const title = voucherLabel(invoice.voucherType);
  const formattedNumber = `${pointOfSale.officialCode.padStart(5, "0")}-${String(invoice.number).padStart(8, "0")}`;
  const rows = invoice.lineItems
    .map(
      (line) => `<tr>
        <td>${escapeHtml(line.description)}</td>
        <td class="number">${line.quantity}</td>
        <td class="number">${formatMoney(line.unitNetMinorUnits, invoice.currency)}</td>
        <td class="number">${escapeHtml(line.taxTreatment)}</td>
        <td class="number">${formatMoney(line.grossTotalMinorUnits, invoice.currency)}</td>
      </tr>`,
    )
    .join("");
  const recipient = invoice.recipient;
  const environmentBanner =
    invoice.environment === "HOMOLOGATION"
      ? `<p class="environment">HOMOLOGACIÓN · SIN VALIDEZ FISCAL PRODUCTIVA</p>`
      : "";

  const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} ${escapeHtml(formattedNumber)}</title>
  <style>
    :root{font-family:Arial,sans-serif;color:#15181f;background:#fff}
    body{max-width:900px;margin:0 auto;padding:32px}
    header,.columns,.totals{display:grid;grid-template-columns:1fr 1fr;gap:24px}
    h1{margin:0;font-size:2rem}.environment{padding:10px;border:2px solid #8b1e1e;color:#8b1e1e;font-weight:700}
    table{width:100%;border-collapse:collapse;margin:24px 0}th,td{padding:9px;border-bottom:1px solid #bbb;text-align:left}
    .number{text-align:right}.totals{margin-left:auto;max-width:420px}.totals dt{font-weight:700}.totals dd{text-align:right}
    footer{margin-top:32px;padding-top:16px;border-top:2px solid #15181f;font-size:.85rem;overflow-wrap:anywhere}
  </style>
</head>
<body>
  ${environmentBanner}
  <header>
    <section>
      <p>${escapeHtml(issuer.displayName ?? issuer.legalName)}</p>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(formattedNumber)}</p>
    </section>
    <section>
      <strong>${escapeHtml(issuer.legalName)}</strong>
      <p>CUIT ${escapeHtml(issuer.cuit)}</p>
      <p>${escapeHtml(issuer.taxCondition)}</p>
      ${issuer.fiscalAddress ? `<p>${escapeHtml(issuer.fiscalAddress)}</p>` : ""}
    </section>
  </header>
  <section class="columns">
    <div><strong>Fecha</strong><p>${escapeHtml(invoice.authorizedAt.toISOString())}</p></div>
    <div><strong>Receptor</strong><p>${escapeHtml(recipient?.legalName ?? "Consumidor final")}</p><p>${escapeHtml(recipient?.taxId ?? "")}</p></div>
  </section>
  <table>
    <thead><tr><th>Descripción</th><th class="number">Cantidad</th><th class="number">Neto unitario</th><th class="number">Tratamiento</th><th class="number">Total</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <dl class="totals">
    <dt>Neto</dt><dd>${formatMoney(invoice.totals.netMinorUnits, invoice.currency)}</dd>
    <dt>IVA / impuestos</dt><dd>${formatMoney(invoice.totals.taxAmountMinorUnits, invoice.currency)}</dd>
    <dt>Total</dt><dd><strong>${formatMoney(invoice.totals.grossMinorUnits, invoice.currency)}</strong></dd>
  </dl>
  <footer>
    <p><strong>CAE</strong> ${escapeHtml(invoice.cae)} · vencimiento ${escapeHtml(invoice.caeExpiresAt.toISOString())}</p>
    <p><strong>Referencia de verificación</strong> ${escapeHtml(qr.payloadHash)}</p>
    <p>Documento ${INVOICE_DOCUMENT_FORMAT_VERSION} · norma ${escapeHtml(invoice.normativeVersion)} · QR ${escapeHtml(qr.normativeVersion)}</p>
  </footer>
</body>
</html>`;
  const contentHash = createHash("sha256").update(html).digest("hex");

  return {
    invoiceId: invoice.id,
    fileName: `${invoice.voucherType.toLowerCase()}-${formattedNumber}.html`,
    mediaType: "text/html",
    formatVersion: INVOICE_DOCUMENT_FORMAT_VERSION,
    normativeVersion: invoice.normativeVersion,
    contentHash,
    html,
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatMoney(minorUnits: number, currency: string): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
  }).format(minorUnits / 100);
}

function voucherLabel(voucherType: Invoice["voucherType"]): string {
  return voucherType
    .split("_")
    .map((part) => `${part[0]}${part.slice(1).toLowerCase()}`)
    .join(" ");
}
