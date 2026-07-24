// Capability token use cases (SPEC-088/090/091, and SPEC-084/085 entities).
// One generic issue/resolve pair serves MENU_READ, BILL_READ and
// ORDER_TRACK_READ. The route layer builds the actual resolved projection
// (published Menu / live Check / live Order) from Catalog and Floor after
// resolveCapabilityToken validates the token — keeping this module decoupled.

import { randomUUID } from "node:crypto";
import {
  type CapabilityToken,
  type CapabilityPurpose,
  generateOpaqueToken,
  hashToken,
  resourceTypeForPurpose,
  isCapabilityTokenResolvable,
} from "../domain/capability-token.js";
import type { CapabilityTokenRepositoryPort } from "./ports.js";

export interface CapabilityDeps {
  capabilityTokens: CapabilityTokenRepositoryPort;
  now?: () => Date;
}

function nowFrom(deps: { now?: () => Date }): Date {
  return (deps.now ?? (() => new Date()))();
}

export interface IssueCapabilityTokenInput {
  tenantId: string;
  purpose: CapabilityPurpose;
  resourceId: string;
  branchId?: string;
  tableId?: string;
  ttlSeconds?: number; // omitted = no expiry
}

export interface IssuedCapabilityToken {
  token: string; // raw opaque token, returned exactly once
  record: CapabilityToken;
}

// POST /v1/orders/:id/tracking-token, /v1/checks/:id/bill-token,
// /v1/menus/:id/qr-token — mints an ACTIVE token, stores only its hash.
export async function issueCapabilityToken(
  deps: CapabilityDeps,
  input: IssueCapabilityTokenInput,
): Promise<IssuedCapabilityToken> {
  const now = nowFrom(deps);
  const raw = generateOpaqueToken();
  const record: CapabilityToken = {
    id: randomUUID(),
    tenantId: input.tenantId,
    purpose: input.purpose,
    tokenHash: hashToken(raw),
    resourceType: resourceTypeForPurpose(input.purpose),
    resourceId: input.resourceId,
    status: "ACTIVE",
    issuedAt: now,
    createdAt: now,
    updatedAt: now,
    ...(input.branchId ? { branchId: input.branchId } : {}),
    ...(input.tableId ? { tableId: input.tableId } : {}),
    ...(input.ttlSeconds ? { expiresAt: new Date(now.getTime() + input.ttlSeconds * 1000) } : {}),
  };
  await deps.capabilityTokens.save(record);
  return { token: raw, record };
}

// Thrown for any invalid/expired/revoked/wrong-purpose token — the route maps
// it to a generic 404 (anti-enumeration; never reveals whether the resource
// exists or which tenant/branch it belongs to).
export class CapabilityNotResolvableError extends Error {
  constructor() {
    super("Capability token is not resolvable");
    this.name = "CapabilityNotResolvableError";
  }
}

// GET /public/menu/:token, /public/bills/:token, /public/tracking/:token —
// resolves a raw token to its (still valid) CapabilityToken of the expected
// purpose. Lazily flips an ACTIVE-but-expired row to EXPIRED on read.
export async function resolveCapabilityToken(
  deps: CapabilityDeps,
  rawToken: string,
  purpose: CapabilityPurpose,
): Promise<CapabilityToken> {
  const token = await deps.capabilityTokens.findByHash(hashToken(rawToken));
  if (!token || token.purpose !== purpose) throw new CapabilityNotResolvableError();

  const now = nowFrom(deps);
  if (!isCapabilityTokenResolvable(token, now)) {
    if (token.status === "ACTIVE" && token.expiresAt && token.expiresAt.getTime() <= now.getTime()) {
      await deps.capabilityTokens.save({ ...token, status: "EXPIRED", updatedAt: now });
    }
    throw new CapabilityNotResolvableError();
  }
  return token;
}

// POST /v1/capability-tokens/:id/revoke — revokes an issued token.
export async function revokeCapabilityToken(
  deps: CapabilityDeps,
  input: { tenantId: string; id: string },
): Promise<CapabilityToken> {
  const token = await deps.capabilityTokens.findById(input.tenantId, input.id);
  if (!token) throw new Error(`CapabilityToken ${input.id} not found`);
  const now = nowFrom(deps);
  const updated: CapabilityToken = { ...token, status: "REVOKED", revokedAt: now, updatedAt: now };
  await deps.capabilityTokens.save(updated);
  return updated;
}
