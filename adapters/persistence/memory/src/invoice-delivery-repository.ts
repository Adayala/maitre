import type {
  InvoiceDelivery,
  InvoiceDeliveryRepositoryPort,
} from "@maitre/fiscal";

export class InMemoryInvoiceDeliveryRepository
  implements InvoiceDeliveryRepositoryPort
{
  private readonly byId = new Map<string, InvoiceDelivery>();

  async findById(tenantId: string, id: string) {
    const item = this.byId.get(id);
    return item?.tenantId === tenantId ? item : null;
  }

  async findByIdempotencyKey(tenantId: string, idempotencyKey: string) {
    return (
      [...this.byId.values()].find(
        (item) =>
          item.tenantId === tenantId &&
          item.idempotencyKey === idempotencyKey,
      ) ?? null
    );
  }

  async listByInvoice(tenantId: string, invoiceId: string) {
    return [...this.byId.values()].filter(
      (item) => item.tenantId === tenantId && item.invoiceId === invoiceId,
    );
  }

  async listProcessable(limit: number, staleBefore: Date) {
    return [...this.byId.values()]
      .filter(
        (item) =>
          item.status === "QUEUED" ||
          item.status === "FAILED" ||
          (item.status === "PROCESSING" && item.updatedAt < staleBefore),
      )
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .slice(0, limit);
  }

  async getSummary(tenantId: string) {
    const items = [...this.byId.values()].filter(
      (item) => item.tenantId === tenantId,
    );
    const pending = items
      .filter((item) => item.status === "QUEUED" || item.status === "PROCESSING")
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    return {
      tenantId,
      total: items.length,
      queued: items.filter((item) => item.status === "QUEUED").length,
      processing: items.filter((item) => item.status === "PROCESSING").length,
      sent: items.filter((item) => item.status === "SENT").length,
      failed: items.filter((item) => item.status === "FAILED").length,
      oldestPendingAt: pending[0]?.createdAt ?? null,
    };
  }

  async claimForProcessing(
    tenantId: string,
    id: string,
    updatedAt: Date,
    staleBefore: Date,
  ) {
    const item = await this.findById(tenantId, id);
    if (
      !item ||
      (item.status !== "QUEUED" &&
        item.status !== "FAILED" &&
        !(item.status === "PROCESSING" && item.updatedAt < staleBefore))
    ) {
      return null;
    }
    const claimed: InvoiceDelivery = {
      ...item,
      status: "PROCESSING",
      updatedAt,
    };
    this.byId.set(id, claimed);
    return claimed;
  }

  async redactSentBefore(cutoff: Date, redactedAt: Date, limit: number) {
    const candidates = [...this.byId.values()]
      .filter(
        (item) =>
          item.status === "SENT" &&
          item.recipientEmail !== null &&
          item.sentAt !== null &&
          item.sentAt !== undefined &&
          item.sentAt <= cutoff,
      )
      .sort(
        (a, b) =>
          (a.sentAt?.getTime() ?? 0) - (b.sentAt?.getTime() ?? 0),
      )
      .slice(0, limit);
    for (const item of candidates) {
      this.byId.set(item.id, {
        ...item,
        recipientEmail: null,
        redactedAt,
        updatedAt: redactedAt,
      });
    }
    return candidates.length;
  }

  async save(delivery: InvoiceDelivery) {
    this.byId.set(delivery.id, delivery);
  }
}
