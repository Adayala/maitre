import type {
  InvoiceEmailSenderPort,
  InvoiceDeliveryAttachment,
} from "../application/invoice-delivery-processor.js";

export interface EmailHttpTransport {
  fetch(input: string, init: RequestInit): Promise<Response>;
}

export class ResendInvoiceEmailSender implements InvoiceEmailSenderPort {
  constructor(
    private readonly config: {
      apiKey: string;
      from: string;
      transport?: EmailHttpTransport;
    },
  ) {}

  async send(input: {
    deliveryId: string;
    recipientEmail: string;
    attachment: InvoiceDeliveryAttachment;
  }): Promise<{ providerMessageId: string }> {
    const response = await (this.config.transport ?? globalThis).fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `invoice-delivery/${input.deliveryId}`,
          "User-Agent": "maitre-fiscal/1.0",
        },
        body: JSON.stringify({
          from: this.config.from,
          to: [input.recipientEmail],
          subject: input.attachment.emailSubject ?? "Tu comprobante fiscal",
          html:
            input.attachment.emailHtml ??
            "<p>Adjuntamos tu comprobante fiscal.</p>",
          text:
            input.attachment.emailText ??
            "Adjuntamos tu comprobante fiscal.",
          attachments: [
            {
              filename: input.attachment.fileName,
              content: Buffer.from(input.attachment.content).toString("base64"),
            },
          ],
          tags: [{ name: "delivery_id", value: input.deliveryId }],
        }),
      },
    );
    const body = (await response.json().catch(() => ({}))) as {
      id?: string;
      message?: string;
    };
    if (!response.ok || !body.id) {
      throw new ResendEmailError(response.status, body.message);
    }
    return { providerMessageId: body.id };
  }
}

export class ResendEmailError extends Error {
  constructor(status: number, providerMessage?: string) {
    super(`Resend email request failed with status ${status}`);
    this.name = "ResendEmailError";
    this.cause = providerMessage ? new Error(providerMessage) : undefined;
  }
}
