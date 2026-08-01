// SPEC-142 — InvoiceTemplate. Versioned presentation, separate from the
// mandatory fiscal content. Simple CRUD with a DRAFT -> PUBLISHED -> DEACTIVATED
// lifecycle; publish freezes the template.
//
// EMAIL content uses a constrained variable allowlist and escaped generated
// HTML. Arbitrary template-driven HTML/CSS and remote assets remain unsupported.
// Preview always uses synthetic data and never touches customer/CAE/token data.

export type InvoiceTemplateStatus = "DRAFT" | "PUBLISHED" | "DEACTIVATED";

export interface InvoiceTemplate {
  id: string;
  tenantId: string;
  brandId?: string | null;
  name: string;
  channel: string;
  status: InvoiceTemplateStatus;
  contentRef: string; // opaque placeholder
  variableSchemaVersion: number;
  layoutNormativeVersion: string;
  publishedAt?: Date | null;
  publishedBy?: string | null;
  revision: number;
  createdAt: Date;
  updatedAt: Date;
}

const allowedTransitions: Record<
  InvoiceTemplateStatus,
  InvoiceTemplateStatus[]
> = {
  DRAFT: ["PUBLISHED", "DEACTIVATED"],
  PUBLISHED: ["DEACTIVATED"],
  DEACTIVATED: [],
};

export class InvalidInvoiceTemplateTransitionError extends Error {
  constructor(from: InvoiceTemplateStatus, to: InvoiceTemplateStatus) {
    super(`InvoiceTemplate cannot transition from ${from} to ${to}`);
    this.name = "InvalidInvoiceTemplateTransitionError";
  }
}

export function assertTemplateTransition(
  from: InvoiceTemplateStatus,
  to: InvoiceTemplateStatus,
): void {
  if (!allowedTransitions[from].includes(to)) {
    throw new InvalidInvoiceTemplateTransitionError(from, to);
  }
}

export interface InvoiceTemplatePreview {
  templateId: string;
  status: InvoiceTemplateStatus;
  renderedPlaceholder: string;
  fixtureOnly: true;
}
