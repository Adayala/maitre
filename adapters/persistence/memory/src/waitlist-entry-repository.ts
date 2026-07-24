import type { WaitlistEntry, WaitlistEntryRepositoryPort } from "@maitre/reservations";

export class InMemoryWaitlistEntryRepository implements WaitlistEntryRepositoryPort {
  private readonly byId = new Map<string, WaitlistEntry>();

  async findById(tenantId: string, id: string): Promise<WaitlistEntry | null> {
    const entry = this.byId.get(id);
    return entry && entry.tenantId === tenantId ? entry : null;
  }

  async listByBranch(tenantId: string, branchId: string): Promise<WaitlistEntry[]> {
    return [...this.byId.values()].filter((e) => e.tenantId === tenantId && e.branchId === branchId);
  }

  async save(entry: WaitlistEntry): Promise<void> {
    this.byId.set(entry.id, entry);
  }
}
