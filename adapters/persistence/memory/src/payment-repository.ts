import type { Payment, PaymentRepositoryPort } from "@maitre/floor";

export class InMemoryPaymentRepository implements PaymentRepositoryPort {
  private readonly byId = new Map<string, Payment>();

  async findById(tenantId: string, id: string): Promise<Payment | null> {
    const payment = this.byId.get(id);
    return payment && payment.tenantId === tenantId ? payment : null;
  }

  async findByIdempotencyKey(tenantId: string, idempotencyKey: string): Promise<Payment | null> {
    return (
      [...this.byId.values()].find(
        (p) => p.tenantId === tenantId && p.idempotencyKey === idempotencyKey,
      ) ?? null
    );
  }

  async listByCheck(tenantId: string, checkId: string): Promise<Payment[]> {
    return [...this.byId.values()].filter((p) => p.tenantId === tenantId && p.checkId === checkId);
  }

  async save(payment: Payment): Promise<void> {
    this.byId.set(payment.id, payment);
  }
}
