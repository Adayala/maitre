import type { Tenant, TenantRepositoryPort } from "@maitre/organization";

// In-memory adapter — placeholder for SPK-02/04/06 (Supabase Postgres, SPEC-210).
export class InMemoryTenantRepository implements TenantRepositoryPort {
  private readonly byId = new Map<string, Tenant>();

  async findById(id: string): Promise<Tenant | null> {
    return this.byId.get(id) ?? null;
  }

  async save(tenant: Tenant): Promise<void> {
    this.byId.set(tenant.id, tenant);
  }
}
