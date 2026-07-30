import assert from "node:assert/strict";
import { test } from "node:test";
import type { InvoiceDelivery } from "@maitre/fiscal";
import { InMemoryInvoiceDeliveryRepository } from "../invoice-delivery-repository.js";

const NOW = new Date("2026-07-30T18:00:00.000Z");

function delivery(
  id: string,
  status: InvoiceDelivery["status"],
  sentAt?: Date,
): InvoiceDelivery {
  return {
    id,
    tenantId: "tenant-1",
    invoiceId: `invoice-${id}`,
    channel: "EMAIL",
    recipientEmail: `${id}@example.com`,
    format: "PDF",
    idempotencyKey: `key-${id}`,
    status,
    attempts: status === "SENT" ? 1 : 0,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...(sentAt ? { sentAt } : {}),
  };
}

test("delivery retention redacts only the oldest eligible SENT records", async () => {
  const repository = new InMemoryInvoiceDeliveryRepository();
  await repository.save(delivery("old", "SENT", new Date("2026-06-01")));
  await repository.save(delivery("new", "SENT", new Date("2026-07-20")));
  await repository.save(delivery("failed", "FAILED"));

  const redacted = await repository.redactSentBefore(
    new Date("2026-07-01"),
    NOW,
    1,
  );

  assert.equal(redacted, 1);
  assert.equal(
    (await repository.findById("tenant-1", "old"))?.recipientEmail,
    null,
  );
  assert.equal(
    (await repository.findById("tenant-1", "old"))?.redactedAt,
    NOW,
  );
  assert.equal(
    (await repository.findById("tenant-1", "new"))?.recipientEmail,
    "new@example.com",
  );
  assert.equal(
    (await repository.findById("tenant-1", "failed"))?.recipientEmail,
    "failed@example.com",
  );
});
