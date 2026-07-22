import { randomUUID } from "node:crypto";
import { assertMembershipInvariants, type BranchScopeType, type Membership } from "../domain/membership.js";
import type { MembershipRepositoryPort } from "./ports.js";

export interface CreateMembershipInput {
  tenantId: string;
  userId: string;
  roleIds: string[];
  branchScopeType: BranchScopeType;
  branchIds?: string[];
  actorId?: string;
  id?: string;
}

export interface CreateMembershipDeps {
  memberships: MembershipRepositoryPort;
  now?: () => Date;
}

// Creates an ACTIVE membership directly (used by trusted provisioning
// workflows). The public invitation flow (SPEC-021/023/024) is out of scope.
export async function createMembership(
  deps: CreateMembershipDeps,
  input: CreateMembershipInput,
): Promise<Membership> {
  const now = (deps.now ?? (() => new Date()))();
  const membership: Membership = {
    id: input.id ?? randomUUID(),
    tenantId: input.tenantId,
    userId: input.userId,
    status: "ACTIVE",
    branchScopeType: input.branchScopeType,
    roleIds: input.roleIds,
    branchIds: input.branchIds ?? [],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
    ...(input.actorId !== undefined
      ? { createdBy: input.actorId, updatedBy: input.actorId }
      : {}),
  };

  assertMembershipInvariants(membership);
  await deps.memberships.save(membership);
  return membership;
}
