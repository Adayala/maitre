import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  createBranch,
  UnknownBrandError,
  DuplicateBranchCodeError,
  transitionBranch,
  InvalidBranchTransitionError,
  InvalidBranchCodeError,
  type Branch,
} from "@maitre/organization";
import type { Container } from "../composition/container.js";
import { requireTenantContext, requirePermission } from "../http/request-context.js";
import { sendProblem, notFound, conflict, badRequest } from "../http/problem-details.js";
import { parsePagination, paginate } from "../http/pagination.js";
import { omitUndefined } from "../http/omit-undefined.js";

// SPEC-010 — Branches API. POST reuses Branch domain invariants directly
// (no dedicated create-branch use case exists yet in @maitre/organization —
// this route builds the record inline, matching the pattern the use cases
// use, and validates code/tenant/brand the same way they would).
const createBranchBodySchema = z.object({
  brandId: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  code: z.string().min(1),
  timezone: z.string().min(1),
  fiscalEntityId: z.string().uuid().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
});

const patchBranchBodySchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
  fiscalEntityId: z.string().uuid().nullable().optional(),
});

function toResponse(branch: Branch) {
  return { data: branch };
}

export async function registerBranchRoutes(
  app: FastifyInstance,
  container: Container,
): Promise<void> {
  app.post("/v1/branches", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "branch:create");
      const body = createBranchBodySchema.parse(req.body);

      const branch = await createBranch(
        { brands: container.brands, branches: container.branches, outbox: container.outbox },
        { tenantId: ctx.tenantId, ...omitUndefined(body), actorId: ctx.userId, correlationId },
      );
      reply.code(201);
      return toResponse(branch);
    } catch (err) {
      if (err instanceof UnknownBrandError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      if (err instanceof DuplicateBranchCodeError) {
        return sendProblem(reply, correlationId, conflict(err.message));
      }
      if (err instanceof InvalidBranchCodeError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      if (err instanceof z.ZodError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get("/v1/branches", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "branch:read");
      const branches = await container.branches.listByTenant(ctx.tenantId);
      return paginate(branches, parsePagination(req));
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{ Params: { id: string } }>("/v1/branches/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "branch:read");
      const branch = await container.branches.findById(ctx.tenantId, req.params.id);
      if (!branch) return sendProblem(reply, correlationId, notFound("Branch"));
      return toResponse(branch);
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.patch<{ Params: { id: string } }>("/v1/branches/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "branch:write");
      const branch = await container.branches.findById(ctx.tenantId, req.params.id);
      if (!branch) return sendProblem(reply, correlationId, notFound("Branch"));

      const body = omitUndefined(patchBranchBodySchema.parse(req.body));
      if (body.fiscalEntityId) {
        const fiscalEntity = await container.fiscalEntities.findById(
          ctx.tenantId,
          body.fiscalEntityId,
        );
        if (!fiscalEntity) {
          return sendProblem(reply, correlationId, badRequest("Unknown fiscalEntityId"));
        }
      }
      const { fiscalEntityId: previousFiscalEntityId, ...branchWithoutFiscalEntity } = branch;
      const { fiscalEntityId, ...bodyWithoutFiscalEntity } = body;
      const base = fiscalEntityId === null ? branchWithoutFiscalEntity : branch;
      let updated: Branch = {
        ...base,
        ...bodyWithoutFiscalEntity,
        ...(typeof fiscalEntityId === "string" ? { fiscalEntityId } : {}),
        updatedAt: new Date(),
      };
      if (body.status && body.status !== branch.status) {
        const transitioned = transitionBranch(branch, body.status, new Date());
        const { fiscalEntityId: transitionedFiscalEntityId, ...transitionedWithoutFiscalEntity } =
          transitioned;
        updated = {
          ...(fiscalEntityId === null ? transitionedWithoutFiscalEntity : transitioned),
          ...bodyWithoutFiscalEntity,
          ...(typeof fiscalEntityId === "string" ? { fiscalEntityId } : {}),
        };
      }
      await container.branches.save(updated);
      return toResponse(updated);
    } catch (err) {
      if (err instanceof InvalidBranchTransitionError) {
        return sendProblem(reply, correlationId, conflict(err.message));
      }
      if (err instanceof z.ZodError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      return sendProblem(reply, correlationId, err);
    }
  });
}
