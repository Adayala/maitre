import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  createTaxRate,
  listTaxRates,
  publishTaxRate,
  resolveTaxRateQuery,
  InvalidTaxRateError,
  OverlappingTaxRateError,
} from "@maitre/fiscal";
import type { Container } from "../composition/container.js";
import { requireTenantContext, requirePermission } from "../http/request-context.js";
import { sendProblem, notFound, conflict, badRequest } from "../http/problem-details.js";

// SPEC-143/149/154 — TaxRate API. TaxRate is a PLATFORM-level catalogue (not
// tenant-scoped); tenants only read + resolve. create/publish require the
// invented tax-rate:manage permission (admin/owner). resolve fails closed.

const createBody = z.object({
  jurisdiction: z.string().min(1),
  taxType: z.string().min(1),
  officialCode: z.string().min(1),
  treatment: z.enum(["TAXED", "EXEMPT", "NON_TAXED"]),
  decimalRate: z.number().int().nonnegative(),
  includedInPrice: z.boolean().default(false),
  effectiveFrom: z.string().datetime(),
  effectiveTo: z.string().datetime().optional(),
  normativeSourceVersion: z.string().min(1),
});

const resolveQuery = z.object({
  jurisdiction: z.string().min(1),
  taxType: z.string().min(1),
  at: z.string().datetime().optional(),
});

function mapErr(err: unknown): { kind: "conflict" | "badrequest"; message: string } | null {
  if (err instanceof OverlappingTaxRateError) return { kind: "conflict", message: err.message };
  if (err instanceof InvalidTaxRateError) return { kind: "badrequest", message: err.message };
  return null;
}

export async function registerTaxRateRoutes(app: FastifyInstance, container: Container): Promise<void> {
  app.post("/v1/tax-rates", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "tax-rate:manage");
      const body = createBody.parse(req.body);
      const rate = await createTaxRate(
        { taxRates: container.taxRates },
        {
          jurisdiction: body.jurisdiction,
          taxType: body.taxType,
          officialCode: body.officialCode,
          treatment: body.treatment,
          decimalRate: body.decimalRate,
          includedInPrice: body.includedInPrice,
          effectiveFrom: new Date(body.effectiveFrom),
          normativeSourceVersion: body.normativeSourceVersion,
          ...(body.effectiveTo ? { effectiveTo: new Date(body.effectiveTo) } : {}),
        },
      );
      reply.code(201);
      return { data: rate };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      const mapped = mapErr(err);
      if (mapped?.kind === "conflict") return sendProblem(reply, correlationId, conflict(mapped.message));
      if (mapped?.kind === "badrequest") return sendProblem(reply, correlationId, badRequest(mapped.message));
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get("/v1/tax-rates", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "tax-rate:read");
      const rates = await listTaxRates({ taxRates: container.taxRates });
      return { data: rates };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{ Querystring: { jurisdiction?: string; taxType?: string; at?: string } }>("/v1/tax-rates/resolve", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "tax-rate:read");
      const query = resolveQuery.parse(req.query);
      const result = await resolveTaxRateQuery(
        { taxRates: container.taxRates },
        { jurisdiction: query.jurisdiction, taxType: query.taxType, at: query.at ? new Date(query.at) : new Date() },
      );
      return { data: result };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/tax-rates/:id/publish", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "tax-rate:manage");
      const existing = await container.taxRates.findById(req.params.id);
      if (!existing) return sendProblem(reply, correlationId, notFound("TaxRate"));
      const rate = await publishTaxRate({ taxRates: container.taxRates }, { id: req.params.id });
      return { data: rate };
    } catch (err) {
      const mapped = mapErr(err);
      if (mapped?.kind === "conflict") return sendProblem(reply, correlationId, conflict(mapped.message));
      return sendProblem(reply, correlationId, err);
    }
  });
}
