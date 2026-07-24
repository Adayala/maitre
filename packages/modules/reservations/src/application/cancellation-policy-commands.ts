// CancellationPolicy use cases (SPEC-070). Single fixed record per tenant
// (see cancellation-policy.ts scope note) — no versioning, no
// branch/channel scoping, no CancellationOverride entity.

import { randomUUID } from "node:crypto";
import type { CancellationPolicy } from "../domain/cancellation-policy.js";
import type { CancellationPolicyRepositoryPort } from "./ports.js";

export interface CancellationPolicyDeps {
  cancellationPolicies: CancellationPolicyRepositoryPort;
  now?: () => Date;
}

export interface UpsertCancellationPolicyInput {
  id?: string;
  tenantId: string;
  name: string;
  hoursBeforeStartCutoff: number;
  feeDescription?: string;
}

// POST /v1/cancellation-policies — creates or replaces the tenant's single
// CancellationPolicy record.
export async function upsertCancellationPolicy(
  deps: CancellationPolicyDeps,
  input: UpsertCancellationPolicyInput,
): Promise<CancellationPolicy> {
  const now = (deps.now ?? (() => new Date()))();
  const existing = await deps.cancellationPolicies.findByTenant(input.tenantId);
  const policy: CancellationPolicy = {
    id: existing?.id ?? input.id ?? randomUUID(),
    tenantId: input.tenantId,
    name: input.name,
    hoursBeforeStartCutoff: input.hoursBeforeStartCutoff,
    revision: (existing?.revision ?? 0) + 1,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    ...(input.feeDescription ? { feeDescription: input.feeDescription } : {}),
  };
  await deps.cancellationPolicies.save(policy);
  return policy;
}
