import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  BrandAsset,
  BrandAssetRepositoryPort,
  BrandAssetStoragePort,
  BrandPresentation,
  BrandPresentationRepositoryPort,
} from "@maitre/organization";

const PRESENTATIONS = "brand_presentations";
const ASSETS = "brand_assets";

const presentationFromRow = (row: Record<string, unknown>): BrandPresentation => ({
  id: String(row["id"]),
  tenantId: String(row["tenant_id"]),
  brandId: String(row["brand_id"]),
  revision: Number(row["revision"]),
  status: row["status"] as BrandPresentation["status"],
  document: row["presentation"] as BrandPresentation["document"],
  createdAt: new Date(String(row["created_at"])),
  ...(row["created_by"] ? { createdBy: String(row["created_by"]) } : {}),
  ...(row["published_at"] ? { publishedAt: new Date(String(row["published_at"])) } : {}),
  ...(row["published_by"] ? { publishedBy: String(row["published_by"]) } : {}),
});

export class SupabaseBrandPresentationRepository implements BrandPresentationRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}
  async findById(tenantId: string, id: string) {
    const { data, error } = await this.client.from(PRESENTATIONS).select("*").eq("tenant_id", tenantId).eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? presentationFromRow(data) : null;
  }
  private async findStatus(tenantId: string, brandId: string, status: string) {
    const { data, error } = await this.client.from(PRESENTATIONS).select("*").eq("tenant_id", tenantId).eq("brand_id", brandId).eq("status", status).order("revision", { ascending: false }).limit(1).maybeSingle();
    if (error) throw error;
    return data ? presentationFromRow(data) : null;
  }
  findDraft(tenantId: string, brandId: string) { return this.findStatus(tenantId, brandId, "DRAFT"); }
  findPublished(tenantId: string, brandId: string) { return this.findStatus(tenantId, brandId, "PUBLISHED"); }
  async listByBrand(tenantId: string, brandId: string) {
    const { data, error } = await this.client.from(PRESENTATIONS).select("*").eq("tenant_id", tenantId).eq("brand_id", brandId).order("revision", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => presentationFromRow(row));
  }
  async nextRevision(tenantId: string, brandId: string) {
    const rows = await this.listByBrand(tenantId, brandId);
    return (rows[0]?.revision ?? 0) + 1;
  }
  async save(value: BrandPresentation) {
    const { error } = await this.client.from(PRESENTATIONS).upsert({
      id: value.id, tenant_id: value.tenantId, brand_id: value.brandId,
      revision: value.revision, status: value.status, schema_version: value.document.schemaVersion,
      presentation: value.document, created_at: value.createdAt.toISOString(),
      created_by: value.createdBy ?? null, published_at: value.publishedAt?.toISOString() ?? null,
      published_by: value.publishedBy ?? null,
    });
    if (error) throw error;
  }
}

const assetFromRow = (row: Record<string, unknown>): BrandAsset => ({
  id: String(row["id"]), tenantId: String(row["tenant_id"]), brandId: String(row["brand_id"]),
  kind: row["kind"] as BrandAsset["kind"], storageBucket: String(row["storage_bucket"]),
  storagePath: String(row["storage_path"]), mimeType: String(row["mime_type"]),
  sizeBytes: Number(row["size_bytes"]), checksum: String(row["checksum"]),
  status: row["status"] as BrandAsset["status"], createdAt: new Date(String(row["created_at"])),
  ...(row["public_url"] ? { publicUrl: String(row["public_url"]) } : {}),
  ...(row["width"] ? { width: Number(row["width"]) } : {}),
  ...(row["height"] ? { height: Number(row["height"]) } : {}),
  ...(row["created_by"] ? { createdBy: String(row["created_by"]) } : {}),
});

export class SupabaseBrandAssetRepository implements BrandAssetRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}
  async findById(tenantId: string, brandId: string, id: string) {
    const { data, error } = await this.client.from(ASSETS).select("*").eq("tenant_id", tenantId).eq("brand_id", brandId).eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? assetFromRow(data) : null;
  }
  async listByBrand(tenantId: string, brandId: string) {
    const { data, error } = await this.client.from(ASSETS).select("*").eq("tenant_id", tenantId).eq("brand_id", brandId);
    if (error) throw error;
    return (data ?? []).map((row) => assetFromRow(row));
  }
  async save(value: BrandAsset) {
    const { error } = await this.client.from(ASSETS).upsert({
      id: value.id, tenant_id: value.tenantId, brand_id: value.brandId, kind: value.kind,
      storage_bucket: value.storageBucket, storage_path: value.storagePath, public_url: value.publicUrl ?? null,
      mime_type: value.mimeType, size_bytes: value.sizeBytes, checksum: value.checksum,
      width: value.width ?? null, height: value.height ?? null, status: value.status,
      created_at: value.createdAt.toISOString(), created_by: value.createdBy ?? null,
    });
    if (error) throw error;
  }
}

export class SupabaseBrandAssetStorage implements BrandAssetStoragePort {
  private readonly bucket = "brand-assets";
  constructor(private readonly client: SupabaseClient) {}
  async put(path: string, bytes: Uint8Array, mimeType: string) {
    const { error } = await this.client.storage.from(this.bucket).upload(path, bytes, { contentType: mimeType, upsert: false });
    if (error) throw error;
  }
  async get(path: string) {
    const { data, error } = await this.client.storage.from(this.bucket).download(path);
    if (error || !data) return null;
    return { bytes: new Uint8Array(await data.arrayBuffer()), mimeType: data.type || "application/octet-stream" };
  }
  async remove(path: string) {
    const { error } = await this.client.storage.from(this.bucket).remove([path]);
    if (error) throw error;
  }
  publicUrl(path: string) { return this.client.storage.from(this.bucket).getPublicUrl(path).data.publicUrl; }
}
