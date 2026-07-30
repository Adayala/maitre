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

  async save(delivery: InvoiceDelivery) {
    this.byId.set(delivery.id, delivery);
  }
}
