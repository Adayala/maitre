export interface TimeExportJobRecord {
  id: string;
  tenantId: string;
  branchId: string;
  status: "REQUESTED";
  format: "CSV";
  from: Date;
  to: Date;
  reason: string;
  requestedAt: Date;
  stepUpAt: Date;
  requestedByUserId: string;
  manifest: {
    entryCountEstimate: number;
    timeEntryIds: string[];
  };
}

export interface TimeExportJobRepositoryPort {
  findById(tenantId: string, id: string): Promise<TimeExportJobRecord | null>;
  listByBranch(tenantId: string, branchId: string): Promise<TimeExportJobRecord[]>;
  save(job: TimeExportJobRecord): Promise<void>;
}

export class InMemoryTimeExportJobRepository implements TimeExportJobRepositoryPort {
  constructor(private readonly items: TimeExportJobRecord[] = []) {}

  async findById(tenantId: string, id: string): Promise<TimeExportJobRecord | null> {
    return this.items.find((item) => item.tenantId === tenantId && item.id === id) ?? null;
  }

  async listByBranch(tenantId: string, branchId: string): Promise<TimeExportJobRecord[]> {
    return this.items
      .filter((item) => item.tenantId === tenantId && item.branchId === branchId)
      .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
  }

  async save(job: TimeExportJobRecord): Promise<void> {
    const index = this.items.findIndex((item) => item.tenantId === job.tenantId && item.id === job.id);
    if (index >= 0) this.items[index] = job;
    else this.items.push(job);
  }
}
