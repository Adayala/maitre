import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { recordAuditLog } from "@maitre/audit";
import {
  createFiscalEntity,
  DuplicateCuitError,
  type FiscalEntity,
} from "@maitre/organization";
import { InvalidCuitError } from "@maitre/organization";
import type { Container } from "../composition/container.js";
import {
  hasContextPermission,
  requireTenantContext,
  requirePermission,
} from "../http/request-context.js";
import {
  sendProblem,
  notFound,
  conflict,
  badRequest,
  stepUpRequired,
} from "../http/problem-details.js";
import { parsePagination, paginate } from "../http/pagination.js";
import { omitUndefined } from "../http/omit-undefined.js";

const STEP_UP_MAX_AGE_MS = 15 * 60 * 1000;

// SPEC-009 — FiscalEntities API. All endpoints are OWNER only (fiscal:*
// is granted solely via role_owner's wildcard permission).
const createFiscalEntityBodySchema = z.object({
  name: z.string().trim().min(3).max(200),
  cuit: z.string().min(1),
  taxCondition: z.enum(["RI", "MONOTRIBUTISTA", "EXENTO"]),
  legalAddress: z.string().trim().min(1).max(300).optional(),
  fiscalAddress: z.string().trim().min(1).max(300).optional(),
  activityCode: z.string().trim().min(1).max(64).optional(),
});

const patchFiscalEntityBodySchema = z.object({
  name: z.string().trim().min(3).max(200).optional(),
  taxCondition: z.enum(["RI", "MONOTRIBUTISTA", "EXENTO"]).optional(),
  legalAddress: z.string().trim().min(1).max(300).optional(),
  fiscalAddress: z.string().trim().min(1).max(300).optional(),
  activityCode: z.string().trim().min(1).max(64).optional(),
  reason: z.string().trim().min(3).max(500).optional(),
});

function parseIfMatchUpdatedAt(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) {
    throw badRequest("Missing If-Match header");
  }
  const normalized = value.trim().replace(/^W\//, "").replace(/^"/, "").replace(/"$/, "");
  const parsed = Number.parseInt(normalized, 10);
  if (!Number.isFinite(parsed) || parsed < 0 || String(parsed) !== normalized) {
    throw badRequest("Invalid If-Match header");
  }
  return parsed;
}

function parseOptionalIdempotencyKey(raw: string | string[] | undefined): string | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return null;
  const normalized = value.trim();
  if (!normalized) return null;
  return normalized;
}

function parseStepUpAt(raw: string | string[] | undefined): Date {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) {
    throw stepUpRequired();
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw badRequest("Invalid X-Step-Up-At header");
  }
  return parsed;
}

function requireRecentStepUp(
  ctx: Awaited<ReturnType<typeof requireTenantContext>>,
  raw: string | string[] | undefined,
  now: Date,
): Date {
  const stepUpAt = parseStepUpAt(raw);
  if (stepUpAt.getTime() < ctx.sessionIssuedAt.getTime()) {
    throw stepUpRequired();
  }
  if (stepUpAt.getTime() > now.getTime()) {
    throw stepUpRequired();
  }
  if (stepUpAt.getTime() > ctx.sessionExpiresAt.getTime()) {
    throw stepUpRequired();
  }
  if (now.getTime() - stepUpAt.getTime() > STEP_UP_MAX_AGE_MS) {
    throw stepUpRequired();
  }
  return stepUpAt;
}

function canReadSensitiveFiscal(
  ctx: Awaited<ReturnType<typeof requireTenantContext>>,
): boolean {
  return (
    hasContextPermission(ctx, "fiscalEntity:create") ||
    hasContextPermission(ctx, "fiscalEntity:write")
  );
}

function redactFiscalEntityForReadOnly(
  entity: FiscalEntity,
): Omit<
  FiscalEntity,
  "legalAddress" | "fiscalAddress" | "activityCode" | "createIdempotencyKey" | "encryptedCertificateKeyRef" | "certificate"
> {
  const {
    legalAddress: _legalAddress,
    fiscalAddress: _fiscalAddress,
    activityCode: _activityCode,
    createIdempotencyKey: _createIdempotencyKey,
    encryptedCertificateKeyRef: _encryptedCertificateKeyRef,
    certificate: _certificate,
    ...rest
  } = entity;
  return rest;
}

function sanitizeFiscalEntityForAudit(entity: FiscalEntity) {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    cuitMasked: `***${entity.cuit.slice(-4)}`,
    name: entity.name,
    status: entity.status,
    taxCondition: entity.taxCondition,
    hasLegalAddress: entity.legalAddress !== undefined,
    hasFiscalAddress: entity.fiscalAddress !== undefined,
    hasActivityCode: entity.activityCode !== undefined,
    hasCertificate: entity.certificate !== undefined,
    hasEncryptedCertificateKeyRef: entity.encryptedCertificateKeyRef !== undefined,
    createdAt: entity.createdAt,
    createdBy: entity.createdBy,
    updatedAt: entity.updatedAt,
    updatedBy: entity.updatedBy,
  };
}

function isSensitiveFiscalPatch(
  body: z.infer<typeof patchFiscalEntityBodySchema>,
): boolean {
  return (
    body.taxCondition !== undefined ||
    body.legalAddress !== undefined ||
    body.fiscalAddress !== undefined ||
    body.activityCode !== undefined
  );
}

function toResponse(
  entity: FiscalEntity,
  ctx: Awaited<ReturnType<typeof requireTenantContext>>,
) {
  return { data: canReadSensitiveFiscal(ctx) ? entity : redactFiscalEntityForReadOnly(entity) };
}

export async function registerFiscalEntityRoutes(
  app: FastifyInstance,
  container: Container,
): Promise<void> {
  app.post("/v1/fiscal-entities", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "fiscalEntity:create");
      const body = createFiscalEntityBodySchema.parse(req.body);
      const createIdempotencyKey = parseOptionalIdempotencyKey(req.headers["idempotency-key"]);

      const entity = await createFiscalEntity(
        { tenants: container.tenants, fiscalEntities: container.fiscalEntities, outbox: container.outbox },
        {
          tenantId: ctx.tenantId,
          ...omitUndefined(body),
          ...(createIdempotencyKey ? { createIdempotencyKey } : {}),
          actorId: ctx.userId,
          correlationId,
        },
      );
      await recordAuditLog(
        { auditLogs: container.auditLogs },
        {
          tenantId: ctx.tenantId,
          actorType: "USER",
          actorId: ctx.userId,
          action: "CREATE",
          resourceType: "FISCAL_ENTITY",
          resourceId: entity.id,
          newState: sanitizeFiscalEntityForAudit(entity),
          correlationId,
        },
      );
      reply.code(201);
      return toResponse(entity, ctx);
    } catch (err) {
      if (err instanceof DuplicateCuitError) {
        return sendProblem(reply, correlationId, conflict(err.message));
      }
      if (err instanceof InvalidCuitError || err instanceof z.ZodError) {
        return sendProblem(reply, correlationId, badRequest(String(err.message)));
      }
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get("/v1/fiscal-entities", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "fiscalEntity:read");
      const entities = await container.fiscalEntities.listByTenant(ctx.tenantId);
      const visible = canReadSensitiveFiscal(ctx)
        ? entities
        : entities.map((entity) => redactFiscalEntityForReadOnly(entity));
      return paginate(visible, parsePagination(req));
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{ Params: { id: string } }>("/v1/fiscal-entities/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "fiscalEntity:read");
      const entity = await container.fiscalEntities.findById(ctx.tenantId, req.params.id);
      if (!entity) return sendProblem(reply, correlationId, notFound("FiscalEntity"));
      reply.header("etag", `"${entity.updatedAt.getTime()}"`);
      return toResponse(entity, ctx);
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.patch<{ Params: { id: string } }>("/v1/fiscal-entities/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "fiscalEntity:write");
      const entity = await container.fiscalEntities.findById(ctx.tenantId, req.params.id);
      if (!entity) return sendProblem(reply, correlationId, notFound("FiscalEntity"));
      const expectedUpdatedAt = parseIfMatchUpdatedAt(req.headers["if-match"]);
      if (entity.updatedAt.getTime() !== expectedUpdatedAt) {
        return sendProblem(
          reply,
          correlationId,
          conflict(
            `FiscalEntity ${entity.id} revision mismatch: expected ${expectedUpdatedAt}, actual ${entity.updatedAt.getTime()}`,
          ),
        );
      }

      const parsedBody = patchFiscalEntityBodySchema.parse(req.body);
      const now = new Date();
      const sensitivePatch = isSensitiveFiscalPatch(parsedBody);
      if (sensitivePatch && !parsedBody.reason) {
        return sendProblem(reply, correlationId, badRequest("Missing reason for sensitive fiscal change"));
      }
      const stepUpAt = sensitivePatch
        ? requireRecentStepUp(ctx, req.headers["x-step-up-at"], now)
        : null;
      const { reason, ...patchFields } = parsedBody;
      const body = omitUndefined(patchFields);
      const previous = entity;
      const updated: FiscalEntity = { ...entity, ...body, updatedAt: now, updatedBy: ctx.userId };
      await container.fiscalEntities.save(updated);
      await recordAuditLog(
        { auditLogs: container.auditLogs, now: () => now },
        {
          tenantId: ctx.tenantId,
          actorType: "USER",
          actorId: ctx.userId,
          action: "UPDATE",
          resourceType: "FISCAL_ENTITY",
          resourceId: updated.id,
          previousState: sanitizeFiscalEntityForAudit(previous),
          newState: {
            ...sanitizeFiscalEntityForAudit(updated),
            ...(reason ? { mutationReason: reason } : {}),
            ...(sensitivePatch ? { mutationType: "SENSITIVE_UPDATE", stepUpAt } : {}),
          },
          correlationId,
        },
      );
      reply.header("etag", `"${updated.updatedAt.getTime()}"`);
      return toResponse(updated, ctx);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      return sendProblem(reply, correlationId, err);
    }
  });
}
