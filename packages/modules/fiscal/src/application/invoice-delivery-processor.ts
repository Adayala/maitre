import { randomUUID } from "node:crypto";
import type {
  InvoiceDelivery,
  InvoiceDeliveryFormat,
} from "../domain/invoice-delivery.js";
import type { InvoiceDeliveryRepositoryPort } from "./ports.js";
import type { OutboxPort, OutboxRecord } from "./outbox.js";

export interface InvoiceDeliveryAttachment {
  fileName: string;
  mediaType: "application/pdf" | "text/html";
  content: Uint8Array;
  contentHash: string;
  emailSubject?: string;
  emailText?: string;
  emailHtml?: string;
}

export interface InvoiceDeliveryDocumentPort {
  render(input: {
    tenantId: string;
    invoiceId: string;
    format: InvoiceDeliveryFormat;
  }): Promise<InvoiceDeliveryAttachment>;
}

export interface InvoiceEmailSenderPort {
  send(input: {
    deliveryId: string;
    recipientEmail: string;
    attachment: InvoiceDeliveryAttachment;
  }): Promise<{ providerMessageId: string }>;
}

export async function processInvoiceDelivery(
  deps: {
    deliveries: InvoiceDeliveryRepositoryPort;
    documents: InvoiceDeliveryDocumentPort;
    sender: InvoiceEmailSenderPort;
    outbox: OutboxPort;
    now?: () => Date;
  },
  input: { tenantId: string; deliveryId: string; correlationId?: string },
): Promise<InvoiceDelivery> {
  const current = await deps.deliveries.findById(
    input.tenantId,
    input.deliveryId,
  );
  if (!current) throw new Error(`InvoiceDelivery ${input.deliveryId} not found`);
  if (current.status === "SENT") return current;

  const now = (deps.now ?? (() => new Date()))();
  const claimed = await deps.deliveries.claimForProcessing(
    input.tenantId,
    input.deliveryId,
    now,
    new Date(now.getTime() - 5 * 60_000),
  );
  if (!claimed) {
    throw new InvoiceDeliveryAlreadyProcessingError(input.deliveryId);
  }

  try {
    const attachment = await deps.documents.render({
      tenantId: claimed.tenantId,
      invoiceId: claimed.invoiceId,
      format: claimed.format,
    });
    const result = await deps.sender.send({
      deliveryId: claimed.id,
      recipientEmail: claimed.recipientEmail,
      attachment,
    });
    const sent: InvoiceDelivery = {
      ...claimed,
      status: "SENT",
      attempts: claimed.attempts + 1,
      sentAt: now,
      failureReason: null,
      updatedAt: now,
    };
    await deps.deliveries.save(sent);
    await deps.outbox.append(
      deliveryResultEvent(sent, input.correlationId, {
        outcome: "SENT",
        providerMessageId: result.providerMessageId,
        contentHash: attachment.contentHash,
      }),
    );
    return sent;
  } catch (cause) {
    const failed: InvoiceDelivery = {
      ...claimed,
      status: "FAILED",
      attempts: claimed.attempts + 1,
      failureReason: safeFailureReason(cause),
      updatedAt: now,
    };
    await deps.deliveries.save(failed);
    await deps.outbox.append(
      deliveryResultEvent(failed, input.correlationId, { outcome: "FAILED" }),
    );
    return failed;
  }
}

export async function processInvoiceDeliveryBatch(
  deps: Parameters<typeof processInvoiceDelivery>[0],
  input: { limit: number; correlationId?: string },
): Promise<{ claimed: number; sent: number; failed: number }> {
  const limit = Math.max(1, Math.min(input.limit, 25));
  const now = (deps.now ?? (() => new Date()))();
  const candidates = await deps.deliveries.listProcessable(
    limit,
    new Date(now.getTime() - 5 * 60_000),
  );
  let sent = 0;
  let failed = 0;
  for (const candidate of candidates) {
    try {
      const result = await processInvoiceDelivery(deps, {
        tenantId: candidate.tenantId,
        deliveryId: candidate.id,
        ...(input.correlationId ? { correlationId: input.correlationId } : {}),
      });
      if (result.status === "SENT") sent += 1;
      else if (result.status === "FAILED") failed += 1;
    } catch (error) {
      if (!(error instanceof InvoiceDeliveryAlreadyProcessingError)) throw error;
    }
  }
  return { claimed: candidates.length, sent, failed };
}

export class InvoiceDeliveryAlreadyProcessingError extends Error {
  constructor(id: string) {
    super(`InvoiceDelivery ${id} is already being processed`);
    this.name = "InvoiceDeliveryAlreadyProcessingError";
  }
}

function safeFailureReason(cause: unknown): string {
  if (!(cause instanceof Error)) return "Delivery provider failed";
  return cause.name.slice(0, 120);
}

function deliveryResultEvent(
  delivery: InvoiceDelivery,
  correlationId: string | undefined,
  payload: Record<string, unknown>,
): OutboxRecord {
  return {
    eventId: randomUUID(),
    eventName: `fiscal.invoice-delivery.${delivery.status.toLowerCase()}.v1`,
    eventVersion: 1,
    occurredAt: delivery.updatedAt,
    producer: "fiscal",
    tenantId: delivery.tenantId,
    aggregateType: "InvoiceDelivery",
    aggregateId: delivery.id,
    correlationId: correlationId ?? randomUUID(),
    payload: {
      tenantId: delivery.tenantId,
      deliveryId: delivery.id,
      invoiceId: delivery.invoiceId,
      attempts: delivery.attempts,
      ...payload,
    },
    status: "PENDING",
    attempts: 0,
  };
}
