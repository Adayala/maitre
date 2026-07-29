import type { FastifyInstance, FastifyReply } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  createInvoice,
  validateInvoice,
  issueInvoice,
  reconcileInvoice,
  creditInvoice,
  debitInvoice,
  voidDraftInvoice,
  createPointOfSale,
  listPointsOfSale,
  setPointOfSaleStatus,
  setPointOfSaleRegistration,
  buildInvoiceExportManifest,
  buildFiscalQrCode,
  type TaxLineInput,
  type InvoiceDeps,
  InvalidInvoiceTransitionError,
  ImmutableInvoiceError,
  InvoiceNotCreditableError,
  NoEffectiveTaxRateError,
  DuplicatePointOfSaleError,
  PointOfSaleInactiveError,
  PointOfSaleRegistrationError,
  VoucherTypeNotAllowedError,
} from "@maitre/fiscal";
import type { Container } from "../composition/container.js";
import { requireTenantContext, requirePermission } from "../http/request-context.js";
import { sendProblem, notFound, conflict, badRequest } from "../http/problem-details.js";

// SPEC-144/145/147/150/155 — Invoices + FiscalPointOfSale + QR + Export API.
//
// WALKING SKELETON: the "ARCA authorization" performed by :issue is ENTIRELY
// SIMULATED (fake CAE, no AFIP/ARCA contact) — see @maitre/fiscal's
// SimulatedArcaAdapter. This surface must NEVER be used to issue real fiscal
// invoices. If-Match / Idempotency-Key enforcement is deferred (consistent with
// prior domains). There is NO formal RBAC spec in the 137-156 range, so the
// invoice:* / fiscal-pos:* / invoice-export:* permissions are invented following
// the established resource:action convention and added to role_admin/role_manager.

const voucherTypeEnum = z.enum([
  "FACTURA_A",
  "FACTURA_B",
  "FACTURA_C",
  "NOTA_CREDITO_A",
  "NOTA_CREDITO_B",
  "NOTA_CREDITO_C",
  "NOTA_DEBITO_A",
  "NOTA_DEBITO_B",
  "NOTA_DEBITO_C",
]);
const environmentEnum = z.enum(["HOMOLOGATION", "PRODUCTION"]);

const lineSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().int().positive(),
  unit: z.string().min(1).default("unit"),
  unitNetMinorUnits: z.number().int().nonnegative(),
  discountsAppliedMinorUnits: z.number().int().nonnegative().optional(),
});

const createInvoiceBody = z.object({
  fiscalEntityId: z.string().min(1),
  pointOfSaleId: z.string().min(1),
  voucherType: voucherTypeEnum,
  environment: environmentEnum.default("HOMOLOGATION"),
  currency: z.string().min(1),
  sourceCheckId: z.string().min(1).optional(),
  recipient: z
    .object({
      legalName: z.string().min(1).optional(),
      taxId: z.string().min(1).optional(),
      taxCondition: z.string().min(1).optional(),
      documentType: z.number().int().positive().optional(),
      vatConditionId: z.number().int().positive().optional(),
    })
    .optional(),
  lines: z.array(lineSchema).optional(),
});

const createPosBody = z.object({
  fiscalEntityId: z.string().min(1),
  branchId: z.string().uuid(),
  environment: environmentEnum.default("HOMOLOGATION"),
  officialCode: z.string().regex(/^\d{1,5}$/),
  arcaDomicileCode: z.string().min(1),
  arcaDomicileLabel: z.string().min(1).optional(),
  issuingSystem: z
    .enum(["WSFEV1", "CONTROLLER_FISCAL", "COMPROBANTES_EN_LINEA", "OTHER"])
    .default("WSFEV1"),
  registrationEvidenceRef: z.string().min(1).optional(),
  allowedVoucherTypes: z.array(voucherTypeEnum).min(1),
});

const registrationBody = z.object({
  status: z.enum(["DECLARED", "VERIFIED", "REJECTED", "INACTIVE"]),
  evidenceRef: z.string().min(1).optional(),
  rejectionReason: z.string().min(1).optional(),
});

const exportBody = z.object({
  fiscalEntityId: z.string().min(1),
  pointOfSaleId: z.string().min(1).optional(),
  periodFrom: z.string().datetime(),
  periodTo: z.string().datetime(),
});

function invoiceDeps(container: Container): InvoiceDeps {
  return {
    invoices: container.invoices,
    pointsOfSale: container.fiscalPointsOfSale,
    taxRates: container.taxRates,
    arca: container.arca,
    outbox: container.outbox,
    authorizationAttempts: container.authorizationAttempts,
  };
}

function mapFiscalError(err: unknown): { kind: "conflict" | "badrequest" | "notfound"; message: string } | null {
  if (
    err instanceof InvalidInvoiceTransitionError ||
    err instanceof ImmutableInvoiceError ||
    err instanceof InvoiceNotCreditableError ||
    err instanceof DuplicatePointOfSaleError ||
    err instanceof PointOfSaleInactiveError ||
    err instanceof PointOfSaleRegistrationError
  ) {
    return { kind: "conflict", message: err.message };
  }
  if (err instanceof NoEffectiveTaxRateError || err instanceof VoucherTypeNotAllowedError) {
    return { kind: "badrequest", message: err.message };
  }
  if (err instanceof Error && err.message.includes("not found")) {
    return { kind: "notfound", message: err.message };
  }
  return null;
}

export async function registerInvoiceRoutes(app: FastifyInstance, container: Container): Promise<void> {
  const sendMapped = (reply: FastifyReply, correlationId: string, err: unknown, notFoundLabel: string) => {
    const mapped = mapFiscalError(err);
    if (mapped?.kind === "conflict") return sendProblem(reply, correlationId, conflict(mapped.message));
    if (mapped?.kind === "badrequest") return sendProblem(reply, correlationId, badRequest(mapped.message));
    if (mapped?.kind === "notfound") return sendProblem(reply, correlationId, notFound(notFoundLabel));
    return sendProblem(reply, correlationId, err);
  };

  // ---- FiscalPointOfSale ---------------------------------------------------
  app.post("/v1/fiscal-points-of-sale", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "fiscal-pos:manage");
      const body = createPosBody.parse(req.body);
      const fe = await container.fiscalEntities.findById(ctx.tenantId, body.fiscalEntityId);
      if (!fe) return sendProblem(reply, correlationId, notFound("FiscalEntity"));
      const branch = await container.branches.findById(ctx.tenantId, body.branchId);
      if (!branch) return sendProblem(reply, correlationId, notFound("Branch"));
      if (branch.fiscalEntityId !== body.fiscalEntityId) {
        return sendProblem(
          reply,
          correlationId,
          badRequest("Branch must be explicitly associated with the same fiscal entity"),
        );
      }
      const pos = await createPointOfSale(
        { pointsOfSale: container.fiscalPointsOfSale },
        {
          tenantId: ctx.tenantId,
          fiscalEntityId: body.fiscalEntityId,
          branchId: body.branchId,
          environment: body.environment,
          officialCode: body.officialCode,
          arcaDomicileCode: body.arcaDomicileCode,
          ...(body.arcaDomicileLabel
            ? { arcaDomicileLabel: body.arcaDomicileLabel }
            : {}),
          issuingSystem: body.issuingSystem,
          ...(body.registrationEvidenceRef
            ? { registrationEvidenceRef: body.registrationEvidenceRef }
            : {}),
          allowedVoucherTypes: body.allowedVoucherTypes,
        },
      );
      reply.code(201);
      return { data: pos };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      return sendMapped(reply, correlationId, err, "FiscalPointOfSale");
    }
  });

  app.post<{ Params: { id: string } }>(
    "/v1/fiscal-points-of-sale/:id/registration",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "fiscal-pos:manage");
        const body = registrationBody.parse(req.body);
        const pos = await setPointOfSaleRegistration(
          { pointsOfSale: container.fiscalPointsOfSale },
          {
            tenantId: ctx.tenantId,
            id: req.params.id,
            status: body.status,
            actorId: ctx.userId,
            ...(body.evidenceRef ? { evidenceRef: body.evidenceRef } : {}),
            ...(body.rejectionReason ? { rejectionReason: body.rejectionReason } : {}),
          },
        );
        return { data: pos };
      } catch (err) {
        if (err instanceof z.ZodError) {
          return sendProblem(reply, correlationId, badRequest(err.message));
        }
        return sendMapped(reply, correlationId, err, "FiscalPointOfSale");
      }
    },
  );

  app.get<{ Querystring: { fiscalEntityId?: string } }>("/v1/fiscal-points-of-sale", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "invoice:read");
      if (!req.query.fiscalEntityId) return sendProblem(reply, correlationId, badRequest("fiscalEntityId query param is required"));
      const list = await listPointsOfSale({ pointsOfSale: container.fiscalPointsOfSale }, ctx.tenantId, req.query.fiscalEntityId);
      return { data: list };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/fiscal-points-of-sale/:id/deactivate", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "fiscal-pos:manage");
      const pos = await setPointOfSaleStatus({ pointsOfSale: container.fiscalPointsOfSale }, { tenantId: ctx.tenantId, id: req.params.id, status: "INACTIVE" });
      return { data: pos };
    } catch (err) {
      return sendMapped(reply, correlationId, err, "FiscalPointOfSale");
    }
  });

  // ---- Invoices ------------------------------------------------------------
  app.post("/v1/invoices", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "invoice:create");
      const body = createInvoiceBody.parse(req.body);

      // Snapshot lines: prefer the Floor Check (direct cross-module read at
      // create time — not a saga), else use explicitly-provided lines.
      let lines: TaxLineInput[];
      let sourceCheckRevision: number | undefined;
      if (body.sourceCheckId) {
        const check = await container.checks.findById(ctx.tenantId, body.sourceCheckId);
        if (!check) return sendProblem(reply, correlationId, notFound("Check"));
        lines = check.lines.map((l) => ({
          id: l.id,
          description: l.description,
          quantity: 1,
          unit: "unit",
          unitNetMinorUnits: l.amountMinorUnits,
          sourceCheckLineRef: l.id,
        }));
        sourceCheckRevision = check.revision;
      } else if (body.lines && body.lines.length > 0) {
        lines = body.lines.map((l) => ({
          id: randomUUID(),
          description: l.description,
          quantity: l.quantity,
          unit: l.unit,
          unitNetMinorUnits: l.unitNetMinorUnits,
          ...(l.discountsAppliedMinorUnits != null ? { discountsAppliedMinorUnits: l.discountsAppliedMinorUnits } : {}),
        }));
      } else {
        return sendProblem(reply, correlationId, badRequest("Provide either sourceCheckId or a non-empty lines array"));
      }

      const recipient = body.recipient
        ? {
            legalName: body.recipient.legalName ?? null,
            taxId: body.recipient.taxId ?? null,
            taxCondition: body.recipient.taxCondition ?? null,
            documentType: body.recipient.documentType ?? null,
            vatConditionId: body.recipient.vatConditionId ?? null,
          }
        : undefined;

      const invoice = await createInvoice(invoiceDeps(container), {
        tenantId: ctx.tenantId,
        fiscalEntityId: body.fiscalEntityId,
        environment: body.environment,
        pointOfSaleId: body.pointOfSaleId,
        voucherType: body.voucherType,
        currency: body.currency,
        lines,
        ...(recipient ? { recipient } : {}),
        ...(body.sourceCheckId ? { sourceCheckId: body.sourceCheckId } : {}),
        ...(sourceCheckRevision != null ? { sourceCheckRevision } : {}),
      });
      reply.code(201);
      return { data: invoice };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      return sendMapped(reply, correlationId, err, "FiscalPointOfSale");
    }
  });

  app.get<{ Querystring: { fiscalEntityId?: string } }>("/v1/invoices", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "invoice:read");
      const list = req.query.fiscalEntityId
        ? await container.invoices.listByFiscalEntity(ctx.tenantId, req.query.fiscalEntityId)
        : await container.invoices.listByTenant(ctx.tenantId);
      return { data: list };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{ Params: { id: string } }>("/v1/invoices/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "invoice:read");
      const invoice = await container.invoices.findById(ctx.tenantId, req.params.id);
      if (!invoice) return sendProblem(reply, correlationId, notFound("Invoice"));
      return { data: invoice };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/invoices/:id/validate", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "invoice:issue");
      const invoice = await validateInvoice(invoiceDeps(container), { tenantId: ctx.tenantId, id: req.params.id, correlationId });
      return { data: invoice };
    } catch (err) {
      return sendMapped(reply, correlationId, err, "Invoice");
    }
  });

  // POST /v1/invoices/:id/issue — SIMULATED ARCA authorization (fake CAE).
  app.post<{ Params: { id: string } }>("/v1/invoices/:id/issue", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "invoice:issue");
      const invoice = await container.invoices.findById(ctx.tenantId, req.params.id);
      if (!invoice) return sendProblem(reply, correlationId, notFound("Invoice"));
      const fe = await container.fiscalEntities.findById(ctx.tenantId, invoice.fiscalEntityId);
      if (!fe) return sendProblem(reply, correlationId, notFound("FiscalEntity"));
      if (invoice.environment === "PRODUCTION") {
        if (
          fe.status !== "ACTIVE" ||
          !fe.certificate ||
          fe.certificate.validTo.getTime() <= Date.now()
        ) {
          return sendProblem(
            reply,
            correlationId,
            conflict("Production emission requires an active fiscal entity and valid certificate"),
          );
        }
        const pos = await container.fiscalPointsOfSale.findById(
          ctx.tenantId,
          invoice.pointOfSaleId,
        );
        if (!pos?.branchId || !pos.arcaDomicileCode) {
          return sendProblem(
            reply,
            correlationId,
            conflict("Production point of sale requires an explicit branch and ARCA domicile"),
          );
        }
        const branch = await container.branches.findById(ctx.tenantId, pos.branchId);
        if (
          !branch ||
          branch.status !== "ACTIVE" ||
          branch.fiscalEntityId !== invoice.fiscalEntityId
        ) {
          return sendProblem(
            reply,
            correlationId,
            conflict("Production point of sale branch is inactive or has a different fiscal owner"),
          );
        }
      }
      const issued = await issueInvoice(invoiceDeps(container), { tenantId: ctx.tenantId, id: req.params.id, cuit: fe.cuit, correlationId });
      return { data: issued };
    } catch (err) {
      return sendMapped(reply, correlationId, err, "Invoice");
    }
  });

  app.post<{ Params: { id: string } }>("/v1/invoices/:id/reconcile", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "invoice:issue");
      const current = await container.invoices.findById(ctx.tenantId, req.params.id);
      if (!current) return sendProblem(reply, correlationId, notFound("Invoice"));
      const fe = await container.fiscalEntities.findById(ctx.tenantId, current.fiscalEntityId);
      if (!fe) return sendProblem(reply, correlationId, notFound("FiscalEntity"));
      const invoice = await reconcileInvoice(invoiceDeps(container), {
        tenantId: ctx.tenantId,
        id: req.params.id,
        cuit: fe.cuit,
        correlationId,
      });
      return { data: invoice };
    } catch (err) {
      return sendMapped(reply, correlationId, err, "Invoice");
    }
  });

  app.post<{ Params: { id: string } }>("/v1/invoices/:id/credit", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "invoice:credit");
      const note = await creditInvoice(invoiceDeps(container), { tenantId: ctx.tenantId, id: req.params.id });
      reply.code(201);
      return { data: note };
    } catch (err) {
      return sendMapped(reply, correlationId, err, "Invoice");
    }
  });

  app.post<{ Params: { id: string } }>("/v1/invoices/:id/debit", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "invoice:credit");
      const note = await debitInvoice(invoiceDeps(container), { tenantId: ctx.tenantId, id: req.params.id });
      reply.code(201);
      return { data: note };
    } catch (err) {
      return sendMapped(reply, correlationId, err, "Invoice");
    }
  });

  app.post<{ Params: { id: string } }>("/v1/invoices/:id/void-draft", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "invoice:void");
      const invoice = await voidDraftInvoice(invoiceDeps(container), { tenantId: ctx.tenantId, id: req.params.id });
      return { data: invoice };
    } catch (err) {
      return sendMapped(reply, correlationId, err, "Invoice");
    }
  });

  // GET /v1/invoices/:id/qr — SPEC-141/147 deterministic canonical payload+hash.
  app.get<{ Params: { id: string } }>("/v1/invoices/:id/qr", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "invoice:read");
      const invoice = await container.invoices.findById(ctx.tenantId, req.params.id);
      if (!invoice) return sendProblem(reply, correlationId, notFound("Invoice"));
      if (invoice.status !== "AUTHORIZED" || invoice.number == null || !invoice.cae || !invoice.caeExpiresAt || !invoice.authorizedAt) {
        return sendProblem(reply, correlationId, conflict("A fiscal QR code can only be derived from an AUTHORIZED invoice"));
      }
      const pos = await container.fiscalPointsOfSale.findById(ctx.tenantId, invoice.pointOfSaleId);
      const fe = await container.fiscalEntities.findById(ctx.tenantId, invoice.fiscalEntityId);
      const qr = buildFiscalQrCode({
        cuit: fe?.cuit ?? "",
        voucherType: invoice.voucherType,
        pointOfSaleCode: pos?.officialCode ?? "",
        number: invoice.number,
        amountMinorUnits: invoice.totals.grossMinorUnits,
        currency: invoice.currency,
        cae: invoice.cae,
        caeExpiresAt: invoice.caeExpiresAt,
        authorizedAt: invoice.authorizedAt,
      });
      return { data: { invoiceId: invoice.id, ...qr } };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  // POST /v1/invoice-exports — SPEC-150 synchronous Libro IVA manifest (no job
  // queue, no file artifact, never "presented" to ARCA).
  app.post("/v1/invoice-exports", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "invoice-export:manage");
      const body = exportBody.parse(req.body);
      const manifest = await buildInvoiceExportManifest(
        { invoices: container.invoices },
        {
          tenantId: ctx.tenantId,
          fiscalEntityId: body.fiscalEntityId,
          periodFrom: new Date(body.periodFrom),
          periodTo: new Date(body.periodTo),
          ...(body.pointOfSaleId ? { pointOfSaleId: body.pointOfSaleId } : {}),
        },
      );
      return { data: manifest };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      return sendProblem(reply, correlationId, err);
    }
  });
}
