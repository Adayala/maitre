import type { Tenant } from "../domain/tenant.js";
import type { Branch } from "../domain/branch.js";
import type { Brand } from "../domain/brand.js";
import type { FiscalEntity } from "../domain/fiscal-entity.js";
import type { Salon } from "../domain/salon.js";
import type { Table } from "../domain/table.js";
import type { BrandAsset, BrandPresentation } from "../domain/brand-presentation.js";

// SPEC-210 — application ports, implemented by adapters/persistence/*
export interface TenantRepositoryPort {
  findById(id: string): Promise<Tenant | null>;
  save(tenant: Tenant): Promise<void>;
}

export interface BranchRepositoryPort {
  findById(tenantId: string, id: string): Promise<Branch | null>;
  findByCode(tenantId: string, code: string): Promise<Branch | null>;
  listByTenant(tenantId: string): Promise<Branch[]>;
  save(branch: Branch): Promise<void>;
}

export interface BrandRepositoryPort {
  findById(tenantId: string, id: string): Promise<Brand | null>;
  findBySlug(tenantId: string, slug: string): Promise<Brand | null>;
  listByTenant(tenantId: string): Promise<Brand[]>;
  save(brand: Brand): Promise<void>;
}

export interface BrandPresentationRepositoryPort {
  findById(tenantId: string, id: string): Promise<BrandPresentation | null>;
  findDraft(tenantId: string, brandId: string): Promise<BrandPresentation | null>;
  findPublished(tenantId: string, brandId: string): Promise<BrandPresentation | null>;
  listByBrand(tenantId: string, brandId: string): Promise<BrandPresentation[]>;
  nextRevision(tenantId: string, brandId: string): Promise<number>;
  save(presentation: BrandPresentation): Promise<void>;
}

export interface BrandAssetRepositoryPort {
  findById(tenantId: string, brandId: string, id: string): Promise<BrandAsset | null>;
  listByBrand(tenantId: string, brandId: string): Promise<BrandAsset[]>;
  save(asset: BrandAsset): Promise<void>;
}

export interface BrandAssetStoragePort {
  put(path: string, bytes: Uint8Array, mimeType: string): Promise<void>;
  get(path: string): Promise<{ bytes: Uint8Array; mimeType: string } | null>;
  remove(path: string): Promise<void>;
  publicUrl(path: string): string;
}

export interface FiscalEntityRepositoryPort {
  findById(tenantId: string, id: string): Promise<FiscalEntity | null>;
  findByCuit(tenantId: string, cuit: string): Promise<FiscalEntity | null>;
  findByCreateIdempotencyKey(tenantId: string, idempotencyKey: string): Promise<FiscalEntity | null>;
  listByTenant(tenantId: string): Promise<FiscalEntity[]>;
  save(entity: FiscalEntity): Promise<void>;
}

export interface SalonRepositoryPort {
  findById(tenantId: string, id: string): Promise<Salon | null>;
  listByBranch(tenantId: string, branchId: string): Promise<Salon[]>;
  save(salon: Salon): Promise<void>;
}

export interface TableRepositoryPort {
  findById(tenantId: string, id: string): Promise<Table | null>;
  findByNumber(tenantId: string, salonId: string, number: string): Promise<Table | null>;
  listBySalon(tenantId: string, salonId: string): Promise<Table[]>;
  save(table: Table): Promise<void>;
}
