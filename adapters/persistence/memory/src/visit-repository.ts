import type { Visit, VisitRepositoryPort } from "@maitre/floor";

export class InMemoryVisitRepository implements VisitRepositoryPort {
  private readonly byId = new Map<string, Visit>();

  async findById(tenantId: string, id: string): Promise<Visit | null> {
    const visit = this.byId.get(id);
    return visit && visit.tenantId === tenantId ? visit : null;
  }

  async listByBranch(tenantId: string, branchId: string): Promise<Visit[]> {
    return [...this.byId.values()].filter((v) => v.tenantId === tenantId && v.branchId === branchId);
  }

  async save(visit: Visit): Promise<void> {
    this.byId.set(visit.id, visit);
  }
}
