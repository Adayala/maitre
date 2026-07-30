export type InvoiceDeliveryStatus = "QUEUED" | "PROCESSING" | "SENT" | "FAILED";
export type InvoiceDeliveryFormat = "PDF" | "HTML";

export interface InvoiceDelivery {
  id: string;
  tenantId: string;
  invoiceId: string;
  channel: "EMAIL";
  recipientEmail: string | null;
  format: InvoiceDeliveryFormat;
  idempotencyKey: string;
  status: InvoiceDeliveryStatus;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
  sentAt?: Date | null;
  failureReason?: string | null;
  redactedAt?: Date | null;
}

export interface InvoiceDeliverySummary {
  tenantId: string;
  total: number;
  queued: number;
  processing: number;
  sent: number;
  failed: number;
  oldestPendingAt: Date | null;
}
