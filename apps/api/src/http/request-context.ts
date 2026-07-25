import type { FastifyRequest } from "fastify";
import { isUserEligibleForSession, hasPermission } from "@maitre/identity";
import { isTenantOperable } from "@maitre/organization";
import type { Container } from "../composition/container.js";
import {
  authenticationRequired,
  sessionExpired,
  identityNotEnabled,
  insufficientScope,
} from "./problem-details.js";

export interface AuthenticatedContext {
  userId: string;
  sessionIssuedAt: Date;
  sessionExpiresAt: Date;
}

export interface TenantContext extends AuthenticatedContext {
  tenantId: string;
  roleIds: string[];
  branchScopeType: "ALL_BRANCHES" | "SELECTED_BRANCHES";
  branchIds: string[];
  externalIdentityId: string;
}

function extractBearerToken(header: string | undefined): string | null {
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

// SPEC-023 §6 — verify the token and resolve it to an eligible domain User.
export async function requireAuthenticatedContext(
  container: Container,
  req: FastifyRequest,
): Promise<AuthenticatedContext> {
  const token = extractBearerToken(req.headers.authorization);
  if (!token) throw authenticationRequired();

  let principal;
  try {
    principal = await container.sessions.verifyAccessToken(token);
  } catch (err) {
    if (err instanceof Error && err.message === "session-expired") throw sessionExpired();
    throw authenticationRequired();
  }

  const user = await container.users.findByExternalIdentity(
    principal.provider,
    principal.subject,
  );
  if (!user || !isUserEligibleForSession(user)) throw identityNotEnabled();

  return {
    userId: user.id,
    sessionIssuedAt: principal.issuedAt,
    sessionExpiresAt: principal.expiresAt,
  };
}

// SPEC-215 §4 — X-Tenant-Id expresses a requested selection; the server
// verifies membership before honoring it. Not required by /v1/me/context.
export async function requireTenantContext(
  container: Container,
  req: FastifyRequest,
): Promise<TenantContext> {
  const auth = await requireAuthenticatedContext(container, req);

  const tenantId = req.headers["x-tenant-id"] as string | undefined;
  if (!tenantId) throw insufficientScope();

  const tenant = await container.tenants.findById(tenantId);
  if (!tenant || !isTenantOperable(tenant)) throw insufficientScope();

  const membership = await container.memberships.findActiveByUserAndTenant(
    auth.userId,
    tenantId,
  );
  if (!membership) throw insufficientScope();

  const user = await container.users.findById(auth.userId);
  if (!user || !isUserEligibleForSession(user)) throw identityNotEnabled();

  return {
    userId: auth.userId,
    sessionIssuedAt: auth.sessionIssuedAt,
    sessionExpiresAt: auth.sessionExpiresAt,
    tenantId,
    roleIds: membership.roleIds,
    branchScopeType: membership.branchScopeType,
    branchIds: membership.branchIds,
    externalIdentityId: user.externalIdentityId,
  };
}

export function requirePermission(context: TenantContext, permissionId: string): void {
  if (!hasPermission(context.roleIds, permissionId)) throw insufficientScope();
}

export function hasContextPermission(context: TenantContext, permissionId: string): boolean {
  return hasPermission(context.roleIds, permissionId);
}
