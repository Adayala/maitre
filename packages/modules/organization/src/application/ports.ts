import type { Tenant } from "../domain/tenant.js";
import type { Branch } from "../domain/branch.js";
import type { Brand } from "../domain/brand.js";
import type { FiscalEntity } from "../domain/fiscal-entity.js";

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

export interface FiscalEntityRepositoryPort {
  findById(tenantId: string, id: string): Promise<FiscalEntity | null>;
  findByCuit(tenantId: string, cuit: string): Promise<FiscalEntity | null>;
  listByTenant(tenantId: string): Promise<FiscalEntity[]>;
  save(entity: FiscalEntity): Promise<void>;
}
