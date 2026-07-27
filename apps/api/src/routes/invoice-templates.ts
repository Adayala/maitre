import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  createTemplate,
  listTemplates,
  publishTemplate,
  deactivateTemplate,
  previewTemplate,
  InvalidInvoiceTemplateTransitionError,
} from "@maitre/fiscal";
import type { Container } from "../composition/container.js";
import { requireTenantContext, requirePermission } from "../http/request-context.js";
import { sendProblem, notFound, conflict, badRequest } from "../http/problem-details.js";

// SPEC-142/148 — InvoiceTemplate API. Simple CRUD; publish freezes. `preview`
// returns a canned synthetic fixture (no real rendering). No HTML/CSS engine.

const createBody = z.object({
  name: z.string().min(1),
  channel: z.string().min(1).default("PDF"),
  contentRef: z.string().min(1),
  variableSchemaVersion: z.number().int().positive().default(1),
  layoutNormativeVersion: z.string().min(1),
  brandId: z.string().min(1).optional(),
});

function handle(reply: import("fastify").FastifyReply, correlationId: string, err: unknown, label: string) {
  if (err instanceof InvalidInvoiceTemplateTransitionError) return sendProblem(reply, correlationId, conflict(err.message));
  if (err instanceof Error && err.message.includes("not found")) return sendProblem(reply, correlationId, notFound(label));
  return sendProblem(reply, correlationId, err);
}

export async function registerInvoiceTemplateRoutes(app: FastifyInstance, container: Container): Promise<void> {
  app.post("/v1/invoice-templates", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "invoice-template:manage");
      const body = createBody.parse(req.body);
      const template = await createTemplate(
        { templates: container.invoiceTemplates },
        {
          tenantId: ctx.tenantId,
          name: body.name,
          channel: body.channel,
          contentRef: body.contentRef,
          variableSchemaVersion: body.variableSchemaVersion,
          layoutNormativeVersion: body.layoutNormativeVersion,
          ...(body.brandId ? { brandId: body.brandId } : {}),
        },
      );
      reply.code(201);
      return { data: template };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      return handle(reply, correlationId, err, "InvoiceTemplate");
    }
  });

  app.get("/v1/invoice-templates", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "invoice-template:read");
      const templates = await listTemplates({ templates: container.invoiceTemplates }, ctx.tenantId);
      return { data: templates };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{ Params: { id: string } }>("/v1/invoice-templates/:id/preview", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "invoice-template:read");
      const preview = await previewTemplate({ templates: container.invoiceTemplates }, { tenantId: ctx.tenantId, id: req.params.id });
      return { data: preview };
    } catch (err) {
      return handle(reply, correlationId, err, "InvoiceTemplate");
    }
  });

  app.post<{ Params: { id: string } }>("/v1/invoice-templates/:id/publish", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "invoice-template:manage");
      const template = await publishTemplate({ templates: container.invoiceTemplates }, { tenantId: ctx.tenantId, id: req.params.id, publishedBy: ctx.userId });
      return { data: template };
    } catch (err) {
      return handle(reply, correlationId, err, "InvoiceTemplate");
    }
  });

  app.post<{ Params: { id: string } }>("/v1/invoice-templates/:id/deactivate", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "invoice-template:manage");
      const template = await deactivateTemplate({ templates: container.invoiceTemplates }, { tenantId: ctx.tenantId, id: req.params.id });
      return { data: template };
    } catch (err) {
      return handle(reply, correlationId, err, "InvoiceTemplate");
    }
  });
}
