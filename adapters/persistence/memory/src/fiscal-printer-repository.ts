import type { FiscalPrinter, FiscalPrinterRepositoryPort } from "@maitre/fiscal";

export class InMemoryFiscalPrinterRepository implements FiscalPrinterRepositoryPort {
  private readonly byId = new Map<string, FiscalPrinter>();

  async findById(tenantId: string, id: string): Promise<FiscalPrinter | null> {
    const p = this.byId.get(id);
    return p && p.tenantId === tenantId ? p : null;
  }

  async listByBranch(tenantId: string, branchId: string): Promise<FiscalPrinter[]> {
    return [...this.byId.values()].filter((p) => p.tenantId === tenantId && p.branchId === branchId);
  }

  async save(printer: FiscalPrinter): Promise<void> {
    this.byId.set(printer.id, printer);
  }
}
