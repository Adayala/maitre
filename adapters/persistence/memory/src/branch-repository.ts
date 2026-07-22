import type { Branch, BranchRepositoryPort } from "@maitre/organization";

export class InMemoryBranchRepository implements BranchRepositoryPort {
  private readonly byId = new Map<string, Branch>();

  async findById(tenantId: string, id: string): Promise<Branch | null> {
    const branch = this.byId.get(id);
    return branch && branch.tenantId === tenantId ? branch : null;
  }

  async findByCode(tenantId: string, code: string): Promise<Branch | null> {
    for (const branch of this.byId.values()) {
      if (branch.tenantId === tenantId && branch.code === code) return branch;
    }
    return null;
  }

  async listByTenant(tenantId: string): Promise<Branch[]> {
    return [...this.byId.values()].filter((b) => b.tenantId === tenantId);
  }

  async save(branch: Branch): Promise<void> {
    this.byId.set(branch.id, branch);
  }
}
