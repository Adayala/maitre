import type {
  CatalogPackage,
  CatalogPackageRepositoryPort,
} from "@maitre/subscription";

export class InMemoryCatalogPackageRepository implements CatalogPackageRepositoryPort {
  private readonly byCode = new Map<string, CatalogPackage>();

  constructor(seed: CatalogPackage[] = []) {
    for (const catalogPackage of seed) this.byCode.set(catalogPackage.code, catalogPackage);
  }

  async listActive(): Promise<CatalogPackage[]> {
    return [...this.byCode.values()]
      .filter((catalogPackage) => catalogPackage.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async findByCode(code: string): Promise<CatalogPackage | null> {
    return this.byCode.get(code) ?? null;
  }

  async save(catalogPackage: CatalogPackage): Promise<void> {
    this.byCode.set(catalogPackage.code, catalogPackage);
  }
}
