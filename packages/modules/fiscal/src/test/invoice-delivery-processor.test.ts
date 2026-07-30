import assert from "node:assert/strict";
import { test } from "node:test";
import {
  processInvoiceDelivery,
  type InvoiceDeliveryDocumentPort,
  type InvoiceEmailSenderPort,
} from "../application/invoice-delivery-processor.js";
import type { OutboxPort, OutboxRecord } from "../application/outbox.js";
import type { InvoiceDeliveryRepositoryPort } from "../application/ports.js";
import type { InvoiceDelivery } from "../domain/invoice-delivery.js";

const NOW = new Date("2026-07-30T15:00:00.000Z");

class DeliveryRepository implements InvoiceDeliveryRepositoryPort {
  item: InvoiceDelivery;

  constructor() {
    this.item = {
      id: "delivery-1",
      tenantId: "tenant-1",
      invoiceId: "invoice-1",
      channel: "EMAIL",
      recipientEmail: "client@example.com",
      format: "PDF",
      idempotencyKey: "key-1",
      status: "QUEUED",
      attempts: 0,
      createdAt: NOW,
      updatedAt: NOW,
    };
  }

  async findById(tenantId: string, id: string) {
    return this.item.tenantId === tenantId && this.item.id === id
      ? this.item
      : null;
  }

  async findByIdempotencyKey(tenantId: string, key: string) {
    return this.item.tenantId === tenantId && this.item.idempotencyKey === key
      ? this.item
      : null;
  }

  async listByInvoice(tenantId: string, invoiceId: string) {
    return this.item.tenantId === tenantId && this.item.invoiceId === invoiceId
      ? [this.item]
      : [];
  }

  async listProcessable(limit: number, staleBefore: Date) {
    return (
      this.item.status === "QUEUED" ||
      this.item.status === "FAILED" ||
      (this.item.status === "PROCESSING" && this.item.updatedAt < staleBefore)
        ? [this.item]
        : []
    ).slice(0, limit);
  }

  async claimForProcessing(
    tenantId: string,
    id: string,
    updatedAt: Date,
    staleBefore: Date,
  ) {
    if (
      this.item.tenantId !== tenantId ||
      this.item.id !== id ||
      (!["QUEUED", "FAILED"].includes(this.item.status) &&
        !(this.item.status === "PROCESSING" && this.item.updatedAt < staleBefore))
    ) {
      return null;
    }
    this.item = { ...this.item, status: "PROCESSING", updatedAt };
    return this.item;
  }

  async save(delivery: InvoiceDelivery) {
    this.item = delivery;
  }
}

class CapturingOutbox implements OutboxPort {
  readonly records: OutboxRecord[] = [];
  async append(record: OutboxRecord) {
    this.records.push(record);
  }
}

const documents: InvoiceDeliveryDocumentPort = {
  async render() {
    return {
      fileName: "invoice.pdf",
      mediaType: "application/pdf",
      content: new Uint8Array([1, 2, 3]),
      contentHash: "hash-1",
    };
  },
};

test("delivery processor claims, sends and makes SENT replay a no-op", async () => {
  const deliveries = new DeliveryRepository();
  const outbox = new CapturingOutbox();
  let sends = 0;
  const sender: InvoiceEmailSenderPort = {
    async send() {
      sends += 1;
      return { providerMessageId: "provider-1" };
    },
  };
  const deps = { deliveries, documents, sender, outbox, now: () => NOW };

  const sent = await processInvoiceDelivery(deps, {
    tenantId: "tenant-1",
    deliveryId: "delivery-1",
  });
  const replay = await processInvoiceDelivery(deps, {
    tenantId: "tenant-1",
    deliveryId: "delivery-1",
  });

  assert.equal(sent.status, "SENT");
  assert.equal(sent.attempts, 1);
  assert.equal(replay.status, "SENT");
  assert.equal(sends, 1);
  assert.equal(outbox.records.length, 1);
  assert.equal(outbox.records[0]!.eventName, "fiscal.invoice-delivery.sent.v1");
  assert.doesNotMatch(JSON.stringify(outbox.records[0]!.payload), /client@/);
});

test("delivery processor records a redacted failure and permits retry", async () => {
  const deliveries = new DeliveryRepository();
  const outbox = new CapturingOutbox();
  let shouldFail = true;
  const sender: InvoiceEmailSenderPort = {
    async send() {
      if (shouldFail) throw new Error("SMTP leaked-client@example.com");
      return { providerMessageId: "provider-2" };
    },
  };
  const deps = { deliveries, documents, sender, outbox, now: () => NOW };

  const failed = await processInvoiceDelivery(deps, {
    tenantId: "tenant-1",
    deliveryId: "delivery-1",
  });
  shouldFail = false;
  const retried = await processInvoiceDelivery(deps, {
    tenantId: "tenant-1",
    deliveryId: "delivery-1",
  });

  assert.equal(failed.status, "FAILED");
  assert.equal(failed.failureReason, "Error");
  assert.equal(retried.status, "SENT");
  assert.equal(retried.attempts, 2);
  assert.equal(outbox.records.length, 2);
});
