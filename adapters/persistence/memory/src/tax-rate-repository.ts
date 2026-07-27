import type { TaxRate, TaxRateRepositoryPort } from "@maitre/fiscal";

// TaxRate is a platform-level (non-tenant) catalogue, so lookups are not scoped
// by tenantId.
export class InMemoryTaxRateRepository implements TaxRateRepositoryPort {
  private readonly byId = new Map<string, TaxRate>();

  async findById(id: string): Promise<TaxRate | null> {
    return this.byId.get(id) ?? null;
  }

  async listAll(): Promise<TaxRate[]> {
    return [...this.byId.values()];
  }

  async listByKey(jurisdiction: string, taxType: string, officialCode: string): Promise<TaxRate[]> {
    return [...this.byId.values()].filter(
      (r) => r.jurisdiction === jurisdiction && r.taxType === taxType && r.officialCode === officialCode,
    );
  }

  async save(rate: TaxRate): Promise<void> {
    this.byId.set(rate.id, rate);
  }
}
