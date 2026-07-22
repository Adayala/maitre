import { randomUUID } from "node:crypto";
import { assertMembershipInvariants, type BranchScopeType, type Membership } from "../domain/membership.js";
import type { MembershipRepositoryPort } from "./ports.js";
import type { OutboxPort } from "./outbox.js";
import { userInvitedEvent } from "./events.js";

export interface InviteMembershipInput {
  tenantId: string;
  userId: string;
  roleIds: string[];
  branchScopeType: BranchScopeType;
  branchIds?: string[];
  actorId?: string;
  id?: string;
  correlationId?: string;
}

export interface InviteMembershipDeps {
  memberships: MembershipRepositoryPort;
  outbox: OutboxPort;
  now?: () => Date;
}

// SPEC-020 — INVITED: "vínculo preparado pero no habilita sesión operativa."
// Used by SPEC-021's POST /users invite flow.
export async function inviteMembership(
  deps: InviteMembershipDeps,
  input: InviteMembershipInput,
): Promise<Membership> {
  const now = (deps.now ?? (() => new Date()))();
  const membership: Membership = {
    id: input.id ?? randomUUID(),
    tenantId: input.tenantId,
    userId: input.userId,
    status: "INVITED",
    branchScopeType: input.branchScopeType,
    roleIds: input.roleIds,
    branchIds: input.branchIds ?? [],
    invitedAt: now,
    activatedAt: null,
    createdAt: now,
    updatedAt: now,
    ...(input.actorId !== undefined
      ? { createdBy: input.actorId, updatedBy: input.actorId }
      : {}),
  };

  assertMembershipInvariants(membership);
  await deps.memberships.save(membership);
  await deps.outbox.append(userInvitedEvent(membership, input.correlationId ?? randomUUID()));
  return membership;
}
