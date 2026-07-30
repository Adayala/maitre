import { randomUUID } from "node:crypto";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { recordAuditLog, type AuditAction, type AuditOutcome } from "@maitre/audit";
import type { Container } from "../composition/container.js";
import { tenantContextForRequest } from "./request-context.js";

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const AUDIT_RATE_LIMIT_WINDOW_MS = 60_000;
const AUDIT_RATE_LIMIT_MAX = 120;
const auditRateLimitBuckets = new Map<string, { count: number; resetAt: number }>();
const DOMAIN_SEGMENTS: Record<string, string> = {
  visits: "FLOOR",
  checks: "FLOOR",
  payments: "CASH",
  "service-periods": "FLOOR",
  orders: "ORDERING",
  kitchen: "KITCHEN",
  stations: "KITCHEN",
  "cash-registers": "CASH",
  "cash-sessions": "CASH",
  "cash-reconciliations": "CASH",
};

export interface MutationAuditPolicy {
  action: AuditAction;
  actionCode: string;
  resourceType: string;
}

export function mutationAuditPolicy(
  method: string,
  routeTemplate: string,
): MutationAuditPolicy | null {
  if (!MUTATION_METHODS.has(method)) return null;
  const segments = routeTemplate.split("/").filter(Boolean);
  if (segments[0] !== "v1") return null;
  const resourceSegment = segments[1];
  if (!resourceSegment) return null;
  const domain = DOMAIN_SEGMENTS[resourceSegment];
  if (!domain) return null;

  return {
    action: method === "POST" ? "CREATE" : method === "DELETE" ? "DELETE" : "UPDATE",
    actionCode: `${domain}_${method}_${segments
      .slice(1)
      .filter((segment) => !segment.startsWith(":"))
      .join("_")
      .replaceAll("-", "_")
      .toUpperCase()}`,
    resourceType: resourceSegment.replaceAll("-", "_").toUpperCase(),
  };
}

export function registerMutationAudit(
  app: FastifyInstance,
  container: Container,
): void {
  app.addHook("onResponse", async (request, reply) => {
    const rateLimitKey = auditRateLimitKeyFor(request);
    if (isAuditRateLimited(rateLimitKey)) return;

    const routeTemplate = request.routeOptions.url;
    if (!routeTemplate) return;
    const policy = mutationAuditPolicy(request.method, routeTemplate);
    const context = tenantContextForRequest(request);
    if (!policy || !context) return;

    const outcome = outcomeFor(reply.statusCode);
    const branchId = authorizedBranchHint(request, context);
    try {
      await recordAuditLog(
        { auditLogs: container.auditLogs },
        {
          tenantId: context.tenantId,
          actorType: "USER",
          actorId: context.userId,
          action: policy.action,
          actionCode: policy.actionCode,
          outcome,
          resourceType: policy.resourceType,
          resourceId: resourceIdFor(request),
          requestId: request.id,
          correlationId: correlationIdFor(request, reply),
          reasonCode: outcome === "SUCCEEDED" ? "HTTP_SUCCESS" : `HTTP_${reply.statusCode}`,
          ...(branchId ? { branchId } : {}),
          newState: {
            route: routeTemplate,
            method: request.method,
            statusCode: reply.statusCode,
          },
        },
      );
    } catch (error) {
      request.log.error(
        {
          eventCode: "AUDIT_APPEND_FAILED",
          actionCode: policy.actionCode,
          errorName: error instanceof Error ? error.name : "UnknownError",
        },
        "sensitive mutation audit append failed",
      );
    }
  });
}

function outcomeFor(statusCode: number): AuditOutcome {
  if (statusCode >= 200 && statusCode < 400) return "SUCCEEDED";
  if (statusCode === 401 || statusCode === 403 || statusCode === 404) return "DENIED";
  return "FAILED";
}

function resourceIdFor(request: FastifyRequest): string {
  const params = request.params as Record<string, unknown>;
  const candidate = Object.values(params).find(
    (value) => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(value),
  );
  return typeof candidate === "string" ? candidate : randomUUID();
}

function authorizedBranchHint(
  request: FastifyRequest,
  context: NonNullable<ReturnType<typeof tenantContextForRequest>>,
): string | undefined {
  const branchId = request.headers["x-branch-id"];
  if (typeof branchId !== "string") return undefined;
  if (context.branchScopeType === "ALL_BRANCHES" || context.branchIds.includes(branchId)) {
    return branchId;
  }
  return undefined;
}

function correlationIdFor(
  request: FastifyRequest,
  reply: { getHeader(name: string): string | number | string[] | undefined },
): string {
  const responseValue = reply.getHeader("x-correlation-id");
  if (typeof responseValue === "string" && isUuid(responseValue)) return responseValue;
  const requestValue = request.headers["x-correlation-id"];
  return typeof requestValue === "string" && isUuid(requestValue)
    ? requestValue
    : randomUUID();
}

function auditRateLimitKeyFor(request: FastifyRequest): string {
  const forwardedFor = request.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    return forwardedFor.split(",")[0]!.trim();
  }
  return request.ip;
}

function isAuditRateLimited(key: string): boolean {
  const now = Date.now();
  const current = auditRateLimitBuckets.get(key);
  if (!current || current.resetAt <= now) {
    auditRateLimitBuckets.set(key, {
      count: 1,
      resetAt: now + AUDIT_RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  if (current.count >= AUDIT_RATE_LIMIT_MAX) return true;
  current.count += 1;
  return false;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
