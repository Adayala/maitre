import type { InvoiceTemplate, InvoiceTemplateRepositoryPort } from "@maitre/fiscal";

export class InMemoryInvoiceTemplateRepository implements InvoiceTemplateRepositoryPort {
  private readonly byId = new Map<string, InvoiceTemplate>();

  async findById(tenantId: string, id: string): Promise<InvoiceTemplate | null> {
    const t = this.byId.get(id);
    return t && t.tenantId === tenantId ? t : null;
  }

  async listByTenant(tenantId: string): Promise<InvoiceTemplate[]> {
    return [...this.byId.values()].filter((t) => t.tenantId === tenantId);
  }

  async save(template: InvoiceTemplate): Promise<void> {
    this.byId.set(template.id, template);
  }
}
