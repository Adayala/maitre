import type { CapabilityToken, CapabilityTokenRepositoryPort } from "@maitre/ordering";

export class InMemoryCapabilityTokenRepository implements CapabilityTokenRepositoryPort {
  private readonly byId = new Map<string, CapabilityToken>();

  async findById(tenantId: string, id: string): Promise<CapabilityToken | null> {
    const token = this.byId.get(id);
    return token && token.tenantId === tenantId ? token : null;
  }

  async findByHash(tokenHash: string): Promise<CapabilityToken | null> {
    return [...this.byId.values()].find((t) => t.tokenHash === tokenHash) ?? null;
  }

  async save(token: CapabilityToken): Promise<void> {
    this.byId.set(token.id, token);
  }
}
