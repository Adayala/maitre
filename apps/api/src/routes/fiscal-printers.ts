import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  registerPrinter,
  listPrinters,
  activatePrinter,
  retirePrinter,
  testPrinter,
  registerCertificate,
  listCertificates,
  revokeCertificate,
  InvalidFiscalPrinterTransitionError,
  InvalidCertificateStateError,
} from "@maitre/fiscal";
import type { Container } from "../composition/container.js";
import { requireTenantContext, requirePermission } from "../http/request-context.js";
import { sendProblem, notFound, conflict, badRequest } from "../http/problem-details.js";

// SPEC-139/146 (printers) + SPEC-140 (certificates). Both are simple metadata
// CRUD. `test` is a NO-OP (canned success, no hardware). Certificates store NO
// key material — only opaque metadata + a secretReference placeholder.

const registerPrinterBody = z.object({
  branchId: z.string().min(1),
  provider: z.string().min(1),
  model: z.string().min(1),
  deviceId: z.string().min(1),
  capabilities: z.array(z.string().min(1)).default([]),
  configSecretRef: z.string().min(1).optional(),
});

const registerCertBody = z.object({
  fiscalEntityId: z.string().min(1),
  cuit: z.string().min(1),
  service: z.string().min(1),
  environment: z.enum(["HOMOLOGATION", "PRODUCTION"]),
  fingerprint: z.string().min(1),
  issuer: z.string().min(1),
  notBefore: z.string().datetime(),
  notAfter: z.string().datetime(),
  secretReference: z.string().min(1),
});

function mapErr(err: unknown): { kind: "conflict"; message: string } | null {
  if (err instanceof InvalidFiscalPrinterTransitionError || err instanceof InvalidCertificateStateError) {
    return { kind: "conflict", message: err.message };
  }
  return null;
}

export async function registerFiscalPrinterRoutes(app: FastifyInstance, container: Container): Promise<void> {
  const handle = (reply: import("fastify").FastifyReply, correlationId: string, err: unknown, label: string) => {
    const mapped = mapErr(err);
    if (mapped) return sendProblem(reply, correlationId, conflict(mapped.message));
    if (err instanceof Error && err.message.includes("not found")) return sendProblem(reply, correlationId, notFound(label));
    return sendProblem(reply, correlationId, err);
  };

  // ---- Printers ------------------------------------------------------------
  app.post("/v1/fiscal-printers", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "fiscal-printer:manage");
      const body = registerPrinterBody.parse(req.body);
      const branch = await container.branches.findById(ctx.tenantId, body.branchId);
      if (!branch) return sendProblem(reply, correlationId, notFound("Branch"));
      const printer = await registerPrinter(
        { printers: container.fiscalPrinters },
        {
          tenantId: ctx.tenantId,
          branchId: body.branchId,
          provider: body.provider,
          model: body.model,
          deviceId: body.deviceId,
          capabilities: body.capabilities,
          ...(body.configSecretRef ? { configSecretRef: body.configSecretRef } : {}),
        },
      );
      reply.code(201);
      return { data: printer };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      return handle(reply, correlationId, err, "FiscalPrinter");
    }
  });

  app.get<{ Params: { branchId: string } }>("/v1/branches/:branchId/fiscal-printers", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "fiscal-printer:read");
      const printers = await listPrinters({ printers: container.fiscalPrinters }, ctx.tenantId, req.params.branchId);
      return { data: printers };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/fiscal-printers/:id/activate", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "fiscal-printer:manage");
      const printer = await activatePrinter({ printers: container.fiscalPrinters }, { tenantId: ctx.tenantId, id: req.params.id });
      return { data: printer };
    } catch (err) {
      return handle(reply, correlationId, err, "FiscalPrinter");
    }
  });

  app.post<{ Params: { id: string } }>("/v1/fiscal-printers/:id/retire", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "fiscal-printer:manage");
      const printer = await retirePrinter({ printers: container.fiscalPrinters }, { tenantId: ctx.tenantId, id: req.params.id });
      return { data: printer };
    } catch (err) {
      return handle(reply, correlationId, err, "FiscalPrinter");
    }
  });

  // POST /v1/fiscal-printers/:id/test — canned success, no real hardware.
  app.post<{ Params: { id: string } }>("/v1/fiscal-printers/:id/test", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "fiscal-printer:manage");
      const result = await testPrinter({ printers: container.fiscalPrinters }, { tenantId: ctx.tenantId, id: req.params.id });
      return { data: result };
    } catch (err) {
      return handle(reply, correlationId, err, "FiscalPrinter");
    }
  });

  // ---- Certificates --------------------------------------------------------
  app.post("/v1/fiscal-certificates", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "fiscal-certificate:manage");
      const body = registerCertBody.parse(req.body);
      const fe = await container.fiscalEntities.findById(ctx.tenantId, body.fiscalEntityId);
      if (!fe) return sendProblem(reply, correlationId, notFound("FiscalEntity"));
      const cert = await registerCertificate(
        { certificates: container.fiscalCertificates },
        {
          tenantId: ctx.tenantId,
          fiscalEntityId: body.fiscalEntityId,
          cuit: body.cuit,
          service: body.service,
          environment: body.environment,
          fingerprint: body.fingerprint,
          issuer: body.issuer,
          notBefore: new Date(body.notBefore),
          notAfter: new Date(body.notAfter),
          secretReference: body.secretReference,
        },
      );
      reply.code(201);
      return { data: cert };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      return handle(reply, correlationId, err, "FiscalCertificate");
    }
  });

  app.get<{ Querystring: { fiscalEntityId?: string } }>("/v1/fiscal-certificates", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "fiscal-certificate:read");
      if (!req.query.fiscalEntityId) return sendProblem(reply, correlationId, badRequest("fiscalEntityId query param is required"));
      const certs = await listCertificates({ certificates: container.fiscalCertificates }, ctx.tenantId, req.query.fiscalEntityId);
      return { data: certs };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/fiscal-certificates/:id/revoke", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "fiscal-certificate:manage");
      const cert = await revokeCertificate({ certificates: container.fiscalCertificates }, { tenantId: ctx.tenantId, id: req.params.id });
      return { data: cert };
    } catch (err) {
      return handle(reply, correlationId, err, "FiscalCertificate");
    }
  });
}
