import type { CancellationPolicy, CancellationPolicyRepositoryPort } from "@maitre/reservations";

export class InMemoryCancellationPolicyRepository implements CancellationPolicyRepositoryPort {
  private readonly byId = new Map<string, CancellationPolicy>();

  async findById(tenantId: string, id: string): Promise<CancellationPolicy | null> {
    const policy = this.byId.get(id);
    return policy && policy.tenantId === tenantId ? policy : null;
  }

  async findByTenant(tenantId: string): Promise<CancellationPolicy | null> {
    return [...this.byId.values()].find((p) => p.tenantId === tenantId) ?? null;
  }

  async save(policy: CancellationPolicy): Promise<void> {
    this.byId.set(policy.id, policy);
  }
}
