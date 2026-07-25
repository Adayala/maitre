import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  createCashRegister,
  listCashRegisters,
  openSession,
  beginCloseSession,
  closeSession,
  suspendSession,
  resumeSession,
  calculateDailySettlement,
  getExpectedSummary,
  recordCounts,
  submitReconciliation,
  approveReconciliation,
  rejectReconciliation,
  recordMovement,
  compensateMovement,
  createDiscount,
  listDiscounts,
  evaluateDiscount,
  publishDiscount,
  deactivateDiscount,
  applyDiscount,
  DuplicateCashRegisterCodeError,
  SessionAlreadyOpenError,
  CurrencyNotAllowedError,
  InvalidCashSessionStateError,
  InvalidCashSessionTransitionError,
  InvalidReconciliationStateError,
  InvalidReconciliationTransitionError,
  CurrencyMismatchError,
  DuplicateSourceReferenceError,
  SessionNotAcceptingMovementsError,
  InvalidMovementAmountError,
  InvalidMovementDirectionError,
  DiscountNotPublishedError,
  InvalidDiscountTransitionError,
  InvalidDiscountValueError,
  MissingApplicationTargetError,
} from "@maitre/cash";
import type { Container } from "../composition/container.js";
import { requireTenantContext, requirePermission } from "../http/request-context.js";
import { sendProblem, notFound, conflict, badRequest } from "../http/problem-details.js";

// SPEC-124..135 — Cash Registers + Sessions + Movements + Reconciliations +
// Discounts + Daily Settlement API, consolidated into one registration function
// (mirroring how other domains keep related surfaces together). Each state
// change is an explicit command endpoint (no generic PATCH). If-Match /
// Idempotency-Key enforcement is deferred, consistent with prior Fase 2 domains.
// The server computes all money and never trusts a client `expected`.
//
// SPEC-135 permission gating: register config reuses cash:report_read as a
// manager-tier gate (no dedicated register-admin permission exists). Ordinary
// movements use cash:movement_record; CLOSING_COUNT and reconciliation counts
// use cash:count; compensation uses cash:movement_compensate; reconciliation
// submit/approve use cash:reconciliation_submit / cash:reconciliation_approve;
// discounts use discount:manage (policy) and discount:apply (operators);
// reports use cash:report_read. Read/list/open surfaces use cash:session_open so
// a CASHIER operating its own session can see registers/sessions/movements.

const createRegisterBody = z.object({
  branchId: z.string().min(1),
  code: z.string().min(1),
  displayName: z.string().min(1),
  allowedCurrencies: z.array(z.string().min(1)).min(1),
});

const openSessionBody = z.object({
  currency: z.string().min(1),
  businessDate: z.string().min(1),
  timezone: z.string().min(1),
  openingAmountMinorUnits: z.number().int().nonnegative(),
});

const recordCountsBody = z.object({
  countedMinorUnits: z.number().int().nonnegative(),
});

const rejectReconciliationBody = z.object({
  reason: z.string().min(1).optional(),
});

const movementBody = z.object({
  type: z.enum(["OPENING", "CASH_SALE", "CASH_REFUND", "DEPOSIT", "WITHDRAWAL", "TIP_IN", "TIP_OUT", "ADJUSTMENT", "CLOSING_COUNT"]),
  amountMinorUnits: z.number().int().positive(),
  currency: z.string().min(1),
  direction: z.enum(["IN", "OUT"]).optional(),
  sourceType: z.string().min(1).optional(),
  sourceReference: z.string().min(1).optional(),
  idempotencyKey: z.string().min(1).optional(),
  reason: z.string().min(1).optional(),
  occurredAt: z.string().datetime().optional(),
});

const compensateMovementBody = z.object({
  reason: z.string().min(1).optional(),
});

const createDiscountBody = z.object({
  name: z.string().min(1),
  type: z.enum(["FIXED", "PERCENTAGE"]),
  value: z.number().int().positive(),
  scope: z.string().min(1),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
});

const discountEvaluateQuery = z.object({
  eligibleBaseMinorUnits: z.coerce.number().int().nonnegative(),
  currency: z.string().min(1),
});

const discountApplyBody = z.object({
  orderId: z.string().min(1).optional(),
  checkId: z.string().min(1).optional(),
  eligibleBaseMinorUnits: z.number().int().nonnegative(),
  currency: z.string().min(1),
  reasonCode: z.string().min(1).optional(),
});

function sessionDeps(container: Container) {
  return { registers: container.cashRegisters, sessions: container.cashSessions };
}

function reconDeps(container: Container) {
  return {
    sessions: container.cashSessions,
    movements: container.cashMovements,
    reconciliations: container.cashReconciliations,
  };
}

// Maps a domain error to a Problem kind. Bad-request errors (validation) are
// returned separately by each handler; this covers conflict/not-found.
function mapCashError(err: unknown): { kind: "conflict" | "badrequest" | "notfound"; message: string } | null {
  if (
    err instanceof SessionAlreadyOpenError ||
    err instanceof DuplicateCashRegisterCodeError ||
    err instanceof CurrencyNotAllowedError ||
    err instanceof InvalidCashSessionStateError ||
    err instanceof InvalidCashSessionTransitionError ||
    err instanceof InvalidReconciliationStateError ||
    err instanceof InvalidReconciliationTransitionError ||
    err instanceof CurrencyMismatchError ||
    err instanceof DuplicateSourceReferenceError ||
    err instanceof SessionNotAcceptingMovementsError ||
    err instanceof DiscountNotPublishedError ||
    err instanceof InvalidDiscountTransitionError
  ) {
    return { kind: "conflict", message: err.message };
  }
  if (
    err instanceof InvalidMovementAmountError ||
    err instanceof InvalidMovementDirectionError ||
    err instanceof InvalidDiscountValueError ||
    err instanceof MissingApplicationTargetError
  ) {
    return { kind: "badrequest", message: err.message };
  }
  if (err instanceof Error && err.message.includes("not found")) {
    return { kind: "notfound", message: err.message };
  }
  return null;
}

export async function registerCashRegisterRoutes(app: FastifyInstance, container: Container): Promise<void> {
  // Sends a mapped domain error, defaulting the not-found resource label.
  const sendMapped = (reply: import("fastify").FastifyReply, correlationId: string, err: unknown, notFoundLabel: string) => {
    const mapped = mapCashError(err);
    if (mapped?.kind === "conflict") return sendProblem(reply, correlationId, conflict(mapped.message));
    if (mapped?.kind === "badrequest") return sendProblem(reply, correlationId, badRequest(mapped.message));
    if (mapped?.kind === "notfound") return sendProblem(reply, correlationId, notFound(notFoundLabel));
    return sendProblem(reply, correlationId, err);
  };

  // POST /v1/cash-registers — configuration action (manager-tier).
  app.post("/v1/cash-registers", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "cash:report_read");
      const body = createRegisterBody.parse(req.body);
      const branch = await container.branches.findById(ctx.tenantId, body.branchId);
      if (!branch) return sendProblem(reply, correlationId, notFound("Branch"));
      const register = await createCashRegister(
        { registers: container.cashRegisters },
        { tenantId: ctx.tenantId, branchId: body.branchId, code: body.code, displayName: body.displayName, allowedCurrencies: body.allowedCurrencies },
      );
      reply.code(201);
      return { data: register };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      return sendMapped(reply, correlationId, err, "CashRegister");
    }
  });

  // GET /v1/branches/:branchId/cash-registers — anyone who can open a session
  // may see the registers.
  app.get<{ Params: { branchId: string } }>("/v1/branches/:branchId/cash-registers", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "cash:session_open");
      const registers = await listCashRegisters({ registers: container.cashRegisters }, ctx.tenantId, req.params.branchId);
      return { data: registers };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{ Params: { id: string } }>("/v1/cash-registers/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "cash:session_open");
      const register = await container.cashRegisters.findById(ctx.tenantId, req.params.id);
      if (!register) return sendProblem(reply, correlationId, notFound("CashRegister"));
      return { data: register };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  // POST /v1/cash-registers/:id/sessions — open a session (enforces one
  // OPEN/CLOSING per register+currency).
  app.post<{ Params: { id: string } }>("/v1/cash-registers/:id/sessions", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "cash:session_open");
      const body = openSessionBody.parse(req.body);
      const session = await openSession(sessionDeps(container), {
        tenantId: ctx.tenantId,
        cashRegisterId: req.params.id,
        currency: body.currency,
        businessDate: body.businessDate,
        timezone: body.timezone,
        openingAmountMinorUnits: body.openingAmountMinorUnits,
        openedBy: ctx.userId,
      });
      reply.code(201);
      return { data: session };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      return sendMapped(reply, correlationId, err, "CashRegister");
    }
  });

  app.get<{ Params: { id: string } }>("/v1/cash-registers/:id/sessions", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "cash:session_open");
      const sessions = await container.cashSessions.listByRegister(ctx.tenantId, req.params.id);
      return { data: sessions };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{ Params: { id: string } }>("/v1/cash-sessions/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "cash:session_open");
      const session = await container.cashSessions.findById(ctx.tenantId, req.params.id);
      if (!session) return sendProblem(reply, correlationId, notFound("CashSession"));
      return { data: session };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{ Params: { id: string } }>("/v1/cash-sessions/:id/movements", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "cash:session_open");
      const session = await container.cashSessions.findById(ctx.tenantId, req.params.id);
      if (!session) return sendProblem(reply, correlationId, notFound("CashSession"));
      const movements = await container.cashMovements.listBySession(ctx.tenantId, req.params.id);
      return { data: movements };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  // POST /v1/cash-sessions/:id/movements — CLOSING_COUNT is the physical-count
  // action (cash:count); every other type is cash:movement_record.
  app.post<{ Params: { id: string } }>("/v1/cash-sessions/:id/movements", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      const body = movementBody.parse(req.body);
      requirePermission(ctx, body.type === "CLOSING_COUNT" ? "cash:count" : "cash:movement_record");
      const movement = await recordMovement(
        { sessions: container.cashSessions, movements: container.cashMovements, outbox: container.outbox },
        {
          tenantId: ctx.tenantId,
          cashSessionId: req.params.id,
          type: body.type,
          amountMinorUnits: body.amountMinorUnits,
          currency: body.currency,
          actor: ctx.userId,
          correlationId,
          ...(body.direction ? { direction: body.direction } : {}),
          ...(body.sourceType ? { sourceType: body.sourceType } : {}),
          ...(body.sourceReference ? { sourceReference: body.sourceReference } : {}),
          ...(body.idempotencyKey ? { idempotencyKey: body.idempotencyKey } : {}),
          ...(body.reason ? { reason: body.reason } : {}),
          ...(body.occurredAt ? { occurredAt: new Date(body.occurredAt) } : {}),
        },
      );
      reply.code(201);
      return { data: movement };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      return sendMapped(reply, correlationId, err, "CashSession");
    }
  });

  app.get<{ Params: { id: string } }>("/v1/cash-movements/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "cash:session_open");
      const movement = await container.cashMovements.findById(ctx.tenantId, req.params.id);
      if (!movement) return sendProblem(reply, correlationId, notFound("CashMovement"));
      return { data: movement };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  // POST /v1/cash-movements/:id/compensate — inverse ADJUSTMENT (manager-tier).
  app.post<{ Params: { id: string } }>("/v1/cash-movements/:id/compensate", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "cash:movement_compensate");
      const body = compensateMovementBody.parse(req.body ?? {});
      const movement = await compensateMovement(
        { sessions: container.cashSessions, movements: container.cashMovements, outbox: container.outbox },
        { tenantId: ctx.tenantId, cashMovementId: req.params.id, actor: ctx.userId, correlationId, ...(body.reason ? { reason: body.reason } : {}) },
      );
      return { data: movement };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      return sendMapped(reply, correlationId, err, "CashMovement");
    }
  });

  // GET /v1/cash-reconciliations/:id — the stored reconciliation record.
  app.get<{ Params: { id: string } }>("/v1/cash-reconciliations/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "cash:count");
      const reconciliation = await container.cashReconciliations.findById(ctx.tenantId, req.params.id);
      if (!reconciliation) return sendProblem(reply, correlationId, notFound("CashReconciliation"));
      return { data: reconciliation };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  // GET /v1/cash-reconciliations/:id/summary — read-only recompute of expected.
  app.get<{ Params: { id: string } }>("/v1/cash-reconciliations/:id/summary", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "cash:count");
      const summary = await getExpectedSummary(reconDeps(container), { tenantId: ctx.tenantId, id: req.params.id });
      return { data: summary };
    } catch (err) {
      return sendMapped(reply, correlationId, err, "CashReconciliation");
    }
  });

  app.post<{ Params: { id: string } }>("/v1/cash-reconciliations/:id/record-counts", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "cash:count");
      const body = recordCountsBody.parse(req.body);
      const reconciliation = await recordCounts(reconDeps(container), {
        tenantId: ctx.tenantId,
        id: req.params.id,
        countedMinorUnits: body.countedMinorUnits,
      });
      return { data: reconciliation };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      return sendMapped(reply, correlationId, err, "CashReconciliation");
    }
  });

  app.post<{ Params: { id: string } }>("/v1/cash-reconciliations/:id/submit", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "cash:reconciliation_submit");
      const reconciliation = await submitReconciliation(reconDeps(container), { tenantId: ctx.tenantId, id: req.params.id });
      return { data: reconciliation };
    } catch (err) {
      return sendMapped(reply, correlationId, err, "CashReconciliation");
    }
  });

  app.post<{ Params: { id: string } }>("/v1/cash-reconciliations/:id/approve", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "cash:reconciliation_approve");
      const reconciliation = await approveReconciliation(
        { ...reconDeps(container), outbox: container.outbox },
        { tenantId: ctx.tenantId, id: req.params.id, approvedBy: ctx.userId, correlationId },
      );
      return { data: reconciliation };
    } catch (err) {
      return sendMapped(reply, correlationId, err, "CashReconciliation");
    }
  });

  app.post<{ Params: { id: string } }>("/v1/cash-reconciliations/:id/reject", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "cash:reconciliation_approve");
      const body = rejectReconciliationBody.parse(req.body ?? {});
      const reconciliation = await rejectReconciliation(reconDeps(container), {
        tenantId: ctx.tenantId,
        id: req.params.id,
        rejectedBy: ctx.userId,
        ...(body.reason ? { reason: body.reason } : {}),
      });
      return { data: reconciliation };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      return sendMapped(reply, correlationId, err, "CashReconciliation");
    }
  });

  app.post("/v1/discounts", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "discount:manage");
      const body = createDiscountBody.parse(req.body);
      const discount = await createDiscount(
        { discounts: container.discounts },
        {
          tenantId: ctx.tenantId,
          name: body.name,
          type: body.type,
          value: body.value,
          scope: body.scope,
          ...(body.validFrom ? { validFrom: new Date(body.validFrom) } : {}),
          ...(body.validUntil ? { validUntil: new Date(body.validUntil) } : {}),
        },
      );
      reply.code(201);
      return { data: discount };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      return sendMapped(reply, correlationId, err, "Discount");
    }
  });

  app.get("/v1/discounts", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "discount:manage");
      const discounts = await listDiscounts({ discounts: container.discounts }, ctx.tenantId);
      return { data: discounts };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{ Params: { id: string } }>("/v1/discounts/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "discount:manage");
      const discount = await container.discounts.findById(ctx.tenantId, req.params.id);
      if (!discount) return sendProblem(reply, correlationId, notFound("Discount"));
      return { data: discount };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  // GET /v1/discounts/:id/evaluate — read-only; returns the amount that WOULD
  // apply for a given eligible base. An operator right (discount:apply).
  app.get<{ Params: { id: string }; Querystring: { eligibleBaseMinorUnits: string; currency: string } }>(
    "/v1/discounts/:id/evaluate",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "discount:apply");
        const query = discountEvaluateQuery.parse(req.query);
        const evaluation = await evaluateDiscount(
          { discounts: container.discounts },
          { tenantId: ctx.tenantId, id: req.params.id, eligibleBaseMinorUnits: query.eligibleBaseMinorUnits, currency: query.currency },
        );
        return { data: evaluation };
      } catch (err) {
        if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
        return sendMapped(reply, correlationId, err, "Discount");
      }
    },
  );

  app.post<{ Params: { id: string } }>("/v1/discounts/:id/publish", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "discount:manage");
      const discount = await publishDiscount({ discounts: container.discounts }, { tenantId: ctx.tenantId, id: req.params.id });
      return { data: discount };
    } catch (err) {
      return sendMapped(reply, correlationId, err, "Discount");
    }
  });

  app.post<{ Params: { id: string } }>("/v1/discounts/:id/deactivate", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "discount:manage");
      const discount = await deactivateDiscount({ discounts: container.discounts }, { tenantId: ctx.tenantId, id: req.params.id });
      return { data: discount };
    } catch (err) {
      return sendMapped(reply, correlationId, err, "Discount");
    }
  });

  // POST /v1/discounts/:id/apply — records a DiscountApplication. Does NOT mutate
  // a Floor Check total (deferred integration — see discount-application.ts).
  app.post<{ Params: { id: string } }>("/v1/discounts/:id/apply", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "discount:apply");
      const body = discountApplyBody.parse(req.body);
      const application = await applyDiscount(
        { discounts: container.discounts, applications: container.discountApplications },
        {
          tenantId: ctx.tenantId,
          discountId: req.params.id,
          eligibleBaseMinorUnits: body.eligibleBaseMinorUnits,
          currency: body.currency,
          actorRef: ctx.userId,
          ...(body.orderId ? { orderId: body.orderId } : {}),
          ...(body.checkId ? { checkId: body.checkId } : {}),
          ...(body.reasonCode ? { reasonCode: body.reasonCode } : {}),
        },
      );
      reply.code(201);
      return { data: application };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      return sendMapped(reply, correlationId, err, "Discount");
    }
  });

  app.get<{ Params: { id: string } }>("/v1/discount-applications/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "discount:manage");
      const application = await container.discountApplications.findById(ctx.tenantId, req.params.id);
      if (!application) return sendProblem(reply, correlationId, notFound("DiscountApplication"));
      return { data: application };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  // Session lifecycle commands (begin-close / close / suspend / resume).
  const sessionCommand = (
    path: string,
    permission: string,
    run: (ctx: Awaited<ReturnType<typeof requireTenantContext>>, id: string) => Promise<unknown>,
  ) => {
    app.post<{ Params: { id: string } }>(path, async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, permission);
        const data = await run(ctx, req.params.id);
        return { data };
      } catch (err) {
        return sendMapped(reply, correlationId, err, "CashSession");
      }
    });
  };

  sessionCommand("/v1/cash-sessions/:id/begin-close", "cash:session_close", (ctx, id) =>
    beginCloseSession(sessionDeps(container), { tenantId: ctx.tenantId, id }),
  );
  sessionCommand("/v1/cash-sessions/:id/close", "cash:session_close", (ctx, id) =>
    closeSession(
      {
        registers: container.cashRegisters,
        sessions: container.cashSessions,
        movements: container.cashMovements,
        reconciliations: container.cashReconciliations,
      },
      { tenantId: ctx.tenantId, id, closedBy: ctx.userId },
    ),
  );
  sessionCommand("/v1/cash-sessions/:id/suspend", "cash:session_open", (ctx, id) =>
    suspendSession(sessionDeps(container), { tenantId: ctx.tenantId, id }),
  );
  sessionCommand("/v1/cash-sessions/:id/resume", "cash:session_open", (ctx, id) =>
    resumeSession(sessionDeps(container), { tenantId: ctx.tenantId, id }),
  );

  // GET /v1/branches/:branchId/daily-settlement — SPEC-134 stateless calculation.
  app.get<{ Params: { branchId: string }; Querystring: { businessDate?: string; currency?: string } }>(
    "/v1/branches/:branchId/daily-settlement",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "cash:report_read");
        const businessDate = req.query.businessDate;
        const currency = req.query.currency;
        if (!businessDate || !currency) {
          return sendProblem(reply, correlationId, badRequest("businessDate and currency query params are required"));
        }
        const branch = await container.branches.findById(ctx.tenantId, req.params.branchId);
        if (!branch) return sendProblem(reply, correlationId, notFound("Branch"));

        const sessions = await container.cashSessions.listByBranchAndBusinessDate(
          ctx.tenantId,
          req.params.branchId,
          businessDate,
          currency,
        );
        const movements = await container.cashMovements.listByBranchAndSessions(
          ctx.tenantId,
          sessions.map((s) => s.id),
        );
        const reconciliations = await Promise.all(
          sessions.map(async (s) => {
            const rec = await container.cashReconciliations.findBySession(ctx.tenantId, s.id);
            return { cashSessionId: s.id, countedMinorUnits: rec?.countedMinorUnits ?? null };
          }),
        );

        const settlement = calculateDailySettlement({
          tenantId: ctx.tenantId,
          branchId: req.params.branchId,
          businessDate,
          timezone: branch.timezone,
          currency,
          sessions,
          movements,
          reconciliations,
        });
        return { data: settlement };
      } catch (err) {
        return sendProblem(reply, correlationId, err);
      }
    },
  );
}
