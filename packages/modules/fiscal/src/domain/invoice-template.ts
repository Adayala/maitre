// SPEC-142 — InvoiceTemplate. Versioned presentation, separate from the
// mandatory fiscal content. Simple CRUD with a DRAFT -> PUBLISHED -> DEACTIVATED
// lifecycle; publish freezes the template.
//
// DEFERRED (documented): the actual HTML/CSS rendering engine, the typed
// variable allowlist, asset sanitization and length limits. `contentRef` is an
// opaque string and `variableSchemaVersion` is a plain int. `preview` returns a
// canned synthetic-fixture placeholder — it never renders real content and never
// touches real customer/CAE/token data.

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

const allowedTransitions: Record<InvoiceTemplateStatus, InvoiceTemplateStatus[]> = {
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

export function assertTemplateTransition(from: InvoiceTemplateStatus, to: InvoiceTemplateStatus): void {
  if (!allowedTransitions[from].includes(to)) {
    throw new InvalidInvoiceTemplateTransitionError(from, to);
  }
}

export interface InvoiceTemplatePreview {
  templateId: string;
  status: InvoiceTemplateStatus;
  // Canned synthetic-fixture placeholder — NOT a real render (deferred).
  renderedPlaceholder: string;
  fixtureOnly: true;
}
