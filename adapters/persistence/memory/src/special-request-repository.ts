import type { SpecialRequest, SpecialRequestRepositoryPort } from "@maitre/ordering";

export class InMemorySpecialRequestRepository implements SpecialRequestRepositoryPort {
  private readonly byId = new Map<string, SpecialRequest>();

  async findById(tenantId: string, id: string): Promise<SpecialRequest | null> {
    const request = this.byId.get(id);
    return request && request.tenantId === tenantId ? request : null;
  }

  async listByTarget(tenantId: string, targetType: string, targetId: string): Promise<SpecialRequest[]> {
    return [...this.byId.values()].filter(
      (r) => r.tenantId === tenantId && r.targetType === targetType && r.targetId === targetId,
    );
  }

  async save(request: SpecialRequest): Promise<void> {
    this.byId.set(request.id, request);
  }
}
