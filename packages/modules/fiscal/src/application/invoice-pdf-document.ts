import { createHash } from "node:crypto";
import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import type { FiscalQrCode } from "../domain/fiscal-qr-code.js";
import type { Invoice } from "../domain/invoice.js";
import {
  InvoiceDocumentNotRenderableError,
  type InvoiceDocumentIssuer,
  type InvoiceDocumentPointOfSale,
} from "./invoice-document.js";

export const INVOICE_PDF_FORMAT_VERSION = "pdf-v1";

export interface RenderedInvoicePdfDocument {
  invoiceId: string;
  fileName: string;
  mediaType: "application/pdf";
  formatVersion: string;
  normativeVersion: string;
  contentHash: string;
  bytes: Uint8Array;
}

export async function renderAuthorizedInvoicePdfDocument(input: {
  invoice: Invoice;
  issuer: InvoiceDocumentIssuer;
  pointOfSale: InvoiceDocumentPointOfSale;
  qr: FiscalQrCode;
}): Promise<RenderedInvoicePdfDocument> {
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

  const formattedNumber = `${pointOfSale.officialCode.padStart(5, "0")}-${String(invoice.number).padStart(8, "0")}`;
  const title = voucherLabel(invoice.voucherType);
  const pdf = await PDFDocument.create();
  const stableDate = invoice.authorizedAt;
  pdf.setTitle(`${title} ${formattedNumber}`);
  pdf.setAuthor(issuer.legalName);
  pdf.setSubject(`Comprobante fiscal ${invoice.normativeVersion}`);
  pdf.setCreator(`Maitre ${INVOICE_PDF_FORMAT_VERSION}`);
  pdf.setProducer(`Maitre ${INVOICE_PDF_FORMAT_VERSION}`);
  pdf.setCreationDate(stableDate);
  pdf.setModificationDate(stableDate);

  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page = pdf.addPage([595.28, 841.89]);
  let y = 800;
  const left = 42;

  const line = (
    text: string,
    options?: { font?: PDFFont; size?: number; color?: ReturnType<typeof rgb> },
  ) => {
    const size = options?.size ?? 10;
    if (y < 55) {
      page = pdf.addPage([595.28, 841.89]);
      y = 800;
    }
    page.drawText(pdfSafe(text), {
      x: left,
      y,
      size,
      font: options?.font ?? regular,
      color: options?.color ?? rgb(0.08, 0.09, 0.12),
    });
    y -= size + 7;
  };

  if (invoice.environment === "HOMOLOGATION") {
    line("HOMOLOGACION - SIN VALIDEZ FISCAL PRODUCTIVA", {
      font: bold,
      size: 12,
      color: rgb(0.55, 0.08, 0.08),
    });
    y -= 5;
  }
  line(issuer.displayName ?? issuer.legalName, { font: bold, size: 16 });
  line(`${title}  ${formattedNumber}`, { font: bold, size: 20 });
  line(`${issuer.legalName} - CUIT ${issuer.cuit} - ${issuer.taxCondition}`);
  if (issuer.fiscalAddress) line(issuer.fiscalAddress);
  if (pointOfSale.domicileLabel)
    line(`Punto de venta: ${pointOfSale.domicileLabel}`);
  y -= 8;
  line(`Fecha: ${invoice.authorizedAt.toISOString()}`);
  line(
    `Receptor: ${invoice.recipient?.legalName ?? "Consumidor final"} ${invoice.recipient?.taxId ?? ""}`.trim(),
  );
  y -= 10;
  line("Detalle", { font: bold, size: 12 });
  for (const item of invoice.lineItems) {
    for (const wrapped of wrapText(
      `${item.quantity} x ${item.description} | ${formatMoney(item.unitNetMinorUnits, invoice.currency)} | ${item.taxTreatment} | ${formatMoney(item.grossTotalMinorUnits, invoice.currency)}`,
      regular,
      9,
      505,
    )) {
      line(wrapped, { size: 9 });
    }
  }
  y -= 8;
  line(`Neto: ${formatMoney(invoice.totals.netMinorUnits, invoice.currency)}`, {
    font: bold,
  });
  line(
    `IVA / impuestos: ${formatMoney(invoice.totals.taxAmountMinorUnits, invoice.currency)}`,
    {
      font: bold,
    },
  );
  line(
    `TOTAL: ${formatMoney(invoice.totals.grossMinorUnits, invoice.currency)}`,
    {
      font: bold,
      size: 14,
    },
  );
  y -= 10;
  line(
    `CAE ${invoice.cae} - vencimiento ${invoice.caeExpiresAt.toISOString()}`,
    { font: bold },
  );
  line(`Referencia de verificacion: ${qr.payloadHash}`, { size: 8 });
  line(
    `Documento ${INVOICE_PDF_FORMAT_VERSION} - norma ${invoice.normativeVersion} - QR ${qr.normativeVersion}`,
    { size: 8 },
  );

  const bytes = await pdf.save({ useObjectStreams: false });
  return {
    invoiceId: invoice.id,
    fileName: `${invoice.voucherType.toLowerCase()}-${formattedNumber}.pdf`,
    mediaType: "application/pdf",
    formatVersion: INVOICE_PDF_FORMAT_VERSION,
    normativeVersion: invoice.normativeVersion,
    contentHash: createHash("sha256").update(bytes).digest("hex"),
    bytes,
  };
}

function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
): string[] {
  const words = pdfSafe(text).split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function pdfSafe(value: string): string {
  return value.normalize("NFKD").replace(/[^\x20-\x7e]/g, "");
}

function formatMoney(minorUnits: number, currency: string): string {
  return `${currency} ${(minorUnits / 100).toFixed(2)}`;
}

function voucherLabel(voucherType: Invoice["voucherType"]): string {
  return voucherType
    .split("_")
    .map((part) => `${part[0]}${part.slice(1).toLowerCase()}`)
    .join(" ");
}
