import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  startBreak,
  endBreak,
  BreakRevisionConflictError,
  requestBreakAdjustment,
  approveRequestedBreakAdjustment,
  rejectRequestedBreakAdjustment,
  OpenBreakConflictError,
  InvalidBreakTransitionError,
  InvalidBreakAdjustmentTransitionError,
  InvalidBreakAdjustmentError,
  StaleBreakAdjustmentApprovalError,
  SelfBreakApprovalNotAllowedError,
} from "@maitre/workforce";
import type { Container } from "../composition/container.js";
import { hasContextPermission, requireTenantContext, requirePermission } from "../http/request-context.js";
import { sendProblem, notFound, conflict, badRequest, insufficientScope } from "../http/problem-details.js";
import { omitUndefined } from "../http/omit-undefined.js";

const startBreakBodySchema = z.object({
  commandId: z.string().uuid().optional(),
  timeEntryId: z.string().uuid(),
  breakType: z.enum(["MEAL", "REST", "OTHER"]),
  paidClassification: z.enum(["PAID", "UNPAID"]),
  laborPolicyVersion: z.string().min(1),
  openedAt: z.coerce.date(),
  timezone: z.string().min(1),
  source: z.enum(["DEVICE", "MANUAL", "IMPORT"]),
  deviceId: z.string().min(1),
  deviceSequence: z.number().int().nonnegative(),
});

const endBreakBodySchema = z.object({
  commandId: z.string().uuid().optional(),
  expectedRevision: z.number().int().nonnegative(),
  closedAt: z.coerce.date(),
});

const requestBreakAdjustmentBodySchema = z.object({
  commandId: z.string().uuid().optional(),
  requesterId: z.string().min(1),
  reason: z.string().min(1),
  requestedOpenedAt: z.coerce.date().optional(),
  requestedClosedAt: z.coerce.date().optional(),
  evidence: z.string().optional(),
});

const decideBreakAdjustmentBodySchema = z.object({
  commandId: z.string().uuid().optional(),
  approverId: z.string().min(1),
});

const listBreaksQuerySchema = z.object({
  status: z.enum(["OPEN", "CLOSED"]).optional(),
});

const listTimeEntryBreaksQuerySchema = z.object({
  status: z.enum(["OPEN", "CLOSED"]).optional(),
  order: z.enum(["openedAt.asc", "openedAt.desc"]).optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
});

const listBreakAdjustmentsQuerySchema = z.object({
  status: z.enum(["REQUESTED", "APPROVED", "REJECTED"]).optional(),
  order: z.enum(["createdAt.asc", "createdAt.desc", "effectiveAt.asc", "effectiveAt.desc"]).optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
});

function parsePositiveInt(value: string | undefined, field: string): number | null {
  if (value === undefined) return null;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    throw badRequest(`Invalid ${field}`);
  }
  return parsed;
}

function parseNonNegativeInt(value: string | undefined, field: string): number | null {
  if (value === undefined) return null;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw badRequest(`Invalid ${field}`);
  }
  return parsed;
}

function millisOf(value: Date | null | undefined): number {
  return value?.getTime() ?? 0;
}

function breaksEnabled(container: Container): boolean {
  return Boolean(container.employments && container.timeEntries && container.breakLogs && container.breakAdjustments);
}

function canReadSensitiveBreaks(ctx: Awaited<ReturnType<typeof requireTenantContext>>): boolean {
  return hasContextPermission(ctx, "time:read_sensitive");
}

function canReadOwnBreaks(ctx: Awaited<ReturnType<typeof requireTenantContext>>): boolean {
  return hasContextPermission(ctx, "time:read_own");
}

async function requireBreakReadAccess(
  container: Container,
  ctx: Awaited<ReturnType<typeof requireTenantContext>>,
  timeEntry: { employmentId: string; branchId: string },
): Promise<"sensitive" | "own"> {
  if (canReadSensitiveBreaks(ctx)) {
    if (ctx.branchScopeType === "ALL_BRANCHES" || ctx.branchIds.includes(timeEntry.branchId)) {
      return "sensitive";
    }
    throw notFound("TimeEntry");
  }

  if (!canReadOwnBreaks(ctx)) {
    throw insufficientScope();
  }

  const employment = await container.employments!.findById(ctx.tenantId, timeEntry.employmentId);
  if (!employment || employment.personRef !== ctx.externalIdentityId) {
    throw notFound("TimeEntry");
  }
  return "own";
}

function redactBreakAdjustmentForOwnAccess<T extends {
  requesterId?: string | null;
  approverId?: string | null;
  evidence?: string | null;
}>(adjustment: T): Omit<T, "requesterId" | "approverId" | "evidence"> {
  const { requesterId: _requesterId, approverId: _approverId, evidence: _evidence, ...rest } = adjustment;
  return rest;
}

function requireBranchScopedSupervisorManage(
  ctx: Awaited<ReturnType<typeof requireTenantContext>>,
  branchId: string,
  resource: "TimeEntry" | "BreakLog" | "BreakAdjustment" = "TimeEntry",
): void {
  if (ctx.branchScopeType !== "ALL_BRANCHES" && !ctx.branchIds.includes(branchId)) {
    throw notFound(resource);
  }
}

export async function registerBreakRoutes(app: FastifyInstance, container: Container): Promise<void> {
  if (!breaksEnabled(container)) return;

  app.post("/v1/breaks/start", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "time:clock");
      const body = startBreakBodySchema.parse(req.body);
      const timeEntry = await container.timeEntries!.findById(ctx.tenantId, body.timeEntryId);
      if (!timeEntry) {
        return sendProblem(reply, correlationId, notFound("TimeEntry"));
      }
      requireBranchScopedSupervisorManage(ctx, timeEntry.branchId, "TimeEntry");
      const breakLog = await startBreak(
        { timeEntries: container.timeEntries!, breakLogs: container.breakLogs! },
        { tenantId: ctx.tenantId, ...omitUndefined(body) },
      );
      reply.code(201);
      return { data: breakLog };
    } catch (err) {
      if (err instanceof OpenBreakConflictError || err instanceof InvalidBreakTransitionError) {
        return sendProblem(reply, correlationId, conflict(err.message));
      }
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      if (err instanceof Error && err.message.includes("not found")) {
        return sendProblem(reply, correlationId, notFound("TimeEntry"));
      }
      if (err instanceof Error && err.message.includes("must be OPEN")) {
        return sendProblem(reply, correlationId, conflict(err.message));
      }
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/breaks/:id/end", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "time:clock");
      const body = endBreakBodySchema.parse(req.body);
      const existingBreakLog = await container.breakLogs!.findById(ctx.tenantId, req.params.id);
      if (!existingBreakLog) {
        return sendProblem(reply, correlationId, notFound("BreakLog"));
      }
      const timeEntry = await container.timeEntries!.findById(ctx.tenantId, existingBreakLog.timeEntryId);
      if (!timeEntry) {
        return sendProblem(reply, correlationId, notFound("TimeEntry"));
      }
      requireBranchScopedSupervisorManage(ctx, timeEntry.branchId, "BreakLog");
      const breakLog = await endBreak(
        { timeEntries: container.timeEntries!, breakLogs: container.breakLogs! },
        {
          tenantId: ctx.tenantId,
          breakLogId: req.params.id,
          expectedRevision: body.expectedRevision,
          closedAt: body.closedAt,
          ...(body.commandId ? { commandId: body.commandId } : {}),
        },
      );
      return { data: breakLog };
    } catch (err) {
      if (err instanceof InvalidBreakTransitionError || err instanceof BreakRevisionConflictError) {
        return sendProblem(reply, correlationId, conflict(err.message));
      }
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      if (err instanceof Error && err.message.includes("not found")) {
        return sendProblem(reply, correlationId, notFound("BreakLog"));
      }
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{ Params: { id: string } }>("/v1/breaks/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      const breakLog = await container.breakLogs!.findById(ctx.tenantId, req.params.id);
      if (!breakLog) return sendProblem(reply, correlationId, notFound("BreakLog"));
      const timeEntry = await container.timeEntries!.findById(ctx.tenantId, breakLog.timeEntryId);
      if (!timeEntry) return sendProblem(reply, correlationId, notFound("TimeEntry"));
      await requireBreakReadAccess(container, ctx, timeEntry);
      return { data: breakLog };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{
    Params: { timeEntryId: string };
    Querystring: { status?: "OPEN" | "CLOSED"; order?: string; limit?: string; offset?: string };
  }>(
    "/v1/time-entries/:timeEntryId/breaks",
    async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      const query = listTimeEntryBreaksQuerySchema.parse(req.query);
      const timeEntry = await container.timeEntries!.findById(ctx.tenantId, req.params.timeEntryId);
      if (!timeEntry) {
        return sendProblem(reply, correlationId, notFound("TimeEntry"));
      }
      await requireBreakReadAccess(container, ctx, timeEntry);
      const order = query.order ?? "openedAt.desc";
      const limit = parsePositiveInt(query.limit, "limit");
      const offset = parseNonNegativeInt(query.offset, "offset") ?? 0;
      let logs = await container.breakLogs!.listByTimeEntry(ctx.tenantId, req.params.timeEntryId);
      if (query.status) {
        logs = logs.filter((log) => log.status === query.status);
      }
      logs = logs.sort((a, b) =>
        order === "openedAt.asc"
          ? a.openedAt.getTime() - b.openedAt.getTime()
          : b.openedAt.getTime() - a.openedAt.getTime(),
      );
      const total = logs.length;
      const paged = logs.slice(offset, limit !== null ? offset + limit : undefined);
      return {
        data: paged,
        page: { total, limit: limit ?? total, offset },
      };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{
    Params: { branchId: string };
    Querystring: {
      status?: "OPEN" | "CLOSED";
      from?: string;
      to?: string;
      order?: "openedAt.asc" | "openedAt.desc";
      limit?: string;
      offset?: string;
    };
  }>("/v1/branches/:branchId/breaks", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "time:read_sensitive");
      if (ctx.branchScopeType !== "ALL_BRANCHES" && !ctx.branchIds.includes(req.params.branchId)) {
        return sendProblem(reply, correlationId, notFound("Branch"));
      }
      const branch = await container.branches.findById(ctx.tenantId, req.params.branchId);
      if (!branch) {
        return sendProblem(reply, correlationId, notFound("Branch"));
      }
      const query = listBreaksQuerySchema.parse(req.query);
      const fromRaw = req.query?.from;
      const toRaw = req.query?.to;
      const order = req.query?.order ?? "openedAt.desc";
      const limit = parsePositiveInt(req.query?.limit, "limit");
      const offset = parseNonNegativeInt(req.query?.offset, "offset") ?? 0;
      const from = fromRaw ? new Date(fromRaw) : null;
      const to = toRaw ? new Date(toRaw) : null;
      if (fromRaw && Number.isNaN(from?.getTime())) {
        return sendProblem(reply, correlationId, badRequest("Invalid from"));
      }
      if (toRaw && Number.isNaN(to?.getTime())) {
        return sendProblem(reply, correlationId, badRequest("Invalid to"));
      }
      if (from && to && from.getTime() > to.getTime()) {
        return sendProblem(reply, correlationId, badRequest("from must be earlier than or equal to to"));
      }
      if (order !== "openedAt.asc" && order !== "openedAt.desc") {
        return sendProblem(reply, correlationId, badRequest("Invalid order"));
      }
      const entries = await container.timeEntries!.listByBranch(ctx.tenantId, req.params.branchId);
      const nested = await Promise.all(
        entries.map((entry) => container.breakLogs!.listByTimeEntry(ctx.tenantId, entry.id)),
      );
      let logs = nested.flat();
      if (from) {
        logs = logs.filter((log) => log.openedAt.getTime() >= from.getTime());
      }
      if (to) {
        logs = logs.filter((log) => log.openedAt.getTime() <= to.getTime());
      }
      logs = query.status ? logs.filter((log) => log.status === query.status) : logs;
      logs = logs.sort((a, b) =>
        order === "openedAt.asc"
          ? a.openedAt.getTime() - b.openedAt.getTime()
          : b.openedAt.getTime() - a.openedAt.getTime(),
      );
      const total = logs.length;
      const paged = logs.slice(offset, limit !== null ? offset + limit : undefined);
      return {
        data: paged,
        page: {
          total,
          limit: limit ?? total,
          offset,
        },
      };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { breakLogId: string } }>(
    "/v1/breaks/:breakLogId/adjustments",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "time:adjust_request");
        const body = requestBreakAdjustmentBodySchema.parse(req.body);
        const breakLog = await container.breakLogs!.findById(ctx.tenantId, req.params.breakLogId);
        if (!breakLog) {
          return sendProblem(reply, correlationId, notFound("BreakLog"));
        }
        const timeEntry = await container.timeEntries!.findById(ctx.tenantId, breakLog.timeEntryId);
        if (!timeEntry) {
          return sendProblem(reply, correlationId, notFound("TimeEntry"));
        }
        requireBranchScopedSupervisorManage(ctx, timeEntry.branchId, "BreakLog");
        const adjustment = await requestBreakAdjustment(
          { breakLogs: container.breakLogs!, breakAdjustments: container.breakAdjustments! },
          { tenantId: ctx.tenantId, breakLogId: req.params.breakLogId, ...omitUndefined(body) },
        );
        reply.code(201);
        return { data: adjustment };
      } catch (err) {
        if (err instanceof InvalidBreakAdjustmentError) {
          return sendProblem(reply, correlationId, badRequest(err.message));
        }
        if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
        if (err instanceof Error && err.message.includes("not found")) {
          return sendProblem(reply, correlationId, notFound("BreakLog"));
        }
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.get<{
    Params: { breakLogId: string };
    Querystring: { status?: string; order?: string; limit?: string; offset?: string };
  }>("/v1/breaks/:breakLogId/adjustments", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      const query = listBreakAdjustmentsQuerySchema.parse(req.query);
      const breakLog = await container.breakLogs!.findById(ctx.tenantId, req.params.breakLogId);
      if (!breakLog) {
        return sendProblem(reply, correlationId, notFound("BreakLog"));
      }
      const timeEntry = await container.timeEntries!.findById(ctx.tenantId, breakLog.timeEntryId);
      if (!timeEntry) {
        return sendProblem(reply, correlationId, notFound("TimeEntry"));
      }
      const access = await requireBreakReadAccess(container, ctx, timeEntry);
      const order = query.order ?? "createdAt.desc";
      const limit = parsePositiveInt(query.limit, "limit");
      const offset = parseNonNegativeInt(query.offset, "offset") ?? 0;
      let adjustments = await container.breakAdjustments!.listByBreakLog(ctx.tenantId, req.params.breakLogId);
      if (query.status) {
        adjustments = adjustments.filter((adjustment) => adjustment.status === query.status);
      }
      adjustments = adjustments.sort((a, b) => {
        switch (order) {
          case "createdAt.asc":
            return a.createdAt.getTime() - b.createdAt.getTime();
          case "createdAt.desc":
            return b.createdAt.getTime() - a.createdAt.getTime();
          case "effectiveAt.asc":
            return millisOf(a.effectiveAt) - millisOf(b.effectiveAt);
          case "effectiveAt.desc":
            return millisOf(b.effectiveAt) - millisOf(a.effectiveAt);
        }
      });
      const total = adjustments.length;
      const paged = adjustments.slice(offset, limit !== null ? offset + limit : undefined);
      return {
        data: access === "own" ? paged.map((adjustment) => redactBreakAdjustmentForOwnAccess(adjustment)) : paged,
        page: { total, limit: limit ?? total, offset },
      };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{ Params: { id: string } }>("/v1/break-adjustments/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      const adjustment = await container.breakAdjustments!.findById(ctx.tenantId, req.params.id);
      if (!adjustment) return sendProblem(reply, correlationId, notFound("BreakAdjustment"));
      const breakLog = await container.breakLogs!.findById(ctx.tenantId, adjustment.breakLogId);
      if (!breakLog) return sendProblem(reply, correlationId, notFound("BreakLog"));
      const timeEntry = await container.timeEntries!.findById(ctx.tenantId, breakLog.timeEntryId);
      if (!timeEntry) return sendProblem(reply, correlationId, notFound("TimeEntry"));
      const access = await requireBreakReadAccess(container, ctx, timeEntry);
      return { data: access === "own" ? redactBreakAdjustmentForOwnAccess(adjustment) : adjustment };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/break-adjustments/:id/approve", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "time:adjust_approve");
      const body = decideBreakAdjustmentBodySchema.parse(req.body);
      const existingAdjustment = await container.breakAdjustments!.findById(ctx.tenantId, req.params.id);
      if (!existingAdjustment) return sendProblem(reply, correlationId, notFound("BreakAdjustment"));
      const breakLog = await container.breakLogs!.findById(ctx.tenantId, existingAdjustment.breakLogId);
      if (!breakLog) return sendProblem(reply, correlationId, notFound("BreakLog"));
      const timeEntry = await container.timeEntries!.findById(ctx.tenantId, breakLog.timeEntryId);
      if (!timeEntry) return sendProblem(reply, correlationId, notFound("TimeEntry"));
      requireBranchScopedSupervisorManage(ctx, timeEntry.branchId, "BreakAdjustment");
      const adjustment = await approveRequestedBreakAdjustment(
        { breakLogs: container.breakLogs!, breakAdjustments: container.breakAdjustments! },
        ctx.tenantId,
        req.params.id,
        body.approverId,
        body.commandId,
      );
      return { data: adjustment };
    } catch (err) {
      if (err instanceof InvalidBreakAdjustmentError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      if (
        err instanceof InvalidBreakAdjustmentTransitionError ||
        err instanceof SelfBreakApprovalNotAllowedError ||
        err instanceof StaleBreakAdjustmentApprovalError
      ) {
        return sendProblem(reply, correlationId, conflict(err.message));
      }
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      if (err instanceof Error && err.message.includes("not found")) {
        if (err.message.includes("BreakLog")) {
          return sendProblem(reply, correlationId, notFound("BreakLog"));
        }
        return sendProblem(reply, correlationId, notFound("BreakAdjustment"));
      }
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/break-adjustments/:id/reject", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "time:adjust_approve");
      const body = decideBreakAdjustmentBodySchema.parse(req.body);
      const existingAdjustment = await container.breakAdjustments!.findById(ctx.tenantId, req.params.id);
      if (!existingAdjustment) return sendProblem(reply, correlationId, notFound("BreakAdjustment"));
      const breakLog = await container.breakLogs!.findById(ctx.tenantId, existingAdjustment.breakLogId);
      if (!breakLog) return sendProblem(reply, correlationId, notFound("BreakLog"));
      const timeEntry = await container.timeEntries!.findById(ctx.tenantId, breakLog.timeEntryId);
      if (!timeEntry) return sendProblem(reply, correlationId, notFound("TimeEntry"));
      requireBranchScopedSupervisorManage(ctx, timeEntry.branchId, "BreakAdjustment");
      const adjustment = await rejectRequestedBreakAdjustment(
        { breakLogs: container.breakLogs!, breakAdjustments: container.breakAdjustments! },
        ctx.tenantId,
        req.params.id,
        body.approverId,
        body.commandId,
      );
      return { data: adjustment };
    } catch (err) {
      if (err instanceof InvalidBreakAdjustmentTransitionError || err instanceof SelfBreakApprovalNotAllowedError) {
        return sendProblem(reply, correlationId, conflict(err.message));
      }
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      if (err instanceof Error && err.message.includes("not found")) {
        if (err.message.includes("BreakLog")) {
          return sendProblem(reply, correlationId, notFound("BreakLog"));
        }
        return sendProblem(reply, correlationId, notFound("BreakAdjustment"));
      }
      return sendProblem(reply, correlationId, err);
    }
  });
}
