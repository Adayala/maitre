import { createHash, randomUUID } from "node:crypto";
import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  onSendHookHandler,
} from "fastify";
import {
  recordAuditLog,
  sanitizeAuditEvidence,
  type AuditAction,
  type AuditOutcome,
} from "@maitre/audit";
import { TELEMETRY_SIGNALS, type TelemetryPort } from "@maitre/telemetry";
import type { Container } from "../composition/container.js";
import { tenantContextForRequest } from "./request-context.js";

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const coveredDomainSegments = new Set([
  "visits",
  "occupancies",
  "checks",
  "payments",
  "service-periods",
  "orders",
  "kitchen",
  "stations",
  "cash-registers",
  "cash-sessions",
  "cash-movements",
  "cash-reconciliations",
  "discounts",
]);
const safeBodyKeys = new Set([
  "amountMinorUnits",
  "branchId",
  "businessDate",
  "cashSessionId",
  "countedMinorUnits",
  "currency",
  "direction",
  "guestCount",
  "newQuantity",
  "openingAmountMinorUnits",
  "priority",
  "quantity",
  "reasonCode",
  "status",
  "tableIds",
  "targetStationId",
  "timezone",
  "to",
  "type",
]);

export interface MutationAuditPolicy {
  action: AuditAction;
  actionCode: string;
  resourceType: string;
  resourceParam?: string;
}

interface RegisteredPolicy extends MutationAuditPolicy {
  method: string;
  route: string;
}

function policy(
  method: string,
  route: string,
  actionCode: string,
  resourceType: string,
  action: AuditAction = "UPDATE",
  resourceParam = "id",
): RegisteredPolicy {
  return { method, route, action, actionCode, resourceType, resourceParam };
}

export const SENSITIVE_MUTATION_POLICIES: readonly RegisteredPolicy[] = [
  policy(
    "POST",
    "/v1/branches/:branchId/service-periods",
    "SERVICE_PERIOD_PLANNED",
    "SERVICE_PERIOD",
    "CREATE",
    "branchId",
  ),
  policy(
    "POST",
    "/v1/service-periods/:id/open",
    "SERVICE_PERIOD_OPENED",
    "SERVICE_PERIOD",
  ),
  policy(
    "POST",
    "/v1/service-periods/:id/begin-close",
    "SERVICE_PERIOD_CLOSE_STARTED",
    "SERVICE_PERIOD",
  ),
  policy(
    "POST",
    "/v1/service-periods/:id/close",
    "SERVICE_PERIOD_CLOSED",
    "SERVICE_PERIOD",
  ),
  policy(
    "POST",
    "/v1/service-periods/:id/force-close",
    "SERVICE_PERIOD_FORCE_CLOSED",
    "SERVICE_PERIOD",
  ),
  policy(
    "POST",
    "/v1/service-periods/:id/cancel-planned",
    "SERVICE_PERIOD_CANCELLED",
    "SERVICE_PERIOD",
  ),
  policy("POST", "/v1/visits", "VISIT_OPENED", "VISIT", "CREATE"),
  policy("POST", "/v1/visits/:id/move", "VISIT_TABLES_MOVED", "VISIT"),
  policy(
    "POST",
    "/v1/visits/:id/request-close",
    "VISIT_CLOSE_REQUESTED",
    "VISIT",
  ),
  policy("POST", "/v1/visits/:id/close", "VISIT_CLOSED", "VISIT"),
  policy("POST", "/v1/visits/:id/cancel", "VISIT_CANCELLED", "VISIT"),
  policy("POST", "/v1/visits/:id/reopen", "VISIT_REOPENED", "VISIT"),
  policy(
    "POST",
    "/v1/occupancies/:id/release",
    "OCCUPANCY_RELEASED",
    "OCCUPANCY",
  ),
  policy("POST", "/v1/visits/:id/check", "CHECK_CREATED", "CHECK", "CREATE"),
  policy("POST", "/v1/checks/:id/add-line", "CHECK_LINE_ADDED", "CHECK"),
  policy(
    "POST",
    "/v1/checks/:id/add-adjustment",
    "CHECK_ADJUSTMENT_ADDED",
    "CHECK",
  ),
  policy(
    "POST",
    "/v1/checks/:id/request-payment",
    "CHECK_PAYMENT_REQUESTED",
    "CHECK",
  ),
  policy("POST", "/v1/checks/:id/void", "CHECK_VOIDED", "CHECK"),
  policy("POST", "/v1/checks/:id/settle", "CHECK_SETTLED", "CHECK"),
  policy(
    "POST",
    "/v1/visits/:visitId/orders",
    "ORDER_CREATED",
    "ORDER",
    "CREATE",
    "visitId",
  ),
  policy("POST", "/v1/orders/:id/items", "ORDER_ITEM_ADDED", "ORDER"),
  policy("POST", "/v1/orders/:id/submit", "ORDER_SUBMITTED", "ORDER"),
  policy("POST", "/v1/orders/:id/cancel", "ORDER_CANCELLED", "ORDER"),
  policy(
    "POST",
    "/v1/orders/:id/tracking-token",
    "ORDER_TRACKING_TOKEN_ISSUED",
    "ORDER",
  ),
  policy(
    "POST",
    "/v1/orders/:id/items/:itemId/cancel",
    "ORDER_ITEM_CANCELLED",
    "ORDER_ITEM",
    "UPDATE",
    "itemId",
  ),
  policy(
    "POST",
    "/v1/orders/:id/items/:itemId/change-quantity",
    "ORDER_ITEM_QUANTITY_CHANGED",
    "ORDER_ITEM",
    "UPDATE",
    "itemId",
  ),
  policy(
    "POST",
    "/v1/orders/:id/items/:itemId/transition",
    "ORDER_ITEM_TRANSITIONED",
    "ORDER_ITEM",
    "UPDATE",
    "itemId",
  ),
  policy(
    "POST",
    "/v1/branches/:branchId/kitchen/stations",
    "KITCHEN_STATION_CREATED",
    "KITCHEN_STATION",
    "CREATE",
    "branchId",
  ),
  policy(
    "PATCH",
    "/v1/kitchen/stations/:id",
    "KITCHEN_STATION_UPDATED",
    "KITCHEN_STATION",
  ),
  policy(
    "POST",
    "/v1/kitchen/stations/:id/activate",
    "KITCHEN_STATION_ACTIVATED",
    "KITCHEN_STATION",
  ),
  policy(
    "POST",
    "/v1/kitchen/stations/:id/deactivate",
    "KITCHEN_STATION_DEACTIVATED",
    "KITCHEN_STATION",
  ),
  policy(
    "POST",
    "/v1/kitchen/commands/:id/claim",
    "KITCHEN_COMMAND_CLAIMED",
    "KITCHEN_COMMAND",
  ),
  policy(
    "POST",
    "/v1/kitchen/commands/:id/release",
    "KITCHEN_COMMAND_RELEASED",
    "KITCHEN_COMMAND",
  ),
  policy(
    "POST",
    "/v1/kitchen/commands/:id/start",
    "KITCHEN_COMMAND_STARTED",
    "KITCHEN_COMMAND",
  ),
  policy(
    "POST",
    "/v1/kitchen/commands/:id/hold",
    "KITCHEN_COMMAND_PAUSED",
    "KITCHEN_COMMAND",
  ),
  policy(
    "POST",
    "/v1/kitchen/commands/:id/resume",
    "KITCHEN_COMMAND_RESUMED",
    "KITCHEN_COMMAND",
  ),
  policy(
    "POST",
    "/v1/kitchen/commands/:id/mark-ready",
    "KITCHEN_COMMAND_READY",
    "KITCHEN_COMMAND",
  ),
  policy(
    "POST",
    "/v1/kitchen/commands/:id/complete-handoff",
    "KITCHEN_COMMAND_SERVED",
    "KITCHEN_COMMAND",
  ),
  policy(
    "POST",
    "/v1/kitchen/commands/:id/rollback",
    "KITCHEN_COMMAND_ROLLED_BACK",
    "KITCHEN_COMMAND",
  ),
  policy(
    "POST",
    "/v1/kitchen/commands/:id/cancel",
    "KITCHEN_COMMAND_CANCELLED",
    "KITCHEN_COMMAND",
  ),
  policy(
    "POST",
    "/v1/kitchen/commands/:id/transfer",
    "KITCHEN_COMMAND_REROUTED",
    "KITCHEN_COMMAND",
  ),
  policy(
    "POST",
    "/v1/kitchen/commands/:id/reprioritize",
    "KITCHEN_COMMAND_REPRIORITIZED",
    "KITCHEN_COMMAND",
  ),
  policy(
    "POST",
    "/v1/branches/:branchId/kitchen/alerts/evaluate",
    "KITCHEN_ALERTS_EVALUATED",
    "KITCHEN_ALERT",
    "CREATE",
    "branchId",
  ),
  policy(
    "POST",
    "/v1/kitchen/alerts/:id/acknowledge",
    "KITCHEN_ALERT_ACKNOWLEDGED",
    "KITCHEN_ALERT",
  ),
  policy(
    "POST",
    "/v1/kitchen/alerts/:id/resolve",
    "KITCHEN_ALERT_RESOLVED",
    "KITCHEN_ALERT",
  ),
  policy(
    "POST",
    "/v1/kitchen/alerts/:id/escalate",
    "KITCHEN_ALERT_ESCALATED",
    "KITCHEN_ALERT",
  ),
  policy(
    "POST",
    "/v1/cash-registers",
    "CASH_REGISTER_CREATED",
    "CASH_REGISTER",
    "CREATE",
  ),
  policy(
    "POST",
    "/v1/cash-registers/:id/sessions",
    "CASH_SESSION_OPENED",
    "CASH_SESSION",
    "CREATE",
  ),
  policy(
    "POST",
    "/v1/cash-sessions/:id/movements",
    "CASH_MOVEMENT_RECORDED",
    "CASH_MOVEMENT",
    "CREATE",
  ),
  policy(
    "POST",
    "/v1/cash-movements/:id/compensate",
    "CASH_MOVEMENT_VOIDED",
    "CASH_MOVEMENT",
  ),
  policy(
    "POST",
    "/v1/cash-reconciliations/:id/record-counts",
    "RECONCILIATION_COUNT_RECORDED",
    "CASH_RECONCILIATION",
  ),
  policy(
    "POST",
    "/v1/cash-reconciliations/:id/submit",
    "RECONCILIATION_SUBMITTED",
    "CASH_RECONCILIATION",
  ),
  policy(
    "POST",
    "/v1/cash-reconciliations/:id/approve",
    "RECONCILIATION_APPROVED",
    "CASH_RECONCILIATION",
  ),
  policy(
    "POST",
    "/v1/cash-reconciliations/:id/reject",
    "RECONCILIATION_REOPENED",
    "CASH_RECONCILIATION",
  ),
  policy(
    "POST",
    "/v1/cash-sessions/:id/begin-close",
    "CASH_SESSION_CLOSE_STARTED",
    "CASH_SESSION",
  ),
  policy(
    "POST",
    "/v1/cash-sessions/:id/close",
    "CASH_SESSION_CLOSED",
    "CASH_SESSION",
  ),
  policy(
    "POST",
    "/v1/cash-sessions/:id/suspend",
    "CASH_SESSION_SUSPENDED",
    "CASH_SESSION",
  ),
  policy(
    "POST",
    "/v1/cash-sessions/:id/resume",
    "CASH_SESSION_RESUMED",
    "CASH_SESSION",
  ),
  policy(
    "POST",
    "/v1/checks/:id/payments",
    "PAYMENT_CREATED",
    "PAYMENT",
    "CREATE",
  ),
  policy("POST", "/v1/payments/:id/capture", "PAYMENT_CAPTURED", "PAYMENT"),
  policy("POST", "/v1/payments/:id/fail", "PAYMENT_FAILED", "PAYMENT"),
  policy("POST", "/v1/payments/:id/void", "PAYMENT_VOIDED", "PAYMENT"),
  policy("POST", "/v1/payments/:id/refund", "PAYMENT_REFUNDED", "PAYMENT"),
  policy("POST", "/v1/discounts", "DISCOUNT_CREATED", "DISCOUNT", "CREATE"),
  policy("POST", "/v1/discounts/:id/publish", "DISCOUNT_APPROVED", "DISCOUNT"),
  policy(
    "POST",
    "/v1/discounts/:id/deactivate",
    "DISCOUNT_REVOKED",
    "DISCOUNT",
  ),
  policy("POST", "/v1/discounts/:id/apply", "DISCOUNT_APPLIED", "DISCOUNT"),
] as const;

const policies = new Map(
  SENSITIVE_MUTATION_POLICIES.map((entry) => [
    `${entry.method} ${entry.route}`,
    entry,
  ]),
);

export function mutationAuditPolicy(
  method: string,
  routeTemplate: string,
): MutationAuditPolicy | null {
  if (!MUTATION_METHODS.has(method)) return null;
  return policies.get(`${method} ${routeTemplate}`) ?? null;
}

export function registerMutationAudit(
  app: FastifyInstance,
  container: Container,
  telemetry: TelemetryPort,
): void {
  app.addHook("onRoute", (route) => {
    const methods = Array.isArray(route.method) ? route.method : [route.method];
    for (const method of methods) {
      if (
        MUTATION_METHODS.has(method) &&
        isCoveredDomainRoute(route.url) &&
        !mutationAuditPolicy(method, route.url)
      ) {
        telemetry.increment(TELEMETRY_SIGNALS.auditPolicyMissing, 1, {
          method,
          route: route.url,
        });
        throw new Error(
          `sensitive-mutation-audit-policy-missing:${method} ${route.url}`,
        );
      }
    }
  });

  const audited = new WeakSet<FastifyRequest>();
  const appendAudit: onSendHookHandler = (request, reply, payload, done) => {
    if (audited.has(request)) return done(null, payload);
    const routeTemplate = request.routeOptions.url;
    if (!routeTemplate) return done(null, payload);
    const policy = mutationAuditPolicy(request.method, routeTemplate);
    const context = tenantContextForRequest(request);
    if (!policy || !context) return done(null, payload);

    const outcome = outcomeFor(reply.statusCode);
    // Keep error serialization synchronous. Several handlers use reply.send()
    // directly; awaiting an onSend hook there lets the async route finish before
    // Fastify marks the reply as sent and can trigger a duplicate send.
    if (outcome !== "SUCCEEDED") return done(null, payload);

    audited.add(request);
    void persistAudit({
      request,
      reply,
      payload,
      policy,
      context,
      container,
      telemetry,
      failClosed: true,
    }).then(
      () => done(null, payload),
      (error: Error) => done(error),
    );
  };
  app.addHook("onSend", appendAudit);

  app.addHook("onResponse", async (request, reply) => {
    if (audited.has(request)) return;
    const routeTemplate = request.routeOptions.url;
    if (!routeTemplate) return;
    const policy = mutationAuditPolicy(request.method, routeTemplate);
    const context = tenantContextForRequest(request);
    if (!policy || !context) return;
    const outcome = outcomeFor(reply.statusCode);
    if (outcome === "SUCCEEDED") return;

    audited.add(request);
    await persistAudit({
      request,
      reply,
      payload: undefined,
      policy,
      context,
      container,
      telemetry,
      failClosed: false,
    });
  });
}

interface PersistAuditOptions {
  request: FastifyRequest;
  reply: FastifyReply;
  payload: unknown;
  policy: MutationAuditPolicy;
  context: NonNullable<ReturnType<typeof tenantContextForRequest>>;
  container: Container;
  telemetry: TelemetryPort;
  failClosed: boolean;
}

async function persistAudit({
  request,
  reply,
  payload,
  policy,
  context,
  container,
  telemetry,
  failClosed,
}: PersistAuditOptions): Promise<void> {
  const outcome = outcomeFor(reply.statusCode);
  const branchId = authorizedBranchFor(request, context);
  const evidence = projectEvidence(request, reply, payload);
  const evidenceBytes = Buffer.byteLength(JSON.stringify(evidence), "utf8");
  telemetry.observe(TELEMETRY_SIGNALS.auditEvidenceSize, evidenceBytes, {
    action_code: policy.actionCode,
    outcome,
  });

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
        resourceId: resourceIdFor(request, payload, policy),
        requestId: request.id,
        correlationId: correlationIdFor(request, reply),
        reasonCode: reasonCodeFor(request, reply.statusCode, outcome),
        ...(branchId ? { branchId } : {}),
        newState: evidence,
      },
    );
    telemetry.increment(TELEMETRY_SIGNALS.auditAppend, 1, {
      action_code: policy.actionCode,
      outcome: "success",
    });
  } catch (error) {
    telemetry.increment(TELEMETRY_SIGNALS.auditAppend, 1, {
      action_code: policy.actionCode,
      outcome: "failure",
    });
    request.log.error(
      {
        eventCode: "AUDIT_APPEND_FAILED",
        actionCode: policy.actionCode,
        errorName: error instanceof Error ? error.name : "UnknownError",
      },
      "sensitive mutation audit append failed",
    );
    // Successful mutations fail closed at the HTTP boundary. Failed and denied
    // requests are already complete, so their audit append is best effort.
    if (failClosed) throw error;
  }
}

function projectEvidence(
  request: FastifyRequest,
  reply: FastifyReply,
  payload: unknown,
): unknown {
  const body = request.body;
  const projectedBody: Record<string, unknown> = {};
  if (body && typeof body === "object" && !Array.isArray(body)) {
    for (const [key, value] of Object.entries(
      body as Record<string, unknown>,
    )) {
      if (safeBodyKeys.has(key)) {
        projectedBody[key] = value;
      }
      if (key === "idempotencyKey" && typeof value === "string") {
        projectedBody["idempotencyKeyHash"] = createHash("sha256")
          .update(value)
          .digest("hex");
      }
    }
  }
  return sanitizeAuditEvidence({
    route: request.routeOptions.url,
    method: request.method,
    statusCode: reply.statusCode,
    ...(Object.keys(projectedBody).length > 0 ? { fields: projectedBody } : {}),
    responseResourceId: responseResourceId(payload),
  });
}

function outcomeFor(statusCode: number): AuditOutcome {
  if (statusCode >= 200 && statusCode < 400) return "SUCCEEDED";
  if (statusCode === 401 || statusCode === 403 || statusCode === 404)
    return "DENIED";
  return "FAILED";
}

function resourceIdFor(
  request: FastifyRequest,
  payload: unknown,
  policy: MutationAuditPolicy,
): string {
  const responseId = responseResourceId(payload);
  if (responseId) return responseId;
  const params = request.params as Record<string, unknown>;
  const configured = policy.resourceParam
    ? params[policy.resourceParam]
    : undefined;
  if (typeof configured === "string" && isUuid(configured)) return configured;
  return randomUUID();
}

function responseResourceId(payload: unknown): string | undefined {
  let parsed: unknown = payload;
  try {
    if (Buffer.isBuffer(payload)) parsed = JSON.parse(payload.toString("utf8"));
    if (typeof payload === "string") parsed = JSON.parse(payload);
  } catch {
    return undefined;
  }
  if (!parsed || typeof parsed !== "object") return undefined;
  const data = (parsed as Record<string, unknown>)["data"];
  if (!data || typeof data !== "object") return undefined;
  const direct = (data as Record<string, unknown>)["id"];
  if (typeof direct === "string" && isUuid(direct)) return direct;
  for (const nested of ["order", "session", "reconciliation", "payment"]) {
    const value = (data as Record<string, unknown>)[nested];
    if (value && typeof value === "object") {
      const id = (value as Record<string, unknown>)["id"];
      if (typeof id === "string" && isUuid(id)) return id;
    }
  }
  return undefined;
}

function authorizedBranchFor(
  request: FastifyRequest,
  context: NonNullable<ReturnType<typeof tenantContextForRequest>>,
): string | undefined {
  const params = request.params as Record<string, unknown>;
  const body =
    request.body && typeof request.body === "object"
      ? (request.body as Record<string, unknown>)
      : {};
  const candidates = [
    request.headers["x-branch-id"],
    params["branchId"],
    body["branchId"],
    context.branchIds.length === 1 ? context.branchIds[0] : undefined,
  ];
  for (const candidate of candidates) {
    if (
      typeof candidate === "string" &&
      (context.branchScopeType === "ALL_BRANCHES" ||
        context.branchIds.includes(candidate))
    ) {
      return candidate;
    }
  }
  return undefined;
}

function correlationIdFor(
  request: FastifyRequest,
  reply: FastifyReply,
): string {
  const responseValue = reply.getHeader("x-correlation-id");
  if (typeof responseValue === "string" && isUuid(responseValue))
    return responseValue;
  const requestValue = request.headers["x-correlation-id"];
  return typeof requestValue === "string" && isUuid(requestValue)
    ? requestValue
    : randomUUID();
}

function reasonCodeFor(
  request: FastifyRequest,
  statusCode: number,
  outcome: AuditOutcome,
): string {
  if (outcome === "DENIED") return "AUTHORIZATION_DENIED";
  if (outcome === "FAILED") return `HTTP_${statusCode}`;
  const body =
    request.body && typeof request.body === "object"
      ? (request.body as Record<string, unknown>)
      : {};
  const reasonCode = body["reasonCode"];
  return typeof reasonCode === "string" &&
    /^[A-Z0-9_:-]{1,64}$/.test(reasonCode)
    ? reasonCode
    : "COMMAND_ACCEPTED";
}

function isCoveredDomainRoute(route: string): boolean {
  const segments = route.split("/").filter(Boolean);
  return (
    segments[0] === "v1" &&
    segments.some((segment) => coveredDomainSegments.has(segment))
  );
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
