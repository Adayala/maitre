import { randomUUID } from "node:crypto";
import type {
  InvoiceDelivery,
  InvoiceDeliveryFormat,
} from "../domain/invoice-delivery.js";
import type { InvoiceRepositoryPort, InvoiceDeliveryRepositoryPort } from "./ports.js";
import type { OutboxPort, OutboxRecord } from "./outbox.js";
import { InvoiceDocumentNotRenderableError } from "./invoice-document.js";

export interface InvoiceDeliveryDeps {
  invoices: InvoiceRepositoryPort;
  deliveries: InvoiceDeliveryRepositoryPort;
  outbox: OutboxPort;
  now?: () => Date;
}

export async function queueInvoiceEmailDelivery(
  deps: InvoiceDeliveryDeps,
  input: {
    tenantId: string;
    invoiceId: string;
    recipientEmail: string;
    format: InvoiceDeliveryFormat;
    idempotencyKey: string;
    correlationId?: string;
  },
): Promise<{ delivery: InvoiceDelivery; created: boolean }> {
  const existing = await deps.deliveries.findByIdempotencyKey(
    input.tenantId,
    input.idempotencyKey,
  );
  if (existing) {
    if (
      existing.invoiceId !== input.invoiceId ||
      existing.recipientEmail !== normalizeEmail(input.recipientEmail) ||
      existing.format !== input.format
    ) {
      throw new InvoiceDeliveryIdempotencyConflictError(input.idempotencyKey);
    }
    return { delivery: existing, created: false };
  }

  const invoice = await deps.invoices.findById(input.tenantId, input.invoiceId);
  if (!invoice) throw new Error(`Invoice ${input.invoiceId} not found`);
  if (invoice.status !== "AUTHORIZED") {
    throw new InvoiceDocumentNotRenderableError(invoice.id);
  }

  const now = (deps.now ?? (() => new Date()))();
  const delivery: InvoiceDelivery = {
    id: randomUUID(),
    tenantId: input.tenantId,
    invoiceId: invoice.id,
    channel: "EMAIL",
    recipientEmail: normalizeEmail(input.recipientEmail),
    format: input.format,
    idempotencyKey: input.idempotencyKey,
    status: "QUEUED",
    attempts: 0,
    createdAt: now,
    updatedAt: now,
  };
  await deps.deliveries.save(delivery);
  await deps.outbox.append(invoiceDeliveryQueuedEvent(
    delivery,
    input.correlationId ?? randomUUID(),
  ));
  return { delivery, created: true };
}

export class InvoiceDeliveryIdempotencyConflictError extends Error {
  constructor(key: string) {
    super(`Idempotency key ${key} was already used with a different delivery request`);
    this.name = "InvoiceDeliveryIdempotencyConflictError";
  }
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function invoiceDeliveryQueuedEvent(
  delivery: InvoiceDelivery,
  correlationId: string,
): OutboxRecord {
  return {
    eventId: randomUUID(),
    eventName: "fiscal.invoice-delivery.queued.v1",
    eventVersion: 1,
    occurredAt: delivery.createdAt,
    producer: "fiscal",
    tenantId: delivery.tenantId,
    aggregateType: "InvoiceDelivery",
    aggregateId: delivery.id,
    correlationId,
    payload: {
      tenantId: delivery.tenantId,
      deliveryId: delivery.id,
      invoiceId: delivery.invoiceId,
      channel: delivery.channel,
      format: delivery.format,
    },
    status: "PENDING",
    attempts: 0,
  };
}
