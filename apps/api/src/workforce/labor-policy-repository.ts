export interface LaborPolicyVersionRecord {
  id: string;
  tenantId: string;
  branchId: string;
  jurisdictionCode: string;
  sourceType: "OFFICIAL" | "COUNSEL" | "INTERNAL_APPROVED_REFERENCE";
  sourceRef: string;
  consultedAt: Date;
  effectiveFrom: Date;
  effectiveUntil?: Date | null;
  contentHash: string;
  reviewerRef: string;
  approvedAt: Date;
  supersedesPolicyVersionId?: string | null;
  policyCapabilities: {
    breaks?: {
      clockOutOpenBreak?: {
        mode: "REJECT" | "AUTO_CLOSE";
      };
    };
    dailyMaximums?: "SUPPORTED" | "NOT_CONFIGURED";
    weeklyMaximums?: "SUPPORTED" | "NOT_CONFIGURED";
    nightShift?: "SUPPORTED" | "NOT_CONFIGURED";
    holidaysCalendar?: "SUPPORTED" | "NOT_CONFIGURED";
    minors?: "SUPPORTED" | "NOT_CONFIGURED";
    tenantOverlays?: "SUPPORTED" | "NOT_CONFIGURED";
  };
  disclaimer: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LaborPolicyVersionRepositoryPort {
  findById(tenantId: string, id: string): Promise<LaborPolicyVersionRecord | null>;
  listByBranch(tenantId: string, branchId: string): Promise<LaborPolicyVersionRecord[]>;
  save(policy: LaborPolicyVersionRecord): Promise<void>;
}

export function resolveEffectiveLaborPolicyVersion(
  policies: LaborPolicyVersionRecord[],
  effectiveAt: Date,
): LaborPolicyVersionRecord | null {
  const activeOrPastPolicies = policies.filter(
    (policy) =>
      policy.effectiveFrom.getTime() <= effectiveAt.getTime() &&
      (policy.effectiveUntil == null || policy.effectiveUntil.getTime() >= effectiveAt.getTime()),
  );
  const supersededIds = new Set(
    activeOrPastPolicies
      .map((policy) => policy.supersedesPolicyVersionId)
      .filter((value): value is string => typeof value === "string" && value.length > 0),
  );
  const candidates = activeOrPastPolicies
    .filter((policy) => !supersededIds.has(policy.id))
    .sort((a, b) => {
      const byEffectiveFrom = b.effectiveFrom.getTime() - a.effectiveFrom.getTime();
      if (byEffectiveFrom !== 0) return byEffectiveFrom;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  return candidates[0] ?? null;
}

export class InMemoryLaborPolicyVersionRepository implements LaborPolicyVersionRepositoryPort {
  constructor(private readonly items: LaborPolicyVersionRecord[] = []) {}

  async findById(tenantId: string, id: string): Promise<LaborPolicyVersionRecord | null> {
    return this.items.find((item) => item.tenantId === tenantId && item.id === id) ?? null;
  }

  async listByBranch(tenantId: string, branchId: string): Promise<LaborPolicyVersionRecord[]> {
    return this.items.filter((item) => item.tenantId === tenantId && item.branchId === branchId);
  }

  async save(policy: LaborPolicyVersionRecord): Promise<void> {
    const index = this.items.findIndex((item) => item.tenantId === policy.tenantId && item.id === policy.id);
    if (index >= 0) this.items[index] = policy;
    else this.items.push(policy);
  }
}
