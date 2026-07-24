// SPEC-084/085/090/091 — public capability tokens (MENU_READ, BILL_READ,
// ORDER_TRACK_READ). One unified model/repo with a `purpose` discriminator
// realizes all three (documented consolidation): each is a random opaque token
// with >=128 bits of entropy, stored ONLY as a SHA-256 hash at rest (the
// "hash at rest" requirement, done for real), with a validity window and
// revocation.
//
// SCOPE NOTE (deferred, documented): rotation (rotatedFromId), rate limiting,
// cache-key/ETag/versioned-snapshot-freeze mechanics, and locale negotiation
// are NOT implemented. Resolution always reads the live underlying resource
// (published Menu / live Check / live Order). Invalid, expired or revoked
// tokens all resolve to the same generic not-resolvable outcome (the route
// maps it to a 404) so the surface can't be enumerated.

import { randomBytes, createHash } from "node:crypto";

export type CapabilityPurpose = "MENU_READ" | "BILL_READ" | "ORDER_TRACK_READ";
export type CapabilityTokenStatus = "ACTIVE" | "REVOKED" | "EXPIRED";
export type CapabilityResourceType = "MENU" | "CHECK" | "ORDER";

export interface CapabilityToken {
  id: string;
  tenantId: string;
  purpose: CapabilityPurpose;
  tokenHash: string;
  resourceType: CapabilityResourceType;
  resourceId: string;
  branchId?: string;
  tableId?: string;
  status: CapabilityTokenStatus;
  issuedAt: Date;
  expiresAt?: Date | null;
  revokedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// 32 random bytes = 256 bits of entropy, base64url — the raw token is returned
// to the caller exactly once and never persisted; only its hash is stored.
export function generateOpaqueToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

export function resourceTypeForPurpose(purpose: CapabilityPurpose): CapabilityResourceType {
  switch (purpose) {
    case "MENU_READ":
      return "MENU";
    case "BILL_READ":
      return "CHECK";
    case "ORDER_TRACK_READ":
      return "ORDER";
  }
}

// A token is resolvable only when ACTIVE and not past its expiry. Expiry is
// evaluated at resolution time so an un-swept ACTIVE-but-expired row still
// fails closed.
export function isCapabilityTokenResolvable(token: CapabilityToken, now: Date): boolean {
  if (token.status !== "ACTIVE") return false;
  if (token.expiresAt && token.expiresAt.getTime() <= now.getTime()) return false;
  return true;
}
