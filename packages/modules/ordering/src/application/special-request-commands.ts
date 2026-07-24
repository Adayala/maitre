// SpecialRequest use cases (SPEC-093, simplified — see special-request.ts).

import { randomUUID } from "node:crypto";
import {
  type SpecialRequest,
  type SpecialRequestTargetType,
  assertSpecialRequestTransition,
  normalizeFreeText,
} from "../domain/special-request.js";
import type { SpecialRequestRepositoryPort } from "./ports.js";

export interface SpecialRequestDeps {
  specialRequests: SpecialRequestRepositoryPort;
  now?: () => Date;
}

function nowFrom(deps: { now?: () => Date }): Date {
  return (deps.now ?? (() => new Date()))();
}

async function loadRequest(deps: SpecialRequestDeps, tenantId: string, id: string): Promise<SpecialRequest> {
  const request = await deps.specialRequests.findById(tenantId, id);
  if (!request) throw new Error(`SpecialRequest ${id} not found`);
  return request;
}

// POST /v1/special-requests — creates a PENDING request. Creating is not
// accepting (SPEC-093). Free text is normalized/capped when present.
export interface CreateSpecialRequestInput {
  tenantId: string;
  branchId?: string;
  requestType: string;
  targetType: SpecialRequestTargetType;
  targetId: string;
  freeText?: string;
  createdByActor?: string;
}

export async function createSpecialRequest(
  deps: SpecialRequestDeps,
  input: CreateSpecialRequestInput,
): Promise<SpecialRequest> {
  const now = nowFrom(deps);
  const request: SpecialRequest = {
    id: randomUUID(),
    tenantId: input.tenantId,
    requestType: input.requestType,
    targetType: input.targetType,
    targetId: input.targetId,
    status: "PENDING",
    revision: 1,
    createdAt: now,
    updatedAt: now,
    ...(input.branchId ? { branchId: input.branchId } : {}),
    ...(input.freeText ? { freeText: normalizeFreeText(input.freeText) } : {}),
    ...(input.createdByActor ? { createdByActor: input.createdByActor } : {}),
  };
  await deps.specialRequests.save(request);
  return request;
}

async function resolveTo(
  deps: SpecialRequestDeps,
  tenantId: string,
  id: string,
  to: SpecialRequest["status"],
  actor?: string,
  reasonCode?: string,
): Promise<SpecialRequest> {
  const request = await loadRequest(deps, tenantId, id);
  assertSpecialRequestTransition(request.status, to);
  const now = nowFrom(deps);
  const updated: SpecialRequest = {
    ...request,
    status: to,
    revision: request.revision + 1,
    updatedAt: now,
    resolvedAt: now,
    ...(actor ? { resolvedByActor: actor } : {}),
    ...(reasonCode ? { reasonCode } : {}),
  };
  await deps.specialRequests.save(updated);
  return updated;
}

// POST /v1/special-requests/:id/accept — PENDING -> ACCEPTED.
export function acceptSpecialRequest(
  deps: SpecialRequestDeps,
  input: { tenantId: string; id: string; actor?: string; reasonCode?: string },
): Promise<SpecialRequest> {
  return resolveTo(deps, input.tenantId, input.id, "ACCEPTED", input.actor, input.reasonCode);
}

// POST /v1/special-requests/:id/reject — PENDING -> REJECTED.
export function rejectSpecialRequest(
  deps: SpecialRequestDeps,
  input: { tenantId: string; id: string; actor?: string; reasonCode?: string },
): Promise<SpecialRequest> {
  return resolveTo(deps, input.tenantId, input.id, "REJECTED", input.actor, input.reasonCode);
}

// POST /v1/special-requests/:id/fulfill — ACCEPTED -> FULFILLED.
export function fulfillSpecialRequest(
  deps: SpecialRequestDeps,
  input: { tenantId: string; id: string; actor?: string },
): Promise<SpecialRequest> {
  return resolveTo(deps, input.tenantId, input.id, "FULFILLED", input.actor);
}
