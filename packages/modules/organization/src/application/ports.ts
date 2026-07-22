import type { Tenant } from "../domain/tenant.js";
import type { Branch } from "../domain/branch.js";

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
