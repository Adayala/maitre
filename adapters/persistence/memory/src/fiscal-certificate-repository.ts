import type { FiscalCertificate, FiscalCertificateRepositoryPort } from "@maitre/fiscal";

export class InMemoryFiscalCertificateRepository implements FiscalCertificateRepositoryPort {
  private readonly byId = new Map<string, FiscalCertificate>();

  async findById(tenantId: string, id: string): Promise<FiscalCertificate | null> {
    const c = this.byId.get(id);
    return c && c.tenantId === tenantId ? c : null;
  }

  async listByFiscalEntity(tenantId: string, fiscalEntityId: string): Promise<FiscalCertificate[]> {
    return [...this.byId.values()].filter((c) => c.tenantId === tenantId && c.fiscalEntityId === fiscalEntityId);
  }

  async save(cert: FiscalCertificate): Promise<void> {
    this.byId.set(cert.id, cert);
  }
}
