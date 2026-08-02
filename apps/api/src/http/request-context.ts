import type { FastifyRequest } from "fastify";
import { isUserEligibleForSession, hasPermission } from "@maitre/identity";
import { isTenantOperable } from "@maitre/organization";
import { TELEMETRY_SIGNALS } from "@maitre/telemetry";
import type { Container } from "../composition/container.js";
import { resolveDomainUser } from "../composition/resolve-domain-user.js";
import {
  authenticationRequired,
  sessionExpired,
  identityNotEnabled,
  insufficientScope,
} from "./problem-details.js";
import {
  incrementRequestTelemetry,
  startRequestTelemetrySpan,
} from "./observability.js";

export interface AuthenticatedContext {
  userId: string;
  externalIdentityId: string;
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

const tenantContextByRequest = new WeakMap<FastifyRequest, TenantContext>();

export function tenantContextForRequest(
  request: FastifyRequest,
): TenantContext | undefined {
  return tenantContextByRequest.get(request);
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
  const authSpan = startRequestTelemetrySpan(req, "auth verify access token", {
    kind: "INTERNAL",
    attributes: { "auth.operation": "verify_access_token" },
  });
  const token = extractBearerToken(req.headers.authorization);
  if (!token) {
    authSpan?.end("ERROR");
    authMetric(req, "denied");
    throw authenticationRequired();
  }

  let principal;
  try {
    principal = await container.sessions.verifyAccessToken(token);
  } catch (err) {
    req.log.warn(
      {
        errorName: err instanceof Error ? err.name : "UnknownError",
        errorMessage:
          err instanceof Error ? err.message : "token verification failed",
      },
      "access token verification failed",
    );
    authSpan?.end("ERROR");
    authMetric(req, "denied");
    if (err instanceof Error && err.message === "session-expired")
      throw sessionExpired();
    throw authenticationRequired();
  }

  const user = await resolveDomainUser(container, principal);
  if (!user || !isUserEligibleForSession(user)) {
    authSpan?.end("ERROR");
    authMetric(req, "denied");
    throw identityNotEnabled();
  }

  authSpan?.end("OK");
  authMetric(req, "success");
  return {
    userId: user.id,
    externalIdentityId: user.externalIdentityId,
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
  const contextSpan = startRequestTelemetrySpan(
    req,
    "auth resolve tenant context",
    {
      kind: "INTERNAL",
      attributes: { "auth.operation": "resolve_tenant_context" },
    },
  );
  try {
    const auth = await requireAuthenticatedContext(container, req);

    const tenantId = req.headers["x-tenant-id"] as string | undefined;
    if (!tenantId) throw insufficientScope();

    const [tenant, membership] = await Promise.all([
      container.tenants.findById(tenantId),
      container.memberships.findActiveByUserAndTenant(auth.userId, tenantId),
    ]);
    if (!tenant || !isTenantOperable(tenant)) throw insufficientScope();
    if (!membership) throw insufficientScope();

    const context: TenantContext = {
      userId: auth.userId,
      sessionIssuedAt: auth.sessionIssuedAt,
      sessionExpiresAt: auth.sessionExpiresAt,
      tenantId,
      roleIds: membership.roleIds,
      branchScopeType: membership.branchScopeType,
      branchIds: membership.branchIds,
      externalIdentityId: auth.externalIdentityId,
    };
    tenantContextByRequest.set(req, context);
    contextSpan?.end("OK");
    contextMetric(req, "success");
    return context;
  } catch (error) {
    contextSpan?.end("ERROR");
    contextMetric(req, "failure");
    throw error;
  }
}

export function requirePermission(
  context: TenantContext,
  permissionId: string,
): void {
  if (!hasPermission(context.roleIds, permissionId)) throw insufficientScope();
}

export function hasContextPermission(
  context: TenantContext,
  permissionId: string,
): boolean {
  return hasPermission(context.roleIds, permissionId);
}

function authMetric(
  request: FastifyRequest,
  outcome: "success" | "denied",
): void {
  incrementRequestTelemetry(request, TELEMETRY_SIGNALS.authAttempts, {
    operation: "verify_access_token",
    outcome,
  });
}

function contextMetric(
  request: FastifyRequest,
  outcome: "success" | "failure",
): void {
  incrementRequestTelemetry(request, TELEMETRY_SIGNALS.contextResolution, {
    operation: "resolve_tenant_context",
    outcome,
  });
}
