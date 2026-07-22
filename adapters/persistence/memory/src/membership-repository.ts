import type { Membership, MembershipRepositoryPort } from "@maitre/identity";

export class InMemoryMembershipRepository implements MembershipRepositoryPort {
  private readonly byId = new Map<string, Membership>();

  async listActiveByUser(userId: string): Promise<Membership[]> {
    return [...this.byId.values()].filter(
      (m) => m.userId === userId && m.status === "ACTIVE",
    );
  }

  async findActiveByUserAndTenant(
    userId: string,
    tenantId: string,
  ): Promise<Membership | null> {
    for (const m of this.byId.values()) {
      if (m.userId === userId && m.tenantId === tenantId && m.status === "ACTIVE") {
        return m;
      }
    }
    return null;
  }

  async save(membership: Membership): Promise<void> {
    this.byId.set(membership.id, membership);
  }
}
