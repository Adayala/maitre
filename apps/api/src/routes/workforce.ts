import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  createEmployment,
  DuplicateEmployeeCodeError,
  createWorkShift,
  publishWorkShift,
  startWorkShift,
  completeWorkShift,
  cancelWorkShift,
  ActiveWorkShiftConflictError,
  InvalidWorkShiftTransitionError,
  InvalidWorkShiftIntervalError,
  createShiftAssignment,
  confirmShiftAssignment,
  declineShiftAssignment,
  cancelShiftAssignment,
  reassignShiftAssignment,
  DuplicateShiftAssignmentError,
  InvalidShiftAssignmentTransitionError,
  clockIn,
  clockOut,
  resolveBreakClockOutPolicy,
  requestTimeAdjustment,
  approveRequestedTimeAdjustment,
  rejectRequestedTimeAdjustment,
  OpenBreakOnClockOutError,
  OpenTimeEntryConflictError,
  InvalidTimeEntryTransitionError,
  InvalidTimeAdjustmentTransitionError,
  InvalidTimeAdjustmentError,
  StaleTimeAdjustmentApprovalError,
  SelfApprovalNotAllowedError,
} from "@maitre/workforce";
import { recordAuditLog } from "@maitre/audit";
import type { Container } from "../composition/container.js";
import { hasContextPermission, requireTenantContext, requirePermission } from "../http/request-context.js";
import {
  sendProblem,
  notFound,
  conflict,
  badRequest,
  insufficientScope,
  stepUpRequired,
} from "../http/problem-details.js";
import { omitUndefined } from "../http/omit-undefined.js";
import { resolveEffectiveLaborPolicyVersion } from "../workforce/labor-policy-repository.js";
import type { TimeExportJobRecord } from "../workforce/time-export-repository.js";

const createEmploymentBodySchema = z.object({
  personRef: z.string().min(1),
  employeeCode: z.string().min(1),
  relationshipType: z.enum(["EMPLOYEE", "CONTRACTOR", "TEMPORARY"]),
  eligibleBranchIds: z.array(z.string().uuid()).min(1),
  status: z.enum(["ACTIVE", "INACTIVE", "TERMINATED"]).optional(),
  validFrom: z.coerce.date(),
  validUntil: z.coerce.date().optional(),
});

const createWorkShiftBodySchema = z.object({
  timezone: z.string().min(1),
  businessDate: z.string().min(1),
  startsAtUtc: z.coerce.date(),
  endsAtUtc: z.coerce.date(),
  laborPolicyVersion: z.string().min(1),
  servicePeriodId: z.string().uuid().optional(),
});

const createShiftAssignmentBodySchema = z.object({
  employmentId: z.string().uuid(),
  roleCode: z.string().min(1),
  stationId: z.string().uuid().optional(),
});

const assignmentReasonBodySchema = z.object({
  reason: z.string().min(1),
});

const reassignShiftAssignmentBodySchema = z.object({
  employmentId: z.string().uuid(),
  roleCode: z.string().min(1),
  stationId: z.string().uuid().optional(),
  reason: z.string().min(1),
  confirmNewAssignment: z.boolean().optional(),
});

const clockInBodySchema = z.object({
  commandId: z.string().uuid().optional(),
  branchId: z.string().uuid(),
  employmentId: z.string().uuid(),
  shiftAssignmentId: z.string().uuid().optional(),
  capturedAt: z.coerce.date(),
  timezone: z.string().min(1),
  source: z.enum(["DEVICE", "MANUAL", "IMPORT"]),
  deviceId: z.string().min(1),
  deviceSequence: z.number().int().nonnegative(),
});

const clockOutBodySchema = z.object({
  commandId: z.string().uuid().optional(),
  employmentId: z.string().uuid(),
  capturedAt: z.coerce.date(),
});

const requestTimeAdjustmentBodySchema = z.object({
  commandId: z.string().uuid().optional(),
  requesterId: z.string().min(1),
  reason: z.string().min(1),
  requestedClockInAt: z.coerce.date().optional(),
  requestedClockOutAt: z.coerce.date().optional(),
  evidence: z.string().optional(),
});

const decideTimeAdjustmentBodySchema = z.object({
  commandId: z.string().uuid().optional(),
  approverId: z.string().min(1),
});

const listTimeEntriesQuerySchema = z.object({
  status: z.enum(["OPEN", "CLOSED"]).optional(),
});

const listEmploymentsQuerySchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "TERMINATED"]).optional(),
  order: z.enum(["employeeCode.asc", "employeeCode.desc", "createdAt.asc", "createdAt.desc"]).optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
});

const listBranchEmploymentsQuerySchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "TERMINATED"]).optional(),
  order: z.enum(["employeeCode.asc", "employeeCode.desc", "createdAt.asc", "createdAt.desc"]).optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
});

const listWorkShiftsQuerySchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  order: z.enum(["startsAtUtc.asc", "startsAtUtc.desc", "businessDate.asc", "businessDate.desc"]).optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
});

const listAssignmentsQuerySchema = z.object({
  status: z.enum(["PROPOSED", "CONFIRMED", "DECLINED", "CANCELLED"]).optional(),
  order: z.enum(["createdAt.asc", "createdAt.desc", "roleCode.asc", "roleCode.desc"]).optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
});

const listBranchAssignmentsQuerySchema = z.object({
  status: z.enum(["PROPOSED", "CONFIRMED", "DECLINED", "CANCELLED"]).optional(),
  order: z.enum(["createdAt.asc", "createdAt.desc", "roleCode.asc", "roleCode.desc"]).optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
});

const listEmploymentTimeEntriesQuerySchema = z.object({
  status: z.enum(["OPEN", "CLOSED"]).optional(),
  pendingReview: z.enum(["true", "false"]).optional(),
  order: z.enum(["capturedAt.asc", "capturedAt.desc"]).optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
});

const listTimeAdjustmentsQuerySchema = z.object({
  status: z.enum(["REQUESTED", "APPROVED", "REJECTED"]).optional(),
  order: z.enum(["createdAt.asc", "createdAt.desc", "effectiveAt.asc", "effectiveAt.desc"]).optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
});

const requestTimeExportBodySchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
  reason: z.string().min(1),
  format: z.enum(["CSV"]).optional(),
});

const laborPolicyMetadataQuerySchema = z.object({
  version: z.string().min(1).optional(),
  effectiveAt: z.coerce.date().optional(),
});

const createLaborPolicyVersionBodySchema = z.object({
  id: z.string().uuid().optional(),
  jurisdictionCode: z.string().min(1),
  sourceType: z.enum(["OFFICIAL", "COUNSEL", "INTERNAL_APPROVED_REFERENCE"]),
  sourceRef: z.string().min(1),
  consultedAt: z.coerce.date(),
  effectiveFrom: z.coerce.date(),
  effectiveUntil: z.coerce.date().optional(),
  contentHash: z.string().min(1),
  reviewerRef: z.string().min(1),
  approvedAt: z.coerce.date(),
  supersedesPolicyVersionId: z.string().uuid().optional(),
  policyCapabilities: z.object({
    breaks: z
      .object({
        clockOutOpenBreak: z.object({
          mode: z.enum(["REJECT", "AUTO_CLOSE"]),
        }),
      })
      .optional(),
    dailyMaximums: z.enum(["SUPPORTED", "NOT_CONFIGURED"]).optional(),
    weeklyMaximums: z.enum(["SUPPORTED", "NOT_CONFIGURED"]).optional(),
    nightShift: z.enum(["SUPPORTED", "NOT_CONFIGURED"]).optional(),
    holidaysCalendar: z.enum(["SUPPORTED", "NOT_CONFIGURED"]).optional(),
    minors: z.enum(["SUPPORTED", "NOT_CONFIGURED"]).optional(),
    tenantOverlays: z.enum(["SUPPORTED", "NOT_CONFIGURED"]).optional(),
  }),
  disclaimer: z.string().min(1),
});

const activateLaborPolicyVersionBodySchema = z.object({
  supersedesPolicyVersionId: z.string().uuid(),
});

const STEP_UP_MAX_AGE_MS = 15 * 60 * 1000;

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

function parseIfMatchRevision(raw: string | string[] | undefined): number {
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

function millisOf(value: Date | null | undefined): number {
  return value?.getTime() ?? 0;
}

function errorMessageOf(err: unknown): string {
  return err instanceof Error
    ? err.message
    : typeof err === "object" && err !== null && "message" in err && typeof (err as { message?: unknown }).message === "string"
      ? (err as { message: string }).message
      : "";
}

function canReadSensitiveWorkforce(ctx: Awaited<ReturnType<typeof requireTenantContext>>): boolean {
  return hasContextPermission(ctx, "time:read_sensitive");
}

function canReadOwnTime(ctx: Awaited<ReturnType<typeof requireTenantContext>>): boolean {
  return hasContextPermission(ctx, "time:read_own");
}

function canReadOwnWorkShifts(ctx: Awaited<ReturnType<typeof requireTenantContext>>): boolean {
  return hasContextPermission(ctx, "workshift:read_own");
}

function requireWorkshiftPlanPermission(ctx: Awaited<ReturnType<typeof requireTenantContext>>): void {
  if (!hasContextPermission(ctx, "workshift:plan")) {
    throw insufficientScope();
  }
}

function requireWorkshiftAssignPermission(ctx: Awaited<ReturnType<typeof requireTenantContext>>): void {
  if (!hasContextPermission(ctx, "workshift:assign")) {
    throw insufficientScope();
  }
}

function requireTimeClockPermission(ctx: Awaited<ReturnType<typeof requireTenantContext>>): void {
  if (!hasContextPermission(ctx, "time:clock")) {
    throw insufficientScope();
  }
}

function requireTimeAdjustRequestPermission(ctx: Awaited<ReturnType<typeof requireTenantContext>>): void {
  if (!hasContextPermission(ctx, "time:adjust_request")) {
    throw insufficientScope();
  }
}

function requireTimeAdjustApprovePermission(ctx: Awaited<ReturnType<typeof requireTenantContext>>): void {
  if (!hasContextPermission(ctx, "time:adjust_approve")) {
    throw insufficientScope();
  }
}

function requireTimeExportPermission(ctx: Awaited<ReturnType<typeof requireTenantContext>>): void {
  if (!hasContextPermission(ctx, "time:export")) {
    throw insufficientScope();
  }
}

function requireLaborPolicyReviewPermission(
  ctx: Awaited<ReturnType<typeof requireTenantContext>>,
): void {
  if (!hasContextPermission(ctx, "labor_policy:review")) {
    throw insufficientScope();
  }
}

function requireLaborPolicyManagePermission(
  ctx: Awaited<ReturnType<typeof requireTenantContext>>,
): void {
  if (!hasContextPermission(ctx, "labor_policy:manage")) {
    throw insufficientScope();
  }
}

async function requireLaborPolicyBranchAccess(
  container: Container,
  ctx: Awaited<ReturnType<typeof requireTenantContext>>,
  branchId: string,
  correlationId: string,
  reply: Parameters<typeof sendProblem>[0],
): Promise<boolean> {
  if (ctx.branchScopeType !== "ALL_BRANCHES" && !ctx.branchIds.includes(branchId)) {
    sendProblem(reply, correlationId, notFound("Branch"));
    return false;
  }
  const branch = await container.branches.findById(ctx.tenantId, branchId);
  if (!branch) {
    sendProblem(reply, correlationId, notFound("Branch"));
    return false;
  }
  return true;
}

function requireTimeSensitiveReadPermission(
  ctx: Awaited<ReturnType<typeof requireTenantContext>>,
): void {
  if (!canReadSensitiveWorkforce(ctx)) {
    throw insufficientScope();
  }
}

function requireWorkshiftSupervisorReadPermission(
  ctx: Awaited<ReturnType<typeof requireTenantContext>>,
): void {
  if (!hasContextPermission(ctx, "workshift:plan") && !hasContextPermission(ctx, "workshift:assign")) {
    throw insufficientScope();
  }
}

async function requireTimeEntryReadAccess(
  container: Container,
  ctx: Awaited<ReturnType<typeof requireTenantContext>>,
  timeEntry: { employmentId: string; branchId: string },
): Promise<"sensitive" | "own"> {
  if (canReadSensitiveWorkforce(ctx)) {
    if (ctx.branchScopeType === "ALL_BRANCHES" || ctx.branchIds.includes(timeEntry.branchId)) {
      return "sensitive";
    }
    throw notFound("TimeEntry");
  }

  if (!canReadOwnTime(ctx)) {
    throw insufficientScope();
  }

  const employment = await container.employments!.findById(ctx.tenantId, timeEntry.employmentId);
  if (!employment || employment.personRef !== ctx.externalIdentityId) {
    throw notFound("TimeEntry");
  }
  return "own";
}

async function requireEmploymentReadAccess(
  container: Container,
  ctx: Awaited<ReturnType<typeof requireTenantContext>>,
  employment: { id: string; personRef: string; eligibleBranchIds: string[] },
): Promise<"sensitive" | "own"> {
  if (canReadSensitiveWorkforce(ctx)) {
    if (
      ctx.branchScopeType === "ALL_BRANCHES" ||
      employment.eligibleBranchIds.some((branchId) => ctx.branchIds.includes(branchId))
    ) {
      return "sensitive";
    }
    throw notFound("Employment");
  }

  if (!canReadOwnTime(ctx)) {
    throw insufficientScope();
  }

  if (employment.personRef !== ctx.externalIdentityId) {
    throw notFound("Employment");
  }
  return "own";
}

async function requireShiftAssignmentReadAccess(
  container: Container,
  ctx: Awaited<ReturnType<typeof requireTenantContext>>,
  assignment: { branchId: string; employmentId: string },
): Promise<"sensitive" | "own"> {
  if (canReadSensitiveWorkforce(ctx)) {
    if (ctx.branchScopeType === "ALL_BRANCHES" || ctx.branchIds.includes(assignment.branchId)) {
      return "sensitive";
    }
    throw notFound("ShiftAssignment");
  }

  if (!canReadOwnWorkShifts(ctx)) {
    throw insufficientScope();
  }

  const employment = await container.employments!.findById(ctx.tenantId, assignment.employmentId);
  if (!employment || employment.personRef !== ctx.externalIdentityId) {
    throw notFound("ShiftAssignment");
  }
  return "own";
}

function redactTimeAdjustmentForOwnAccess<T extends {
  requesterId?: string | null;
  approverId?: string | null;
  evidence?: string | null;
}>(adjustment: T): Omit<T, "requesterId" | "approverId" | "evidence"> {
  const { requesterId: _requesterId, approverId: _approverId, evidence: _evidence, ...rest } = adjustment;
  return rest;
}

function requireBranchScopedSupervisorRead(
  ctx: Awaited<ReturnType<typeof requireTenantContext>>,
  branchId: string,
  resource: "Branch" | "WorkShift" | "ShiftAssignment" = "Branch",
): void {
  if (ctx.branchScopeType !== "ALL_BRANCHES" && !ctx.branchIds.includes(branchId)) {
    throw notFound(resource);
  }
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

function requireBranchScopedSupervisorManage(
  ctx: Awaited<ReturnType<typeof requireTenantContext>>,
  branchId: string,
  resource: "Branch" | "WorkShift" | "ShiftAssignment" | "TimeEntry" | "TimeAdjustment" = "Branch",
): void {
  if (ctx.branchScopeType !== "ALL_BRANCHES" && !ctx.branchIds.includes(branchId)) {
    throw notFound(resource);
  }
}

function intersectsBranchScope(
  ctx: Awaited<ReturnType<typeof requireTenantContext>>,
  branchIds: string[],
): boolean {
  return ctx.branchScopeType === "ALL_BRANCHES" || branchIds.some((branchId) => ctx.branchIds.includes(branchId));
}

function workforceEnabled(container: Container): boolean {
  return Boolean(
    container.employments &&
      container.workShifts &&
      container.shiftAssignments &&
      container.timeEntries &&
      container.timeAdjustments,
  );
}

export async function registerWorkforceRoutes(
  app: FastifyInstance,
  container: Container,
): Promise<void> {
  if (!workforceEnabled(container)) return;

  app.post("/v1/employments", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requireWorkshiftPlanPermission(ctx);
      const body = createEmploymentBodySchema.parse(req.body);
      if (
        ctx.branchScopeType !== "ALL_BRANCHES" &&
        body.eligibleBranchIds.some((branchId) => !ctx.branchIds.includes(branchId))
      ) {
        return sendProblem(reply, correlationId, notFound("Branch"));
      }
      const employment = await createEmployment(
        { employments: container.employments! },
        { tenantId: ctx.tenantId, ...omitUndefined(body) },
      );
      reply.code(201);
      return { data: employment };
    } catch (err) {
      if (err instanceof DuplicateEmployeeCodeError) {
        return sendProblem(reply, correlationId, conflict(err.message));
      }
      if (err instanceof z.ZodError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{
    Querystring: { status?: string; order?: string; limit?: string; offset?: string };
  }>("/v1/employments", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requireTimeSensitiveReadPermission(ctx);
      const query = listEmploymentsQuerySchema.parse(req.query);
      const order = query.order ?? "employeeCode.asc";
      const limit = parsePositiveInt(query.limit, "limit");
      const offset = parseNonNegativeInt(query.offset, "offset") ?? 0;
      let employments = await container.employments!.listByTenant(ctx.tenantId);
      employments = employments.filter((employment) =>
        intersectsBranchScope(ctx, employment.eligibleBranchIds),
      );
      if (query.status) {
        employments = employments.filter((employment) => employment.status === query.status);
      }
      employments = employments.sort((a, b) => {
        switch (order) {
          case "employeeCode.asc":
            return a.employeeCode.localeCompare(b.employeeCode);
          case "employeeCode.desc":
            return b.employeeCode.localeCompare(a.employeeCode);
          case "createdAt.asc":
            return a.createdAt.getTime() - b.createdAt.getTime();
          case "createdAt.desc":
            return b.createdAt.getTime() - a.createdAt.getTime();
        }
      });
      const total = employments.length;
      const paged = employments.slice(offset, limit ? offset + limit : undefined);
      return {
        data: paged,
        page: { total, limit: limit ?? total, offset },
      };
    } catch (err) {
      if (err instanceof InvalidWorkShiftIntervalError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      if (err instanceof z.ZodError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{ Params: { id: string } }>("/v1/employments/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      const employment = await container.employments!.findById(ctx.tenantId, req.params.id);
      if (!employment) return sendProblem(reply, correlationId, notFound("Employment"));
      await requireEmploymentReadAccess(container, ctx, employment);
      return { data: employment };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{
    Params: { branchId: string };
    Querystring: { status?: string; order?: string; limit?: string; offset?: string };
  }>("/v1/branches/:branchId/employments", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requireTimeSensitiveReadPermission(ctx);
      if (ctx.branchScopeType !== "ALL_BRANCHES" && !ctx.branchIds.includes(req.params.branchId)) {
        return sendProblem(reply, correlationId, notFound("Branch"));
      }
      const query = listBranchEmploymentsQuerySchema.parse(req.query);
      const order = query.order ?? "employeeCode.asc";
      const limit = parsePositiveInt(query.limit, "limit");
      const offset = parseNonNegativeInt(query.offset, "offset") ?? 0;
      let employments = await container.employments!.listByTenant(ctx.tenantId);
      employments = employments.filter((employment) =>
        employment.eligibleBranchIds.includes(req.params.branchId),
      );
      if (query.status) {
        employments = employments.filter((employment) => employment.status === query.status);
      }
      employments = employments.sort((a, b) => {
        switch (order) {
          case "employeeCode.asc":
            return a.employeeCode.localeCompare(b.employeeCode);
          case "employeeCode.desc":
            return b.employeeCode.localeCompare(a.employeeCode);
          case "createdAt.asc":
            return a.createdAt.getTime() - b.createdAt.getTime();
          case "createdAt.desc":
            return b.createdAt.getTime() - a.createdAt.getTime();
        }
      });
      const total = employments.length;
      const paged = employments.slice(offset, limit ? offset + limit : undefined);
      return {
        data: paged,
        page: { total, limit: limit ?? total, offset },
      };
    } catch (err) {
      if (err instanceof z.ZodError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { branchId: string } }>("/v1/branches/:branchId/work-shifts", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requireWorkshiftPlanPermission(ctx);
      requireBranchScopedSupervisorManage(ctx, req.params.branchId, "Branch");
      const body = createWorkShiftBodySchema.parse(req.body);
      const shift = await createWorkShift(
        { workShifts: container.workShifts! },
        { tenantId: ctx.tenantId, branchId: req.params.branchId, ...omitUndefined(body) },
      );
      reply.code(201);
      return { data: shift };
    } catch (err) {
      if (err instanceof InvalidWorkShiftIntervalError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      if (err instanceof z.ZodError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{
    Params: { branchId: string };
    Querystring: { status?: string; order?: string; limit?: string; offset?: string };
  }>("/v1/branches/:branchId/work-shifts", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requireTimeSensitiveReadPermission(ctx);
      if (ctx.branchScopeType !== "ALL_BRANCHES" && !ctx.branchIds.includes(req.params.branchId)) {
        return sendProblem(reply, correlationId, notFound("Branch"));
      }
      const query = listWorkShiftsQuerySchema.parse(req.query);
      const order = query.order ?? "startsAtUtc.asc";
      const limit = parsePositiveInt(query.limit, "limit");
      const offset = parseNonNegativeInt(query.offset, "offset") ?? 0;
      let shifts = await container.workShifts!.listByBranch(ctx.tenantId, req.params.branchId);
      if (query.status) {
        shifts = shifts.filter((shift) => shift.status === query.status);
      }
      shifts = shifts.sort((a, b) => {
        switch (order) {
          case "startsAtUtc.asc":
            return a.startsAtUtc.getTime() - b.startsAtUtc.getTime();
          case "startsAtUtc.desc":
            return b.startsAtUtc.getTime() - a.startsAtUtc.getTime();
          case "businessDate.asc":
            return a.businessDate.localeCompare(b.businessDate);
          case "businessDate.desc":
            return b.businessDate.localeCompare(a.businessDate);
        }
      });
      const total = shifts.length;
      const paged = shifts.slice(offset, limit ? offset + limit : undefined);
      return {
        data: paged,
        page: { total, limit: limit ?? total, offset },
      };
    } catch (err) {
      if (err instanceof z.ZodError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{
    Params: { branchId: string };
    Querystring: {
      status?: "OPEN" | "CLOSED";
      pendingReview?: "true" | "false";
      from?: string;
      to?: string;
      order?: "capturedAt.asc" | "capturedAt.desc";
      limit?: string;
      offset?: string;
    };
  }>("/v1/branches/:branchId/time-entries", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requireTimeSensitiveReadPermission(ctx);
      if (ctx.branchScopeType !== "ALL_BRANCHES" && !ctx.branchIds.includes(req.params.branchId)) {
        return sendProblem(reply, correlationId, notFound("Branch"));
      }
      const status = req.query?.status;
      const pendingReviewRaw = req.query?.pendingReview;
      const fromRaw = req.query?.from;
      const toRaw = req.query?.to;
      const order = req.query?.order ?? "capturedAt.desc";
      const limit = parsePositiveInt(req.query?.limit, "limit");
      const offset = parseNonNegativeInt(req.query?.offset, "offset") ?? 0;
      if (
        status !== undefined &&
        status !== "OPEN" &&
        status !== "CLOSED"
      ) {
        return sendProblem(reply, correlationId, badRequest("Invalid status"));
      }
      if (
        pendingReviewRaw !== undefined &&
        pendingReviewRaw !== "true" &&
        pendingReviewRaw !== "false"
      ) {
        return sendProblem(reply, correlationId, badRequest("Invalid pendingReview"));
      }
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
      if (order !== "capturedAt.asc" && order !== "capturedAt.desc") {
        return sendProblem(reply, correlationId, badRequest("Invalid order"));
      }
      let entries = await container.timeEntries!.listByBranch(ctx.tenantId, req.params.branchId);
      if (status) entries = entries.filter((entry) => entry.status === status);
      if (pendingReviewRaw !== undefined) {
        const pendingReview = pendingReviewRaw === "true";
        entries = entries.filter((entry) => entry.pendingReview === pendingReview);
      }
      if (from) {
        entries = entries.filter((entry) => entry.capturedAt.getTime() >= from.getTime());
      }
      if (to) {
        entries = entries.filter((entry) => entry.capturedAt.getTime() <= to.getTime());
      }
      entries = entries.sort((a, b) =>
        order === "capturedAt.asc"
          ? a.capturedAt.getTime() - b.capturedAt.getTime()
          : b.capturedAt.getTime() - a.capturedAt.getTime(),
      );
      const total = entries.length;
      const paged = entries.slice(offset, limit ? offset + limit : undefined);
      return {
        data: paged,
        page: {
          total,
          limit: limit ?? total,
          offset,
        },
      };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{ Params: { branchId: string } }>(
    "/v1/branches/:branchId/workforce-summary",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requireTimeSensitiveReadPermission(ctx);
        if (ctx.branchScopeType !== "ALL_BRANCHES" && !ctx.branchIds.includes(req.params.branchId)) {
          return sendProblem(reply, correlationId, notFound("Branch"));
        }
        const entries = await container.timeEntries!.listByBranch(ctx.tenantId, req.params.branchId);
        const openEntries = entries.filter((entry) => entry.status === "OPEN");
        const pendingReviewEntries = entries.filter((entry) => entry.pendingReview);
        const nestedBreaks = await Promise.all(
          entries.map((entry) => container.breakLogs!.listByTimeEntry(ctx.tenantId, entry.id)),
        );
        const breaks = nestedBreaks.flat();
        const openBreaks = breaks.filter((log) => log.status === "OPEN");
        return {
          data: {
            branchId: req.params.branchId,
            openTimeEntriesCount: openEntries.length,
            pendingReviewTimeEntriesCount: pendingReviewEntries.length,
            openBreaksCount: openBreaks.length,
          },
        };
      } catch (err) {
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.get<{ Params: { id: string } }>("/v1/work-shifts/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requireWorkshiftSupervisorReadPermission(ctx);
      const shift = await container.workShifts!.findById(ctx.tenantId, req.params.id);
      if (!shift) return sendProblem(reply, correlationId, notFound("WorkShift"));
      requireBranchScopedSupervisorRead(ctx, shift.branchId, "WorkShift");
      return { data: shift };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{
    Params: { branchId: string };
    Querystring: { status?: string; order?: string; limit?: string; offset?: string };
  }>("/v1/branches/:branchId/shift-assignments", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requireWorkshiftSupervisorReadPermission(ctx);
      if (ctx.branchScopeType !== "ALL_BRANCHES" && !ctx.branchIds.includes(req.params.branchId)) {
        return sendProblem(reply, correlationId, notFound("Branch"));
      }
      const query = listBranchAssignmentsQuerySchema.parse(req.query);
      const order = query.order ?? "createdAt.asc";
      const limit = parsePositiveInt(query.limit, "limit");
      const offset = parseNonNegativeInt(query.offset, "offset") ?? 0;
      const shifts = await container.workShifts!.listByBranch(ctx.tenantId, req.params.branchId);
      const nested = await Promise.all(
        shifts.map((shift) => container.shiftAssignments!.listByShift(ctx.tenantId, shift.id)),
      );
      let assignments = nested.flat();
      if (query.status) {
        assignments = assignments.filter((assignment) => assignment.status === query.status);
      }
      assignments = assignments.sort((a, b) => {
        switch (order) {
          case "createdAt.asc":
            return a.createdAt.getTime() - b.createdAt.getTime();
          case "createdAt.desc":
            return b.createdAt.getTime() - a.createdAt.getTime();
          case "roleCode.asc":
            return a.roleCode.localeCompare(b.roleCode);
          case "roleCode.desc":
            return b.roleCode.localeCompare(a.roleCode);
        }
      });
      const total = assignments.length;
      const paged = assignments.slice(offset, limit ? offset + limit : undefined);
      return {
        data: paged,
        page: { total, limit: limit ?? total, offset },
      };
    } catch (err) {
      if (err instanceof z.ZodError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      return sendProblem(reply, correlationId, err);
    }
  });

  for (const [path, action] of [
    ["publish", publishWorkShift],
    ["start", startWorkShift],
    ["complete", completeWorkShift],
    ["cancel", cancelWorkShift],
  ] as const) {
    app.post<{ Params: { id: string } }>(`/v1/work-shifts/:id/${path}`, async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requireWorkshiftPlanPermission(ctx);
        const existing = await container.workShifts!.findById(ctx.tenantId, req.params.id);
        if (!existing) return sendProblem(reply, correlationId, notFound("WorkShift"));
        const expectedRevision = parseIfMatchRevision(req.headers["if-match"]);
        if (existing.revision !== expectedRevision) {
          return sendProblem(
            reply,
            correlationId,
            conflict(
              `WorkShift ${existing.id} revision mismatch: expected ${expectedRevision}, actual ${existing.revision}`,
            ),
          );
        }
        requireBranchScopedSupervisorManage(ctx, existing.branchId, "WorkShift");
        const deps =
          path === "start" || path === "complete"
            ? { workShifts: container.workShifts!, outbox: container.outbox }
            : { workShifts: container.workShifts! };
        const shift = await action(deps, ctx.tenantId, req.params.id);
        return { data: shift };
      } catch (err) {
        if (err instanceof ActiveWorkShiftConflictError || err instanceof InvalidWorkShiftTransitionError) {
          return sendProblem(reply, correlationId, conflict(err.message));
        }
        if (err instanceof Error && err.message.includes("not found")) {
          return sendProblem(reply, correlationId, notFound("WorkShift"));
        }
        return sendProblem(reply, correlationId, err);
      }
    });
  }

  app.post<{ Params: { workShiftId: string } }>(
    "/v1/work-shifts/:workShiftId/assignments",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requireWorkshiftAssignPermission(ctx);
        const workShift = await container.workShifts!.findById(ctx.tenantId, req.params.workShiftId);
        if (!workShift) return sendProblem(reply, correlationId, notFound("WorkShift"));
        requireBranchScopedSupervisorManage(ctx, workShift.branchId, "WorkShift");
        const body = createShiftAssignmentBodySchema.parse(req.body);
        const commandId = parseOptionalIdempotencyKey(req.headers["idempotency-key"]);
        const assignment = await createShiftAssignment(
          {
            employments: container.employments!,
            workShifts: container.workShifts!,
            shiftAssignments: container.shiftAssignments!,
            outbox: container.outbox,
          },
          {
            tenantId: ctx.tenantId,
            workShiftId: req.params.workShiftId,
            ...omitUndefined(body),
            ...(commandId ? { commandId } : {}),
          },
        );
        reply.code(201);
        return { data: assignment };
      } catch (err) {
        const errorMessage = errorMessageOf(err);
        if (err instanceof DuplicateShiftAssignmentError) {
          return sendProblem(reply, correlationId, conflict(err.message));
        }
        if (err instanceof InvalidTimeAdjustmentError) {
          return sendProblem(reply, correlationId, badRequest(err.message));
        }
        if (err instanceof z.ZodError) {
          return sendProblem(reply, correlationId, badRequest(err.message));
        }
        if (errorMessage.includes("not found")) {
          if (errorMessage.includes("Employment")) {
            return sendProblem(reply, correlationId, notFound("Employment"));
          }
          if (errorMessage.includes("WorkShift")) {
            return sendProblem(reply, correlationId, notFound("WorkShift"));
          }
        }
        if (errorMessage.includes("is not active") || errorMessage.includes("is not eligible")) {
          return sendProblem(reply, correlationId, conflict(errorMessage));
        }
        if (errorMessage.includes("is not assignable")) {
          return sendProblem(reply, correlationId, conflict(errorMessage));
        }
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.get<{
    Params: { workShiftId: string };
    Querystring: { status?: string; order?: string; limit?: string; offset?: string };
  }>(
    "/v1/work-shifts/:workShiftId/assignments",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        const shift = await container.workShifts!.findById(ctx.tenantId, req.params.workShiftId);
        if (!shift) return sendProblem(reply, correlationId, notFound("WorkShift"));
        const query = listAssignmentsQuerySchema.parse(req.query);
        const order = query.order ?? "createdAt.asc";
        const limit = parsePositiveInt(query.limit, "limit");
        const offset = parseNonNegativeInt(query.offset, "offset") ?? 0;
        let assignments = await container.shiftAssignments!.listByShift(
          ctx.tenantId,
          req.params.workShiftId,
        );
        if (canReadSensitiveWorkforce(ctx)) {
          requireBranchScopedSupervisorRead(ctx, shift.branchId, "WorkShift");
        } else {
          if (!canReadOwnWorkShifts(ctx)) {
            throw insufficientScope();
          }
          const ownEmployments = await container.employments!.listByTenant(ctx.tenantId);
          const ownEmploymentIds = new Set(
            ownEmployments
              .filter((employment) => employment.personRef === ctx.externalIdentityId)
              .map((employment) => employment.id),
          );
          assignments = assignments.filter((assignment) => ownEmploymentIds.has(assignment.employmentId));
        }
        if (query.status) {
          assignments = assignments.filter((assignment) => assignment.status === query.status);
        }
        assignments = assignments.sort((a, b) => {
          switch (order) {
            case "createdAt.asc":
              return a.createdAt.getTime() - b.createdAt.getTime();
            case "createdAt.desc":
              return b.createdAt.getTime() - a.createdAt.getTime();
            case "roleCode.asc":
              return a.roleCode.localeCompare(b.roleCode);
            case "roleCode.desc":
              return b.roleCode.localeCompare(a.roleCode);
          }
        });
        const total = assignments.length;
        const paged = assignments.slice(offset, limit ? offset + limit : undefined);
        return {
          data: paged,
          page: { total, limit: limit ?? total, offset },
        };
      } catch (err) {
        if (err instanceof z.ZodError) {
          return sendProblem(reply, correlationId, badRequest(err.message));
        }
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.get<{ Params: { id: string } }>("/v1/shift-assignments/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      const assignment = await container.shiftAssignments!.findById(ctx.tenantId, req.params.id);
      if (!assignment) return sendProblem(reply, correlationId, notFound("ShiftAssignment"));
      await requireShiftAssignmentReadAccess(container, ctx, assignment);
      return { data: assignment };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/shift-assignments/:id/confirm", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requireWorkshiftAssignPermission(ctx);
      const existing = await container.shiftAssignments!.findById(ctx.tenantId, req.params.id);
      if (!existing) return sendProblem(reply, correlationId, notFound("ShiftAssignment"));
      requireBranchScopedSupervisorManage(ctx, existing.branchId, "ShiftAssignment");
      const expectedRevision = parseIfMatchRevision(req.headers["if-match"]);
      if (existing.revision !== expectedRevision) {
        return sendProblem(
          reply,
          correlationId,
          conflict(`ShiftAssignment ${existing.id} revision mismatch: expected ${expectedRevision}, actual ${existing.revision}`),
        );
      }
      const assignment = await confirmShiftAssignment(
        {
          employments: container.employments!,
          workShifts: container.workShifts!,
          shiftAssignments: container.shiftAssignments!,
          outbox: container.outbox,
        },
        ctx.tenantId,
        req.params.id,
        parseOptionalIdempotencyKey(req.headers["idempotency-key"]),
      );
      return { data: assignment };
    } catch (err) {
      if (err instanceof InvalidShiftAssignmentTransitionError) {
        return sendProblem(reply, correlationId, conflict(err.message));
      }
      if (err instanceof Error && err.message.includes("not found")) {
        return sendProblem(reply, correlationId, notFound("ShiftAssignment"));
      }
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/shift-assignments/:id/decline", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requireWorkshiftAssignPermission(ctx);
      const body = assignmentReasonBodySchema.parse(req.body);
      const previous = await container.shiftAssignments!.findById(ctx.tenantId, req.params.id);
      if (!previous) return sendProblem(reply, correlationId, notFound("ShiftAssignment"));
      requireBranchScopedSupervisorManage(ctx, previous.branchId, "ShiftAssignment");
      const expectedRevision = parseIfMatchRevision(req.headers["if-match"]);
      if (previous.revision !== expectedRevision) {
        return sendProblem(
          reply,
          correlationId,
          conflict(`ShiftAssignment ${previous.id} revision mismatch: expected ${expectedRevision}, actual ${previous.revision}`),
        );
      }
      const assignment = await declineShiftAssignment(
        {
          employments: container.employments!,
          workShifts: container.workShifts!,
          shiftAssignments: container.shiftAssignments!,
          outbox: container.outbox,
        },
        ctx.tenantId,
        req.params.id,
        parseOptionalIdempotencyKey(req.headers["idempotency-key"]),
      );
      await recordAuditLog(
        { auditLogs: container.auditLogs },
        {
          tenantId: ctx.tenantId,
          actorType: "USER",
          actorId: ctx.userId,
          action: "UPDATE",
          resourceType: "SHIFT_ASSIGNMENT",
          resourceId: assignment.id,
          previousState: previous,
          newState: { ...assignment, mutationReason: body.reason, mutationType: "DECLINE" },
          correlationId,
        },
      );
      return { data: assignment };
    } catch (err) {
      if (err instanceof InvalidShiftAssignmentTransitionError) {
        return sendProblem(reply, correlationId, conflict(err.message));
      }
      if (err instanceof z.ZodError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      if (err instanceof Error && err.message.includes("not found")) {
        return sendProblem(reply, correlationId, notFound("ShiftAssignment"));
      }
      if (err instanceof Error && err.message.includes("is not assignable")) {
        return sendProblem(reply, correlationId, conflict(err.message));
      }
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/shift-assignments/:id/cancel", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requireWorkshiftAssignPermission(ctx);
      const body = assignmentReasonBodySchema.parse(req.body);
      const previous = await container.shiftAssignments!.findById(ctx.tenantId, req.params.id);
      if (!previous) return sendProblem(reply, correlationId, notFound("ShiftAssignment"));
      requireBranchScopedSupervisorManage(ctx, previous.branchId, "ShiftAssignment");
      const expectedRevision = parseIfMatchRevision(req.headers["if-match"]);
      if (previous.revision !== expectedRevision) {
        return sendProblem(
          reply,
          correlationId,
          conflict(`ShiftAssignment ${previous.id} revision mismatch: expected ${expectedRevision}, actual ${previous.revision}`),
        );
      }
      const assignment = await cancelShiftAssignment(
        {
          employments: container.employments!,
          workShifts: container.workShifts!,
          shiftAssignments: container.shiftAssignments!,
          outbox: container.outbox,
        },
        ctx.tenantId,
        req.params.id,
        parseOptionalIdempotencyKey(req.headers["idempotency-key"]),
      );
      await recordAuditLog(
        { auditLogs: container.auditLogs },
        {
          tenantId: ctx.tenantId,
          actorType: "USER",
          actorId: ctx.userId,
          action: "UPDATE",
          resourceType: "SHIFT_ASSIGNMENT",
          resourceId: assignment.id,
          previousState: previous,
          newState: { ...assignment, mutationReason: body.reason, mutationType: "CANCEL" },
          correlationId,
        },
      );
      return { data: assignment };
    } catch (err) {
      if (err instanceof InvalidShiftAssignmentTransitionError) {
        return sendProblem(reply, correlationId, conflict(err.message));
      }
      if (err instanceof z.ZodError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      if (err instanceof Error && err.message.includes("not found")) {
        return sendProblem(reply, correlationId, notFound("ShiftAssignment"));
      }
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { id: string } }>(
    "/v1/shift-assignments/:id/reassign",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requireWorkshiftAssignPermission(ctx);
        const existing = await container.shiftAssignments!.findById(ctx.tenantId, req.params.id);
        if (!existing) return sendProblem(reply, correlationId, notFound("ShiftAssignment"));
        requireBranchScopedSupervisorManage(ctx, existing.branchId, "ShiftAssignment");
        const expectedRevision = parseIfMatchRevision(req.headers["if-match"]);
        if (existing.revision !== expectedRevision) {
          return sendProblem(
            reply,
            correlationId,
            conflict(`ShiftAssignment ${existing.id} revision mismatch: expected ${expectedRevision}, actual ${existing.revision}`),
          );
        }
        const body = reassignShiftAssignmentBodySchema.parse(req.body);
        const commandId = parseOptionalIdempotencyKey(req.headers["idempotency-key"]);
        const result = await reassignShiftAssignment(
          {
            employments: container.employments!,
            workShifts: container.workShifts!,
            shiftAssignments: container.shiftAssignments!,
            outbox: container.outbox,
          },
          {
            tenantId: ctx.tenantId,
            assignmentId: req.params.id,
            ...omitUndefined(body),
            ...(commandId ? { commandId } : {}),
          },
        );
        await recordAuditLog(
          { auditLogs: container.auditLogs },
          {
            tenantId: ctx.tenantId,
            actorType: "USER",
            actorId: ctx.userId,
            action: "UPDATE",
            resourceType: "SHIFT_ASSIGNMENT",
            resourceId: result.previous.id,
            previousState: result.previous,
            newState: {
              ...result.current,
              previousAssignmentId: result.previous.id,
              mutationReason: body.reason,
              mutationType: "REASSIGN",
            },
            correlationId,
          },
        );
        return { data: result };
      } catch (err) {
        const errorMessage = errorMessageOf(err);
        if (
          err instanceof InvalidShiftAssignmentTransitionError ||
          err instanceof DuplicateShiftAssignmentError
        ) {
          return sendProblem(reply, correlationId, conflict(err.message));
        }
        if (err instanceof z.ZodError) {
          return sendProblem(reply, correlationId, badRequest(err.message));
        }
        if (errorMessage.includes("not found")) {
          if (errorMessage.includes("Employment")) {
            return sendProblem(reply, correlationId, notFound("Employment"));
          }
          if (errorMessage.includes("WorkShift")) {
            return sendProblem(reply, correlationId, notFound("WorkShift"));
          }
          return sendProblem(reply, correlationId, notFound("ShiftAssignment"));
        }
        if (errorMessage.includes("is not active") || errorMessage.includes("is not eligible")) {
          return sendProblem(reply, correlationId, conflict(errorMessage));
        }
        if (errorMessage.includes("is not assignable")) {
          return sendProblem(reply, correlationId, conflict(errorMessage));
        }
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.post("/v1/time-entries/clock-in", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requireTimeClockPermission(ctx);
      const body = clockInBodySchema.parse(req.body);
      const employment = await container.employments!.findById(ctx.tenantId, body.employmentId);
      if (!employment) return sendProblem(reply, correlationId, notFound("Employment"));
      if (!intersectsBranchScope(ctx, employment.eligibleBranchIds)) {
        return sendProblem(reply, correlationId, notFound("Employment"));
      }
      requireBranchScopedSupervisorManage(ctx, body.branchId, "Branch");
      const receivedAt = container.now?.() ?? new Date();
      const entry = await clockIn(
        {
          employments: container.employments!,
          shiftAssignments: container.shiftAssignments!,
          timeEntries: container.timeEntries!,
          timeAdjustments: container.timeAdjustments!,
        },
        { tenantId: ctx.tenantId, ...omitUndefined(body), receivedAt },
      );
      reply.code(201);
      return { data: entry };
    } catch (err) {
      if (err instanceof OpenTimeEntryConflictError) {
        return sendProblem(reply, correlationId, conflict(err.message));
      }
      if (err instanceof z.ZodError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      if (err instanceof Error && err.message.includes("deviceSequence must be non-negative")) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      if (err instanceof Error && err.message.includes("not found")) {
        if (err.message.includes("Employment")) {
          return sendProblem(reply, correlationId, notFound("Employment"));
        }
        if (err.message.includes("ShiftAssignment")) {
          return sendProblem(reply, correlationId, notFound("ShiftAssignment"));
        }
      }
      if (
        err instanceof Error &&
        (
          err.message.includes("is not active") ||
          err.message.includes("is not eligible") ||
          err.message.includes("does not belong to employment") ||
          err.message.includes("does not belong to branch") ||
          err.message.includes("must be CONFIRMED to clock-in")
        )
      ) {
        return sendProblem(reply, correlationId, conflict(err.message));
      }
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post("/v1/time-entries/clock-out", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requireTimeClockPermission(ctx);
      const body = clockOutBodySchema.parse(req.body);
      const employment = await container.employments!.findById(ctx.tenantId, body.employmentId);
      if (!employment) return sendProblem(reply, correlationId, notFound("Employment"));
      if (!intersectsBranchScope(ctx, employment.eligibleBranchIds)) {
        return sendProblem(reply, correlationId, notFound("Employment"));
      }
      const receivedAt = container.now?.() ?? new Date();
      const openEntryBeforeClockOut = await container.timeEntries!.findOpenByEmployment(
        ctx.tenantId,
        body.employmentId,
      );
      if (openEntryBeforeClockOut) {
        requireBranchScopedSupervisorManage(ctx, openEntryBeforeClockOut.branchId, "TimeEntry");
      }
      const openBreakBeforeClockOut =
        openEntryBeforeClockOut && container.breakLogs
          ? await container.breakLogs.findOpenByTimeEntry(ctx.tenantId, openEntryBeforeClockOut.id)
          : null;
      const entry = await clockOut(
        {
          employments: container.employments!,
          shiftAssignments: container.shiftAssignments!,
          timeEntries: container.timeEntries!,
          timeAdjustments: container.timeAdjustments!,
          ...(container.breakLogs ? { breakLogs: container.breakLogs } : {}),
        },
        { tenantId: ctx.tenantId, ...omitUndefined(body), receivedAt },
      );
      if (
        openBreakBeforeClockOut &&
        resolveBreakClockOutPolicy(openBreakBeforeClockOut.laborPolicyVersion).mode === "AUTO_CLOSE"
      ) {
        const updatedBreakLog = await container.breakLogs!.findById(ctx.tenantId, openBreakBeforeClockOut.id);
        if (updatedBreakLog) {
          await recordAuditLog(
            { auditLogs: container.auditLogs },
            {
              tenantId: ctx.tenantId,
              actorType: "USER",
              actorId: ctx.userId,
              action: "UPDATE",
              resourceType: "BREAK_LOG",
              resourceId: updatedBreakLog.id,
              previousState: openBreakBeforeClockOut,
              newState: {
                ...updatedBreakLog,
                mutationType: "AUTO_CLOSE_ON_CLOCK_OUT",
                policyDecision: "AUTO_CLOSE_OPEN_BREAK_ON_CLOCK_OUT",
                laborPolicyVersion: updatedBreakLog.laborPolicyVersion,
                findingReasonCode: updatedBreakLog.findingReasonCode,
              },
              correlationId,
            },
          );
        }
      }
      return { data: entry };
    } catch (err) {
      if (err instanceof OpenBreakOnClockOutError) {
        return sendProblem(reply, correlationId, conflict(err.message));
      }
      if (err instanceof InvalidTimeEntryTransitionError) {
        return sendProblem(reply, correlationId, conflict(err.message));
      }
      if (err instanceof z.ZodError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      if (err instanceof Error && err.message.includes("OPEN TimeEntry not found")) {
        return sendProblem(reply, correlationId, notFound("TimeEntry"));
      }
      if (err instanceof Error && err.message.includes("not found")) {
        return sendProblem(reply, correlationId, notFound("TimeEntry"));
      }
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{
    Params: { branchId: string };
    Querystring: { version: string };
  }>("/v1/branches/:branchId/labor-policy", async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requireLaborPolicyReviewPermission(ctx);
        if (!(await requireLaborPolicyBranchAccess(container, ctx, req.params.branchId, correlationId, reply))) {
          return;
        }
      const query = laborPolicyMetadataQuerySchema.parse(req.query);
      if (query.version) {
        const storedPolicy = await container.laborPolicyVersions?.findById(ctx.tenantId, query.version);
        if (storedPolicy && storedPolicy.branchId === req.params.branchId) {
          return { data: storedPolicy };
        }
      } else {
        const policies =
          (await container.laborPolicyVersions?.listByBranch(ctx.tenantId, req.params.branchId)) ?? [];
        const effectivePolicy = resolveEffectiveLaborPolicyVersion(
          policies,
          query.effectiveAt ?? (container.now?.() ?? new Date()),
        );
        if (effectivePolicy) {
          return { data: effectivePolicy };
        }
      }
      const fallbackVersion = query.version ?? "fallback-labor-policy";
      const breakClockOutPolicy = resolveBreakClockOutPolicy(fallbackVersion);
      return {
        data: {
          versionId: fallbackVersion,
          branchId: req.params.branchId,
          jurisdictionCode: "NOT_CONFIGURED",
          sourceType: "INTERNAL_APPROVED_REFERENCE",
          coverageStatus: "PARTIAL",
          policyCapabilities: {
            breaks: {
              clockOutOpenBreak: {
                mode: breakClockOutPolicy.mode,
              },
            },
            dailyMaximums: "NOT_CONFIGURED",
            weeklyMaximums: "NOT_CONFIGURED",
            nightShift: "NOT_CONFIGURED",
            holidaysCalendar: "NOT_CONFIGURED",
            minors: "NOT_CONFIGURED",
            tenantOverlays: "NOT_CONFIGURED",
          },
          disclaimer:
            "Partial labor policy metadata only. Compliance evaluation remains NOT_CONFIGURED outside declared capabilities.",
        },
      };
    } catch (err) {
      if (err instanceof z.ZodError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { branchId: string } }>(
    "/v1/branches/:branchId/labor-policy-versions",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requireLaborPolicyManagePermission(ctx);
        if (!(await requireLaborPolicyBranchAccess(container, ctx, req.params.branchId, correlationId, reply))) {
          return;
        }
        if (!container.laborPolicyVersions) {
          throw new Error("LaborPolicyVersion repository not configured");
        }
        const body = createLaborPolicyVersionBodySchema.parse(req.body);
        const now = container.now?.() ?? new Date();
        const policyId = body.id ?? randomUUID();
        const existing = await container.laborPolicyVersions.findById(ctx.tenantId, policyId);
        if (existing) {
          return sendProblem(reply, correlationId, conflict(`LaborPolicyVersion ${policyId} already exists`));
        }
        if (body.supersedesPolicyVersionId) {
          const superseded = await container.laborPolicyVersions.findById(
            ctx.tenantId,
            body.supersedesPolicyVersionId,
          );
          if (!superseded || superseded.branchId !== req.params.branchId) {
            return sendProblem(reply, correlationId, notFound("LaborPolicyVersion"));
          }
          if (body.effectiveFrom.getTime() < superseded.effectiveFrom.getTime()) {
            return sendProblem(
              reply,
              correlationId,
              badRequest("effectiveFrom must be later than or equal to superseded policy effectiveFrom"),
            );
          }
        }
        const policy = {
          id: policyId,
          tenantId: ctx.tenantId,
          branchId: req.params.branchId,
          jurisdictionCode: body.jurisdictionCode,
          sourceType: body.sourceType,
          sourceRef: body.sourceRef,
          consultedAt: body.consultedAt,
          effectiveFrom: body.effectiveFrom,
          effectiveUntil: body.effectiveUntil ?? null,
          contentHash: body.contentHash,
          reviewerRef: body.reviewerRef,
          approvedAt: body.approvedAt,
          supersedesPolicyVersionId: body.supersedesPolicyVersionId ?? null,
          policyCapabilities: {
            ...(body.policyCapabilities.breaks
              ? {
                  breaks: {
                    ...(body.policyCapabilities.breaks.clockOutOpenBreak
                      ? {
                          clockOutOpenBreak: {
                            mode: body.policyCapabilities.breaks.clockOutOpenBreak.mode,
                          },
                        }
                      : {}),
                  },
                }
              : {}),
            ...(body.policyCapabilities.dailyMaximums
              ? { dailyMaximums: body.policyCapabilities.dailyMaximums }
              : {}),
            ...(body.policyCapabilities.weeklyMaximums
              ? { weeklyMaximums: body.policyCapabilities.weeklyMaximums }
              : {}),
            ...(body.policyCapabilities.nightShift ? { nightShift: body.policyCapabilities.nightShift } : {}),
            ...(body.policyCapabilities.holidaysCalendar
              ? { holidaysCalendar: body.policyCapabilities.holidaysCalendar }
              : {}),
            ...(body.policyCapabilities.minors ? { minors: body.policyCapabilities.minors } : {}),
            ...(body.policyCapabilities.tenantOverlays
              ? { tenantOverlays: body.policyCapabilities.tenantOverlays }
              : {}),
          },
          disclaimer: body.disclaimer,
          createdAt: now,
          updatedAt: now,
        };
        await container.laborPolicyVersions.save(policy);
        await recordAuditLog(
          { auditLogs: container.auditLogs, now: () => now },
          {
            tenantId: ctx.tenantId,
            actorType: "USER",
            actorId: ctx.userId,
            action: "CREATE",
            resourceType: "LABOR_POLICY_VERSION",
            resourceId: policy.id,
            newState: policy,
            correlationId,
          },
        );
        reply.code(201);
        return { data: policy };
      } catch (err) {
        if (err instanceof z.ZodError) {
          return sendProblem(reply, correlationId, badRequest(err.message));
        }
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.get<{ Params: { branchId: string } }>(
    "/v1/branches/:branchId/labor-policy-versions",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requireLaborPolicyReviewPermission(ctx);
        if (!(await requireLaborPolicyBranchAccess(container, ctx, req.params.branchId, correlationId, reply))) {
          return;
        }
        const items = (await container.laborPolicyVersions?.listByBranch(ctx.tenantId, req.params.branchId)) ?? [];
        return { data: items };
      } catch (err) {
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.post<{ Params: { id: string } }>(
    "/v1/labor-policy-versions/:id/activate",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requireLaborPolicyManagePermission(ctx);
        if (!container.laborPolicyVersions) {
          throw new Error("LaborPolicyVersion repository not configured");
        }
        const target = await container.laborPolicyVersions.findById(ctx.tenantId, req.params.id);
        if (!target) {
          return sendProblem(reply, correlationId, notFound("LaborPolicyVersion"));
        }
        if (!(await requireLaborPolicyBranchAccess(container, ctx, target.branchId, correlationId, reply))) {
          return;
        }
        const body = activateLaborPolicyVersionBodySchema.parse(req.body);
        const superseded = await container.laborPolicyVersions.findById(
          ctx.tenantId,
          body.supersedesPolicyVersionId,
        );
        if (!superseded || superseded.branchId !== target.branchId) {
          return sendProblem(reply, correlationId, notFound("LaborPolicyVersion"));
        }
        if (superseded.id === target.id) {
          return sendProblem(reply, correlationId, badRequest("A policy version cannot supersede itself"));
        }
        if (target.effectiveFrom.getTime() < superseded.effectiveFrom.getTime()) {
          return sendProblem(
            reply,
            correlationId,
            badRequest("Target policy effectiveFrom must be later than or equal to superseded policy effectiveFrom"),
          );
        }
        const now = container.now?.() ?? new Date();
        const updatedTarget = {
          ...target,
          supersedesPolicyVersionId: superseded.id,
          updatedAt: now,
        };
        const updatedSuperseded = {
          ...superseded,
          effectiveUntil: new Date(updatedTarget.effectiveFrom.getTime() - 1),
          updatedAt: now,
        };
        await container.laborPolicyVersions.save(updatedSuperseded);
        await container.laborPolicyVersions.save(updatedTarget);
        await recordAuditLog(
          { auditLogs: container.auditLogs, now: () => now },
          {
            tenantId: ctx.tenantId,
            actorType: "USER",
            actorId: ctx.userId,
            action: "UPDATE",
            resourceType: "LABOR_POLICY_VERSION",
            resourceId: updatedTarget.id,
            previousState: { target, superseded },
            newState: { target: updatedTarget, superseded: updatedSuperseded, mutationType: "ACTIVATE" },
            correlationId,
          },
        );
        return { data: updatedTarget };
      } catch (err) {
        if (err instanceof z.ZodError) {
          return sendProblem(reply, correlationId, badRequest(err.message));
        }
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.get<{ Params: { id: string } }>("/v1/time-entries/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      const entry = await container.timeEntries!.findById(ctx.tenantId, req.params.id);
      if (!entry) return sendProblem(reply, correlationId, notFound("TimeEntry"));
      await requireTimeEntryReadAccess(container, ctx, entry);
      return { data: entry };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{
    Params: { employmentId: string };
    Querystring: {
      status?: "OPEN" | "CLOSED";
      pendingReview?: "true" | "false";
      order?: string;
      limit?: string;
      offset?: string;
    };
  }>(
    "/v1/employments/:employmentId/time-entries",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        const employment = await container.employments!.findById(ctx.tenantId, req.params.employmentId);
        if (!employment) return sendProblem(reply, correlationId, notFound("Employment"));
        await requireEmploymentReadAccess(container, ctx, employment);
        const query = listEmploymentTimeEntriesQuerySchema.parse(req.query);
        const order = query.order ?? "capturedAt.desc";
        const limit = parsePositiveInt(query.limit, "limit");
        const offset = parseNonNegativeInt(query.offset, "offset") ?? 0;
        let entries = await container.timeEntries!.listByEmployment(
          ctx.tenantId,
          req.params.employmentId,
        );
        if (query.status) {
          entries = entries.filter((entry) => entry.status === query.status);
        }
        if (query.pendingReview !== undefined) {
          const pendingReview = query.pendingReview === "true";
          entries = entries.filter((entry) => entry.pendingReview === pendingReview);
        }
        entries = entries.sort((a, b) =>
          order === "capturedAt.asc"
            ? a.capturedAt.getTime() - b.capturedAt.getTime()
            : b.capturedAt.getTime() - a.capturedAt.getTime(),
        );
        const total = entries.length;
        const paged = entries.slice(offset, limit ? offset + limit : undefined);
        return {
          data: paged,
          page: { total, limit: limit ?? total, offset },
        };
      } catch (err) {
        if (err instanceof z.ZodError) {
          return sendProblem(reply, correlationId, badRequest(err.message));
        }
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.post<{ Params: { branchId: string } }>(
    "/v1/branches/:branchId/time-exports",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requireTimeExportPermission(ctx);
        if (!container.timeExportJobs) {
          throw new Error("TimeExportJob repository not configured");
        }
        if (ctx.branchScopeType !== "ALL_BRANCHES" && !ctx.branchIds.includes(req.params.branchId)) {
          return sendProblem(reply, correlationId, notFound("Branch"));
        }
        const branch = await container.branches.findById(ctx.tenantId, req.params.branchId);
        if (!branch) {
          return sendProblem(reply, correlationId, notFound("Branch"));
        }
        const body = requestTimeExportBodySchema.parse(req.body);
        if (body.from.getTime() > body.to.getTime()) {
          return sendProblem(reply, correlationId, badRequest("from must be earlier than or equal to to"));
        }
        const now = container.now?.() ?? new Date();
        const stepUpAt = requireRecentStepUp(ctx, req.headers["x-step-up-at"], now);
        const entries = await container.timeEntries!.listByBranch(ctx.tenantId, req.params.branchId);
        const scopedEntries = entries.filter((entry) => {
          const capturedAt = entry.effectiveCapturedAt ?? entry.capturedAt;
          return capturedAt.getTime() >= body.from.getTime() && capturedAt.getTime() <= body.to.getTime();
        });
        const exportId = randomUUID();
        const exportRequest: TimeExportJobRecord = {
          id: exportId,
          tenantId: ctx.tenantId,
          branchId: req.params.branchId,
          status: "REQUESTED",
          format: body.format ?? "CSV",
          from: body.from,
          to: body.to,
          reason: body.reason,
          requestedAt: now,
          stepUpAt,
          requestedByUserId: ctx.userId,
          manifest: {
            entryCountEstimate: scopedEntries.length,
            timeEntryIds: scopedEntries.map((entry) => entry.id),
          },
        };
        await container.timeExportJobs.save(exportRequest);
        await recordAuditLog(
          { auditLogs: container.auditLogs, now: () => now },
          {
            tenantId: ctx.tenantId,
            actorType: "USER",
            actorId: ctx.userId,
            action: "CREATE",
            resourceType: "TIME_EXPORT",
            resourceId: exportId,
            newState: exportRequest,
            correlationId,
          },
        );
        reply.code(202);
        return { data: exportRequest };
      } catch (err) {
        if (err instanceof z.ZodError) {
          return sendProblem(reply, correlationId, badRequest(err.message));
        }
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.get<{ Params: { branchId: string } }>(
    "/v1/branches/:branchId/time-exports",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requireTimeExportPermission(ctx);
        if (!container.timeExportJobs) {
          throw new Error("TimeExportJob repository not configured");
        }
        if (!(await requireLaborPolicyBranchAccess(container, ctx, req.params.branchId, correlationId, reply))) {
          return;
        }
        const jobs = await container.timeExportJobs.listByBranch(ctx.tenantId, req.params.branchId);
        return { data: jobs };
      } catch (err) {
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.get<{ Params: { id: string } }>(
    "/v1/time-exports/:id",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requireTimeExportPermission(ctx);
        if (!container.timeExportJobs) {
          throw new Error("TimeExportJob repository not configured");
        }
        const job = await container.timeExportJobs.findById(ctx.tenantId, req.params.id);
        if (!job) {
          return sendProblem(reply, correlationId, notFound("TimeExport"));
        }
        if (!(await requireLaborPolicyBranchAccess(container, ctx, job.branchId, correlationId, reply))) {
          return;
        }
        return { data: job };
      } catch (err) {
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.post<{ Params: { timeEntryId: string } }>(
    "/v1/time-entries/:timeEntryId/adjustments",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requireTimeAdjustRequestPermission(ctx);
        const timeEntry = await container.timeEntries!.findById(ctx.tenantId, req.params.timeEntryId);
        if (!timeEntry) return sendProblem(reply, correlationId, notFound("TimeEntry"));
        requireBranchScopedSupervisorManage(ctx, timeEntry.branchId, "TimeEntry");
        const body = requestTimeAdjustmentBodySchema.parse(req.body);
        const adjustment = await requestTimeAdjustment(
          {
            employments: container.employments!,
            shiftAssignments: container.shiftAssignments!,
            timeEntries: container.timeEntries!,
            timeAdjustments: container.timeAdjustments!,
          },
          { tenantId: ctx.tenantId, timeEntryId: req.params.timeEntryId, ...omitUndefined(body) },
        );
        reply.code(201);
        return { data: adjustment };
      } catch (err) {
        if (err instanceof InvalidTimeAdjustmentError) {
          return sendProblem(reply, correlationId, badRequest(err.message));
        }
        if (err instanceof z.ZodError) {
          return sendProblem(reply, correlationId, badRequest(err.message));
        }
        if (err instanceof Error && err.message.includes("not found")) {
          return sendProblem(reply, correlationId, notFound("TimeEntry"));
        }
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.get<{
    Params: { timeEntryId: string };
    Querystring: { status?: string; order?: string; limit?: string; offset?: string };
  }>(
    "/v1/time-entries/:timeEntryId/adjustments",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        const query = listTimeAdjustmentsQuerySchema.parse(req.query);
        const order = query.order ?? "createdAt.desc";
        const limit = parsePositiveInt(query.limit, "limit");
        const offset = parseNonNegativeInt(query.offset, "offset") ?? 0;
        let adjustments = await container.timeAdjustments!.listByTimeEntry(
          ctx.tenantId,
          req.params.timeEntryId,
        );
        const timeEntry = await container.timeEntries!.findById(ctx.tenantId, req.params.timeEntryId);
        if (!timeEntry) return sendProblem(reply, correlationId, notFound("TimeEntry"));
        const access = await requireTimeEntryReadAccess(container, ctx, timeEntry);
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
        const paged = adjustments.slice(offset, limit ? offset + limit : undefined);
        return {
          data: access === "own" ? paged.map((adjustment) => redactTimeAdjustmentForOwnAccess(adjustment)) : paged,
          page: { total, limit: limit ?? total, offset },
        };
      } catch (err) {
        if (err instanceof z.ZodError) {
          return sendProblem(reply, correlationId, badRequest(err.message));
        }
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.get<{ Params: { id: string } }>("/v1/time-adjustments/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      const adjustment = await container.timeAdjustments!.findById(ctx.tenantId, req.params.id);
      if (!adjustment) return sendProblem(reply, correlationId, notFound("TimeAdjustment"));
      const timeEntry = await container.timeEntries!.findById(ctx.tenantId, adjustment.timeEntryId);
      if (!timeEntry) return sendProblem(reply, correlationId, notFound("TimeEntry"));
      const access = await requireTimeEntryReadAccess(container, ctx, timeEntry);
      return { data: access === "own" ? redactTimeAdjustmentForOwnAccess(adjustment) : adjustment };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { id: string } }>(
    "/v1/time-adjustments/:id/approve",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requireTimeAdjustApprovePermission(ctx);
        const existingAdjustment = await container.timeAdjustments!.findById(ctx.tenantId, req.params.id);
        if (!existingAdjustment) return sendProblem(reply, correlationId, notFound("TimeAdjustment"));
        const timeEntry = await container.timeEntries!.findById(ctx.tenantId, existingAdjustment.timeEntryId);
        if (!timeEntry) return sendProblem(reply, correlationId, notFound("TimeEntry"));
        requireBranchScopedSupervisorManage(ctx, timeEntry.branchId, "TimeAdjustment");
        const body = decideTimeAdjustmentBodySchema.parse(req.body);
        const adjustment = await approveRequestedTimeAdjustment(
          {
            employments: container.employments!,
            shiftAssignments: container.shiftAssignments!,
            timeEntries: container.timeEntries!,
            timeAdjustments: container.timeAdjustments!,
          },
          ctx.tenantId,
          req.params.id,
          body.approverId,
          body.commandId,
        );
        return { data: adjustment };
      } catch (err) {
        if (err instanceof InvalidTimeAdjustmentError) {
          return sendProblem(reply, correlationId, badRequest(err.message));
        }
        if (
          err instanceof InvalidTimeAdjustmentTransitionError ||
          err instanceof SelfApprovalNotAllowedError ||
          err instanceof StaleTimeAdjustmentApprovalError
        ) {
          return sendProblem(reply, correlationId, conflict(err.message));
        }
        if (err instanceof z.ZodError) {
          return sendProblem(reply, correlationId, badRequest(err.message));
        }
        if (err instanceof Error && err.message.includes("not found")) {
          if (err.message.includes("TimeEntry")) {
            return sendProblem(reply, correlationId, notFound("TimeEntry"));
          }
          return sendProblem(reply, correlationId, notFound("TimeAdjustment"));
        }
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.post<{ Params: { id: string } }>(
    "/v1/time-adjustments/:id/reject",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requireTimeAdjustApprovePermission(ctx);
        const existingAdjustment = await container.timeAdjustments!.findById(ctx.tenantId, req.params.id);
        if (!existingAdjustment) return sendProblem(reply, correlationId, notFound("TimeAdjustment"));
        const timeEntry = await container.timeEntries!.findById(ctx.tenantId, existingAdjustment.timeEntryId);
        if (!timeEntry) return sendProblem(reply, correlationId, notFound("TimeEntry"));
        requireBranchScopedSupervisorManage(ctx, timeEntry.branchId, "TimeAdjustment");
        const body = decideTimeAdjustmentBodySchema.parse(req.body);
        const adjustment = await rejectRequestedTimeAdjustment(
          {
            employments: container.employments!,
            shiftAssignments: container.shiftAssignments!,
            timeEntries: container.timeEntries!,
            timeAdjustments: container.timeAdjustments!,
          },
          ctx.tenantId,
          req.params.id,
          body.approverId,
          body.commandId,
        );
        return { data: adjustment };
      } catch (err) {
        if (err instanceof InvalidTimeAdjustmentTransitionError || err instanceof SelfApprovalNotAllowedError) {
          return sendProblem(reply, correlationId, conflict(err.message));
        }
        if (err instanceof z.ZodError) {
          return sendProblem(reply, correlationId, badRequest(err.message));
        }
        if (err instanceof Error && err.message.includes("not found")) {
          if (err.message.includes("TimeEntry")) {
            return sendProblem(reply, correlationId, notFound("TimeEntry"));
          }
          return sendProblem(reply, correlationId, notFound("TimeAdjustment"));
        }
        return sendProblem(reply, correlationId, err);
      }
    },
  );
}
