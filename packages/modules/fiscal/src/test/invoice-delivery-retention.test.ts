import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEFAULT_INVOICE_DELIVERY_PII_RETENTION_DAYS,
  InvalidInvoiceDeliveryRetentionPolicyError,
  MAX_INVOICE_DELIVERY_RETENTION_BATCH,
  redactExpiredInvoiceDeliveryPii,
} from "../application/invoice-delivery-retention.js";

const NOW = new Date("2026-07-30T18:00:00.000Z");

test("retention delegates a deterministic default cutoff and bounded batch", async () => {
  let captured: { cutoff: Date; redactedAt: Date; limit: number } | undefined;
  const result = await redactExpiredInvoiceDeliveryPii(
    {
      deliveries: {
        async redactSentBefore(
          cutoff: Date,
          redactedAt: Date,
          limit: number,
        ) {
          captured = { cutoff, redactedAt, limit };
          return 7;
        },
      } as never,
      now: () => NOW,
    },
  );

  assert.equal(result.redacted, 7);
  assert.equal(result.cutoff.toISOString(), "2026-06-30T18:00:00.000Z");
  assert.equal(captured?.redactedAt, NOW);
  assert.equal(captured?.limit, MAX_INVOICE_DELIVERY_RETENTION_BATCH);
  assert.equal(DEFAULT_INVOICE_DELIVERY_PII_RETENTION_DAYS, 30);
});

test("retention accepts an explicit policy", async () => {
  const result = await redactExpiredInvoiceDeliveryPii(
    {
      deliveries: {
        async redactSentBefore() {
          return 1;
        },
      } as never,
      now: () => NOW,
    },
    { retentionDays: 2, limit: 10 },
  );
  assert.equal(result.cutoff.toISOString(), "2026-07-28T18:00:00.000Z");
});

test("retention rejects unsafe policy and batch values", async () => {
  const deps = { deliveries: {} as never, now: () => NOW };
  await assert.rejects(
    redactExpiredInvoiceDeliveryPii(deps, { retentionDays: 0 }),
    InvalidInvoiceDeliveryRetentionPolicyError,
  );
  await assert.rejects(
    redactExpiredInvoiceDeliveryPii(deps, {
      limit: MAX_INVOICE_DELIVERY_RETENTION_BATCH + 1,
    }),
    InvalidInvoiceDeliveryRetentionPolicyError,
  );
});
