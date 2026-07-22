import type { MeContextResponse } from "@maitre/contracts";
import { isUserEligibleForSession } from "@maitre/identity";
import { isTenantOperable } from "@maitre/organization";
import type { Container } from "./container.js";

export class AuthenticationRequiredError extends Error {}
export class SessionExpiredError extends Error {}
export class IdentityNotEnabledError extends Error {}

/**
 * SPEC-023 §6 + SPEC-213 — resolve the authenticated principal into the
 * effective, authorized context (tenants/branches the user may act in).
 */
export async function resolveMeContext(
  container: Container,
  authorizationHeader: string | undefined,
): Promise<MeContextResponse> {
  const token = extractBearerToken(authorizationHeader);
  if (!token) throw new AuthenticationRequiredError();

  let principal;
  try {
    principal = await container.sessions.verifyAccessToken(token);
  } catch (err) {
    if (err instanceof Error && err.message === "session-expired") {
      throw new SessionExpiredError();
    }
    throw new AuthenticationRequiredError();
  }

  const user = await container.users.findByExternalIdentity(
    principal.provider,
    principal.subject,
  );
  if (!user || !isUserEligibleForSession(user)) {
    throw new IdentityNotEnabledError();
  }

  const activeMemberships = await container.memberships.listActiveByUser(user.id);

  const tenants: MeContextResponse["tenants"] = [];
  for (const membership of activeMemberships) {
    const tenant = await container.tenants.findById(membership.tenantId);
    if (!tenant || !isTenantOperable(tenant)) continue;

    const allBranches = await container.branches.listByTenant(tenant.id);
    const scopedBranches =
      membership.branchScopeType === "ALL_BRANCHES"
        ? allBranches
        : allBranches.filter((b) => membership.branchIds.includes(b.id));

    tenants.push({
      id: tenant.id,
      name: tenant.name,
      branches: scopedBranches
        .filter((b) => b.status === "ACTIVE")
        .map((b) => ({ id: b.id, code: b.code, name: b.name })),
    });
  }

  return {
    user: { id: user.id, displayName: user.displayName, email: user.email ?? null },
    tenants,
  };
}

function extractBearerToken(header: string | undefined): string | null {
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}
