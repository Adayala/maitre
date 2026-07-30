import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ResendEmailError,
  ResendInvoiceEmailSender,
  type EmailHttpTransport,
} from "../adapters/resend-email-sender.js";

test("Resend sender sends a base64 attachment with provider idempotency", async () => {
  let captured: { input: string; init: RequestInit } | undefined;
  const transport: EmailHttpTransport = {
    async fetch(input, init) {
      captured = { input, init };
      return new Response(JSON.stringify({ id: "email-123" }), { status: 200 });
    },
  };
  const sender = new ResendInvoiceEmailSender({
    apiKey: "test-key",
    from: "Maitre <facturas@example.com>",
    transport,
  });
  const result = await sender.send({
    deliveryId: "delivery-1",
    recipientEmail: "client@example.com",
    attachment: {
      fileName: "invoice.pdf",
      mediaType: "application/pdf",
      content: new Uint8Array([1, 2, 3]),
      contentHash: "hash-1",
    },
  });

  assert.equal(result.providerMessageId, "email-123");
  assert.equal(captured?.input, "https://api.resend.com/emails");
  const headers = captured?.init.headers as Record<string, string>;
  assert.equal(headers["Idempotency-Key"], "invoice-delivery/delivery-1");
  assert.equal(headers["User-Agent"], "maitre-fiscal/1.0");
  const body = JSON.parse(String(captured?.init.body));
  assert.equal(body.attachments[0].content, "AQID");
  assert.equal(body.to[0], "client@example.com");
});

test("Resend sender exposes only a classified provider failure", async () => {
  const sender = new ResendInvoiceEmailSender({
    apiKey: "test-key",
    from: "facturas@example.com",
    transport: {
      async fetch() {
        return new Response(
          JSON.stringify({ message: "recipient client@example.com rejected" }),
          { status: 422 },
        );
      },
    },
  });

  await assert.rejects(
    sender.send({
      deliveryId: "delivery-1",
      recipientEmail: "client@example.com",
      attachment: {
        fileName: "invoice.pdf",
        mediaType: "application/pdf",
        content: new Uint8Array(),
        contentHash: "hash-1",
      },
    }),
    (error: unknown) =>
      error instanceof ResendEmailError &&
      error.message === "Resend email request failed with status 422",
  );
});
