import type { MeContextResponse } from "@maitre/contracts";
import {
  isUserEligibleForSession,
  userAuthenticatedEvent,
} from "@maitre/identity";
import { isTenantOperable } from "@maitre/organization";
import type { Container } from "./container.js";
import { resolveDomainUser } from "./resolve-domain-user.js";

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
  correlationId: string,
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

  const user = await resolveDomainUser(container, principal);
  if (!user || !isUserEligibleForSession(user)) {
    throw new IdentityNotEnabledError();
  }

  // SPEC-025 — audit fact of a successful authentication, fired from this
  // discovery endpoint since Maitre has no /auth/login of its own (SPEC-023).
  const [, activeMemberships] = await Promise.all([
    container.outbox.append(
      userAuthenticatedEvent(user, principal, correlationId),
    ),
    container.memberships.listActiveByUser(user.id),
  ]);

  const resolvedTenants = await Promise.all(
    activeMemberships.map(async (membership) => {
      const [tenant, allBranches] = await Promise.all([
        container.tenants.findById(membership.tenantId),
        container.branches.listByTenant(membership.tenantId),
      ]);
      if (!tenant || !isTenantOperable(tenant)) return null;

      const scopedBranches =
        membership.branchScopeType === "ALL_BRANCHES"
          ? allBranches
          : allBranches.filter((branch) =>
              membership.branchIds.includes(branch.id),
            );

      return {
        id: tenant.id,
        name: tenant.name,
        branches: scopedBranches
          .filter((branch) => branch.status === "ACTIVE")
          .map((branch) => ({
            id: branch.id,
            code: branch.code,
            name: branch.name,
          })),
      };
    }),
  );
  const tenants = resolvedTenants.filter(
    (tenant): tenant is MeContextResponse["tenants"][number] => tenant !== null,
  );

  return {
    user: {
      id: user.id,
      displayName: user.displayName,
      email: user.email ?? null,
    },
    tenants,
  };
}

function extractBearerToken(header: string | undefined): string | null {
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}
