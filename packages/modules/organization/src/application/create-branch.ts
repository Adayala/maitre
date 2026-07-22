import { randomUUID } from "node:crypto";
import { normalizeBranchCode, type Branch } from "../domain/branch.js";
import type { BrandRepositoryPort, BranchRepositoryPort } from "./ports.js";
import type { OutboxPort } from "./outbox.js";
import { branchCreatedEvent } from "./events.js";

export class UnknownBrandError extends Error {
  constructor(brandId: string) {
    super(`Brand ${brandId} does not exist for this tenant`);
    this.name = "UnknownBrandError";
  }
}

export class DuplicateBranchCodeError extends Error {
  constructor(code: string, tenantId: string) {
    super(`Branch code "${code}" already exists for tenant ${tenantId}`);
    this.name = "DuplicateBranchCodeError";
  }
}

export interface CreateBranchInput {
  tenantId: string;
  brandId: string;
  name: string;
  code: string;
  timezone: string;
  fiscalEntityId?: string;
  contactEmail?: string;
  contactPhone?: string;
  actorId?: string;
  correlationId?: string;
}

export interface CreateBranchDeps {
  brands: BrandRepositoryPort;
  branches: BranchRepositoryPort;
  outbox: OutboxPort;
  now?: () => Date;
}

// SPEC-004 §3/§5 — brand must exist in the same tenant; code unique per tenant.
export async function createBranch(
  deps: CreateBranchDeps,
  input: CreateBranchInput,
): Promise<Branch> {
  const brand = await deps.brands.findById(input.tenantId, input.brandId);
  if (!brand) throw new UnknownBrandError(input.brandId);

  const code = normalizeBranchCode(input.code);
  const existing = await deps.branches.findByCode(input.tenantId, code);
  if (existing) throw new DuplicateBranchCodeError(code, input.tenantId);

  const now = (deps.now ?? (() => new Date()))();
  const branch: Branch = {
    id: randomUUID(),
    tenantId: input.tenantId,
    brandId: input.brandId,
    code,
    name: input.name,
    timezone: input.timezone,
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
    ...(input.fiscalEntityId !== undefined ? { fiscalEntityId: input.fiscalEntityId } : {}),
    ...(input.contactEmail !== undefined ? { contactEmail: input.contactEmail } : {}),
    ...(input.contactPhone !== undefined ? { contactPhone: input.contactPhone } : {}),
    ...(input.actorId !== undefined
      ? { createdBy: input.actorId, updatedBy: input.actorId }
      : {}),
  };

  await deps.branches.save(branch);
  await deps.outbox.append(branchCreatedEvent(branch, input.correlationId ?? randomUUID()));
  return branch;
}
