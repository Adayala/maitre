import type { InvoiceDeliveryRepositoryPort } from "./ports.js";

export const DEFAULT_INVOICE_DELIVERY_PII_RETENTION_DAYS = 30;
export const MAX_INVOICE_DELIVERY_RETENTION_BATCH = 500;

export interface InvoiceDeliveryRetentionDeps {
  deliveries: InvoiceDeliveryRepositoryPort;
  now?: () => Date;
}

export interface InvoiceDeliveryRetentionInput {
  retentionDays?: number;
  limit?: number;
}

export interface InvoiceDeliveryRetentionResult {
  cutoff: Date;
  redacted: number;
}

export async function redactExpiredInvoiceDeliveryPii(
  deps: InvoiceDeliveryRetentionDeps,
  input: InvoiceDeliveryRetentionInput = {},
): Promise<InvoiceDeliveryRetentionResult> {
  const retentionDays =
    input.retentionDays ?? DEFAULT_INVOICE_DELIVERY_PII_RETENTION_DAYS;
  const limit = input.limit ?? MAX_INVOICE_DELIVERY_RETENTION_BATCH;
  if (!Number.isInteger(retentionDays) || retentionDays < 1) {
    throw new InvalidInvoiceDeliveryRetentionPolicyError(
      "retentionDays must be a positive integer",
    );
  }
  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > MAX_INVOICE_DELIVERY_RETENTION_BATCH
  ) {
    throw new InvalidInvoiceDeliveryRetentionPolicyError(
      `limit must be between 1 and ${MAX_INVOICE_DELIVERY_RETENTION_BATCH}`,
    );
  }

  const now = (deps.now ?? (() => new Date()))();
  const cutoff = new Date(
    now.getTime() - retentionDays * 24 * 60 * 60 * 1000,
  );
  const redacted = await deps.deliveries.redactSentBefore(cutoff, now, limit);
  return { cutoff, redacted };
}

export class InvalidInvoiceDeliveryRetentionPolicyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidInvoiceDeliveryRetentionPolicyError";
  }
}
