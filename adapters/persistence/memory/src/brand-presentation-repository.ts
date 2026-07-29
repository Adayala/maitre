import type {
  BrandAsset,
  BrandAssetRepositoryPort,
  BrandAssetStoragePort,
  BrandPresentation,
  BrandPresentationRepositoryPort,
} from "@maitre/organization";

export class InMemoryBrandPresentationRepository implements BrandPresentationRepositoryPort {
  private readonly records = new Map<string, BrandPresentation>();

  async findById(tenantId: string, id: string) {
    const value = this.records.get(id);
    return value?.tenantId === tenantId ? value : null;
  }
  async findDraft(tenantId: string, brandId: string) {
    return [...this.records.values()].find((item) => item.tenantId === tenantId && item.brandId === brandId && item.status === "DRAFT") ?? null;
  }
  async findPublished(tenantId: string, brandId: string) {
    return [...this.records.values()]
      .filter((item) => item.tenantId === tenantId && item.brandId === brandId && item.status === "PUBLISHED")
      .sort((a, b) => b.revision - a.revision)[0] ?? null;
  }
  async listByBrand(tenantId: string, brandId: string) {
    return [...this.records.values()]
      .filter((item) => item.tenantId === tenantId && item.brandId === brandId)
      .sort((a, b) => b.revision - a.revision);
  }
  async nextRevision(tenantId: string, brandId: string) {
    const values = await this.listByBrand(tenantId, brandId);
    return (values[0]?.revision ?? 0) + 1;
  }
  async save(value: BrandPresentation) { this.records.set(value.id, value); }
}

export class InMemoryBrandAssetRepository implements BrandAssetRepositoryPort {
  private readonly records = new Map<string, BrandAsset>();
  async findById(tenantId: string, brandId: string, id: string) {
    const value = this.records.get(id);
    return value?.tenantId === tenantId && value.brandId === brandId ? value : null;
  }
  async listByBrand(tenantId: string, brandId: string) {
    return [...this.records.values()].filter((item) => item.tenantId === tenantId && item.brandId === brandId);
  }
  async save(value: BrandAsset) { this.records.set(value.id, value); }
}

export class InMemoryBrandAssetStorage implements BrandAssetStoragePort {
  private readonly records = new Map<string, { bytes: Uint8Array; mimeType: string }>();
  async put(path: string, bytes: Uint8Array, mimeType: string) { this.records.set(path, { bytes, mimeType }); }
  async get(path: string) { return this.records.get(path) ?? null; }
  async remove(path: string) { this.records.delete(path); }
  publicUrl(path: string) { return `/public/brand-assets/${encodeURIComponent(path)}`; }
}
