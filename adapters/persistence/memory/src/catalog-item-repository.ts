import type { CatalogItem, CatalogRepositoryPort } from "@maitre/subscription";

export class InMemoryCatalogItemRepository implements CatalogRepositoryPort {
  private readonly byCode = new Map<string, CatalogItem>();

  constructor(seed: CatalogItem[] = []) {
    for (const item of seed) this.byCode.set(item.code, item);
  }

  async listActive(): Promise<CatalogItem[]> {
    return [...this.byCode.values()].filter((i) => i.isActive);
  }

  async findByCode(code: string): Promise<CatalogItem | null> {
    return this.byCode.get(code) ?? null;
  }

  async save(item: CatalogItem): Promise<void> {
    this.byCode.set(item.code, item);
  }
}
