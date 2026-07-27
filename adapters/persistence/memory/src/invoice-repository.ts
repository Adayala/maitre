import type { Invoice, FiscalEnvironment, VoucherType, InvoiceRepositoryPort } from "@maitre/fiscal";

export class InMemoryInvoiceRepository implements InvoiceRepositoryPort {
  private readonly byId = new Map<string, Invoice>();

  async findById(tenantId: string, id: string): Promise<Invoice | null> {
    const inv = this.byId.get(id);
    return inv && inv.tenantId === tenantId ? inv : null;
  }

  async listByFiscalEntity(tenantId: string, fiscalEntityId: string): Promise<Invoice[]> {
    return [...this.byId.values()].filter((i) => i.tenantId === tenantId && i.fiscalEntityId === fiscalEntityId);
  }

  async listByTenant(tenantId: string): Promise<Invoice[]> {
    return [...this.byId.values()].filter((i) => i.tenantId === tenantId);
  }

  async findMaxNumber(
    tenantId: string,
    fiscalEntityId: string,
    environment: FiscalEnvironment,
    pointOfSaleId: string,
    voucherType: VoucherType,
  ): Promise<number | null> {
    const numbers = [...this.byId.values()]
      .filter(
        (i) =>
          i.tenantId === tenantId &&
          i.fiscalEntityId === fiscalEntityId &&
          i.environment === environment &&
          i.pointOfSaleId === pointOfSaleId &&
          i.voucherType === voucherType &&
          i.number != null,
      )
      .map((i) => i.number as number);
    return numbers.length ? Math.max(...numbers) : null;
  }

  async save(invoice: Invoice): Promise<void> {
    this.byId.set(invoice.id, invoice);
  }
}
