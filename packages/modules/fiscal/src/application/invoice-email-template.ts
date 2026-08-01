import type { InvoiceTemplate } from "../domain/invoice-template.js";

export const EMAIL_TEMPLATE_CONTENT_PREFIX = "inline-email-v1:";
export const EMAIL_TEMPLATE_VARIABLES = [
  "issuerName",
  "voucherType",
  "voucherNumber",
  "total",
  "currency",
  "environment",
] as const;

type VariableName = (typeof EMAIL_TEMPLATE_VARIABLES)[number];

export interface InvoiceEmailTemplateContent {
  subject: string;
  text: string;
}

export interface InvoiceEmailTemplateValues {
  issuerName: string;
  voucherType: string;
  voucherNumber: string;
  total: string;
  currency: string;
  environment: string;
}

export function encodeInvoiceEmailTemplate(
  content: InvoiceEmailTemplateContent,
): string {
  validateContent(content);
  return `${EMAIL_TEMPLATE_CONTENT_PREFIX}${Buffer.from(
    JSON.stringify(content),
  ).toString("base64url")}`;
}

export function decodeInvoiceEmailTemplate(
  contentRef: string,
): InvoiceEmailTemplateContent {
  if (!contentRef.startsWith(EMAIL_TEMPLATE_CONTENT_PREFIX)) {
    throw new InvalidInvoiceEmailTemplateError("Unsupported email template format");
  }
  try {
    const parsed = JSON.parse(
      Buffer.from(
        contentRef.slice(EMAIL_TEMPLATE_CONTENT_PREFIX.length),
        "base64url",
      ).toString("utf8"),
    ) as InvoiceEmailTemplateContent;
    validateContent(parsed);
    return parsed;
  } catch (error) {
    if (error instanceof InvalidInvoiceEmailTemplateError) throw error;
    throw new InvalidInvoiceEmailTemplateError("Invalid encoded email template");
  }
}

export function renderInvoiceEmailTemplate(
  template: InvoiceTemplate | null,
  values: InvoiceEmailTemplateValues,
): { subject: string; text: string; html: string; templateId: string | null } {
  const content =
    template && template.channel === "EMAIL" && template.status === "PUBLISHED"
      ? decodeInvoiceEmailTemplate(template.contentRef)
      : {
          subject: "Tu comprobante fiscal {{voucherType}}",
          text:
            "{{issuerName}} adjunta el comprobante {{voucherType}} {{voucherNumber}} por {{currency}} {{total}}.",
        };
  const subject = interpolate(content.subject, values)
    .replace(/[\r\n]+/g, " ")
    .slice(0, 200);
  const text = interpolate(content.text, values);
  return {
    subject,
    text,
    html: `<p>${escapeHtml(text).replaceAll("\n", "<br>")}</p>`,
    templateId: template?.id ?? null,
  };
}

export class InvalidInvoiceEmailTemplateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidInvoiceEmailTemplateError";
  }
}

function validateContent(content: InvoiceEmailTemplateContent): void {
  if (
    !content ||
    typeof content.subject !== "string" ||
    typeof content.text !== "string" ||
    content.subject.length < 1 ||
    content.subject.length > 200 ||
    content.text.length < 1 ||
    content.text.length > 4_000
  ) {
    throw new InvalidInvoiceEmailTemplateError("Invalid email template lengths");
  }
  for (const source of [content.subject, content.text]) {
    for (const match of source.matchAll(/\{\{([^}]+)\}\}/g)) {
      if (!EMAIL_TEMPLATE_VARIABLES.includes(match[1] as VariableName)) {
        throw new InvalidInvoiceEmailTemplateError(
          `Unknown email template variable ${match[1]}`,
        );
      }
    }
  }
}

function interpolate(source: string, values: InvoiceEmailTemplateValues): string {
  return source.replace(/\{\{([^}]+)\}\}/g, (_match, variable: VariableName) =>
    String(values[variable]),
  );
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
