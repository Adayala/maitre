import type { Invoice, FiscalEnvironment, VoucherType } from "../domain/invoice.js";
import type { FiscalPointOfSale } from "../domain/fiscal-point-of-sale.js";
import type { FiscalPrinter } from "../domain/fiscal-printer.js";
import type { FiscalCertificate } from "../domain/fiscal-certificate.js";
import type { InvoiceTemplate } from "../domain/invoice-template.js";
import type { TaxRate } from "../domain/tax-rate.js";
import type {
  InvoiceRepositoryPort,
  FiscalPointOfSaleRepositoryPort,
  FiscalPrinterRepositoryPort,
  FiscalCertificateRepositoryPort,
  InvoiceTemplateRepositoryPort,
  TaxRateRepositoryPort,
} from "../application/ports.js";
import type { OutboxPort, OutboxRecord } from "../application/outbox.js";

export class FakeInvoiceRepository implements InvoiceRepositoryPort {
  private readonly items: Invoice[] = [];
  async findById(tenantId: string, id: string) {
    return this.items.find((i) => i.tenantId === tenantId && i.id === id) ?? null;
  }
  async listByFiscalEntity(tenantId: string, fiscalEntityId: string) {
    return this.items.filter((i) => i.tenantId === tenantId && i.fiscalEntityId === fiscalEntityId);
  }
  async listByTenant(tenantId: string) {
    return this.items.filter((i) => i.tenantId === tenantId);
  }
  async findMaxNumber(
    tenantId: string,
    fiscalEntityId: string,
    environment: FiscalEnvironment,
    pointOfSaleId: string,
    voucherType: VoucherType,
  ) {
    const numbers = this.items
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
  async save(invoice: Invoice) {
    const i = this.items.findIndex((x) => x.id === invoice.id);
    if (i >= 0) this.items[i] = invoice;
    else this.items.push(invoice);
  }
}

export class FakePointOfSaleRepository implements FiscalPointOfSaleRepositoryPort {
  private readonly items: FiscalPointOfSale[] = [];
  async findById(tenantId: string, id: string) {
    return this.items.find((p) => p.tenantId === tenantId && p.id === id) ?? null;
  }
  async findByIdentity(tenantId: string, fiscalEntityId: string, environment: FiscalEnvironment, officialCode: string) {
    return (
      this.items.find(
        (p) =>
          p.tenantId === tenantId &&
          p.fiscalEntityId === fiscalEntityId &&
          p.environment === environment &&
          p.officialCode === officialCode,
      ) ?? null
    );
  }
  async listByFiscalEntity(tenantId: string, fiscalEntityId: string) {
    return this.items.filter((p) => p.tenantId === tenantId && p.fiscalEntityId === fiscalEntityId);
  }
  async save(pos: FiscalPointOfSale) {
    const i = this.items.findIndex((x) => x.id === pos.id);
    if (i >= 0) this.items[i] = pos;
    else this.items.push(pos);
  }
}

export class FakePrinterRepository implements FiscalPrinterRepositoryPort {
  private readonly items: FiscalPrinter[] = [];
  async findById(tenantId: string, id: string) {
    return this.items.find((p) => p.tenantId === tenantId && p.id === id) ?? null;
  }
  async listByBranch(tenantId: string, branchId: string) {
    return this.items.filter((p) => p.tenantId === tenantId && p.branchId === branchId);
  }
  async save(printer: FiscalPrinter) {
    const i = this.items.findIndex((x) => x.id === printer.id);
    if (i >= 0) this.items[i] = printer;
    else this.items.push(printer);
  }
}

export class FakeCertificateRepository implements FiscalCertificateRepositoryPort {
  private readonly items: FiscalCertificate[] = [];
  async findById(tenantId: string, id: string) {
    return this.items.find((c) => c.tenantId === tenantId && c.id === id) ?? null;
  }
  async listByFiscalEntity(tenantId: string, fiscalEntityId: string) {
    return this.items.filter((c) => c.tenantId === tenantId && c.fiscalEntityId === fiscalEntityId);
  }
  async save(cert: FiscalCertificate) {
    const i = this.items.findIndex((x) => x.id === cert.id);
    if (i >= 0) this.items[i] = cert;
    else this.items.push(cert);
  }
}

export class FakeTemplateRepository implements InvoiceTemplateRepositoryPort {
  private readonly items: InvoiceTemplate[] = [];
  async findById(tenantId: string, id: string) {
    return this.items.find((t) => t.tenantId === tenantId && t.id === id) ?? null;
  }
  async listByTenant(tenantId: string) {
    return this.items.filter((t) => t.tenantId === tenantId);
  }
  async save(template: InvoiceTemplate) {
    const i = this.items.findIndex((x) => x.id === template.id);
    if (i >= 0) this.items[i] = template;
    else this.items.push(template);
  }
}

export class FakeTaxRateRepository implements TaxRateRepositoryPort {
  private readonly items: TaxRate[] = [];
  async findById(id: string) {
    return this.items.find((r) => r.id === id) ?? null;
  }
  async listAll() {
    return [...this.items];
  }
  async listByKey(jurisdiction: string, taxType: string, officialCode: string) {
    return this.items.filter(
      (r) => r.jurisdiction === jurisdiction && r.taxType === taxType && r.officialCode === officialCode,
    );
  }
  async save(rate: TaxRate) {
    const i = this.items.findIndex((x) => x.id === rate.id);
    if (i >= 0) this.items[i] = rate;
    else this.items.push(rate);
  }
}

export class FakeOutboxRepository implements OutboxPort {
  readonly records: OutboxRecord[] = [];
  async append(record: OutboxRecord) {
    this.records.push(record);
  }
}
