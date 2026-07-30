export type InvoiceDeliveryStatus = "QUEUED" | "SENT" | "FAILED";
export type InvoiceDeliveryFormat = "PDF" | "HTML";

export interface InvoiceDelivery {
  id: string;
  tenantId: string;
  invoiceId: string;
  channel: "EMAIL";
  recipientEmail: string;
  format: InvoiceDeliveryFormat;
  idempotencyKey: string;
  status: InvoiceDeliveryStatus;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
  sentAt?: Date | null;
  failureReason?: string | null;
}
