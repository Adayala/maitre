import { z } from "zod";

export const employmentStatusSchema = z.enum(["ACTIVE", "INACTIVE", "TERMINATED"]);
export type EmploymentStatus = z.infer<typeof employmentStatusSchema>;

export const employmentRelationshipTypeSchema = z.enum(["EMPLOYEE", "CONTRACTOR", "TEMPORARY"]);
export type EmploymentRelationshipType = z.infer<typeof employmentRelationshipTypeSchema>;

export const employmentSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  personRef: z.string().min(1),
  employeeCode: z.string().min(1),
  relationshipType: employmentRelationshipTypeSchema,
  eligibleBranchIds: z.array(z.string().uuid()),
  status: employmentStatusSchema,
  validFrom: z.coerce.date(),
  validUntil: z.coerce.date().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Employment = z.infer<typeof employmentSchema>;

export const workShiftStatusSchema = z.enum([
  "DRAFT",
  "PUBLISHED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);
export type WorkShiftStatus = z.infer<typeof workShiftStatusSchema>;

export const workShiftSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  branchId: z.string().uuid(),
  timezone: z.string().min(1),
  businessDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startsAtUtc: z.coerce.date(),
  endsAtUtc: z.coerce.date(),
  laborPolicyVersion: z.string().min(1),
  servicePeriodId: z.string().uuid().nullable().optional(),
  status: workShiftStatusSchema,
  revision: z.number().int().nonnegative(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  publishedAt: z.coerce.date().nullable().optional(),
  startedAt: z.coerce.date().nullable().optional(),
  completedAt: z.coerce.date().nullable().optional(),
  cancelledAt: z.coerce.date().nullable().optional(),
});
export type WorkShift = z.infer<typeof workShiftSchema>;

export const shiftAssignmentStatusSchema = z.enum(["PROPOSED", "CONFIRMED", "DECLINED", "CANCELLED"]);
export type ShiftAssignmentStatus = z.infer<typeof shiftAssignmentStatusSchema>;

export const shiftAssignmentSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  branchId: z.string().uuid(),
  workShiftId: z.string().uuid(),
  employmentId: z.string().uuid(),
  roleCode: z.string().min(1),
  stationId: z.string().uuid().nullable().optional(),
  status: shiftAssignmentStatusSchema,
  revision: z.number().int().nonnegative(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  confirmedAt: z.coerce.date().nullable().optional(),
  declinedAt: z.coerce.date().nullable().optional(),
  cancelledAt: z.coerce.date().nullable().optional(),
});
export type ShiftAssignment = z.infer<typeof shiftAssignmentSchema>;

export const timeEntryStatusSchema = z.enum(["OPEN", "CLOSED"]);
export type TimeEntryStatus = z.infer<typeof timeEntryStatusSchema>;

export const timeEntrySourceSchema = z.enum(["DEVICE", "MANUAL", "IMPORT"]);
export type TimeEntrySource = z.infer<typeof timeEntrySourceSchema>;

export const timeEntrySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  branchId: z.string().uuid(),
  employmentId: z.string().uuid(),
  shiftAssignmentId: z.string().uuid().nullable().optional(),
  status: timeEntryStatusSchema,
  capturedAt: z.coerce.date(),
  effectiveCapturedAt: z.coerce.date().nullable().optional(),
  receivedAt: z.coerce.date(),
  closedCapturedAt: z.coerce.date().nullable().optional(),
  effectiveClosedCapturedAt: z.coerce.date().nullable().optional(),
  closedReceivedAt: z.coerce.date().nullable().optional(),
  timezone: z.string().min(1),
  source: timeEntrySourceSchema,
  deviceId: z.string().min(1),
  deviceSequence: z.number().int().nonnegative(),
  openedCommandId: z.string().uuid().nullable().optional(),
  closedCommandId: z.string().uuid().nullable().optional(),
  clockSkewMs: z.number().int(),
  pendingReview: z.boolean(),
  reviewReason: z.string().nullable().optional(),
  lastApprovedAdjustmentId: z.string().uuid().nullable().optional(),
  revision: z.number().int().nonnegative(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type TimeEntry = z.infer<typeof timeEntrySchema>;

export const timeAdjustmentStatusSchema = z.enum(["REQUESTED", "APPROVED", "REJECTED"]);
export type TimeAdjustmentStatus = z.infer<typeof timeAdjustmentStatusSchema>;

export const timeAdjustmentSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  timeEntryId: z.string().uuid(),
  requestCommandId: z.string().uuid().nullable().optional(),
  decisionCommandId: z.string().uuid().nullable().optional(),
  beforeClockInAt: z.coerce.date().nullable().optional(),
  beforeClockOutAt: z.coerce.date().nullable().optional(),
  requestedClockInAt: z.coerce.date().nullable().optional(),
  requestedClockOutAt: z.coerce.date().nullable().optional(),
  afterClockInAt: z.coerce.date().nullable().optional(),
  afterClockOutAt: z.coerce.date().nullable().optional(),
  reason: z.string().min(1),
  evidence: z.string().nullable().optional(),
  requesterId: z.string().min(1),
  approverId: z.string().nullable().optional(),
  status: timeAdjustmentStatusSchema,
  effectiveAt: z.coerce.date().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type TimeAdjustment = z.infer<typeof timeAdjustmentSchema>;

export const breakLogStatusSchema = z.enum(["OPEN", "CLOSED"]);
export type BreakLogStatus = z.infer<typeof breakLogStatusSchema>;

export const breakLogSourceSchema = z.enum(["DEVICE", "MANUAL", "IMPORT"]);
export type BreakLogSource = z.infer<typeof breakLogSourceSchema>;

export const breakTypeSchema = z.enum(["MEAL", "REST", "OTHER"]);
export type BreakType = z.infer<typeof breakTypeSchema>;

export const breakPaidClassificationSchema = z.enum(["PAID", "UNPAID"]);
export type BreakPaidClassification = z.infer<typeof breakPaidClassificationSchema>;

export const breakFindingReasonCodeSchema = z.enum([
  "AUTO_CLOSED_ON_CLOCK_OUT",
  "OPEN_BREAK_REQUIRES_RESOLUTION",
]);
export type BreakFindingReasonCode = z.infer<typeof breakFindingReasonCodeSchema>;

export const breakLogSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  timeEntryId: z.string().uuid(),
  breakType: breakTypeSchema,
  paidClassification: breakPaidClassificationSchema,
  laborPolicyVersion: z.string().min(1),
  status: breakLogStatusSchema,
  openedAt: z.coerce.date(),
  effectiveOpenedAt: z.coerce.date().nullable().optional(),
  closedAt: z.coerce.date().nullable().optional(),
  effectiveClosedAt: z.coerce.date().nullable().optional(),
  timezone: z.string().min(1),
  source: breakLogSourceSchema,
  deviceId: z.string().min(1),
  deviceSequence: z.number().int().nonnegative(),
  openedCommandId: z.string().uuid().nullable().optional(),
  closedCommandId: z.string().uuid().nullable().optional(),
  findingReasonCode: breakFindingReasonCodeSchema.nullable().optional(),
  lastApprovedAdjustmentId: z.string().uuid().nullable().optional(),
  revision: z.number().int().nonnegative(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type BreakLog = z.infer<typeof breakLogSchema>;

export const breakAdjustmentStatusSchema = z.enum(["REQUESTED", "APPROVED", "REJECTED"]);
export type BreakAdjustmentStatus = z.infer<typeof breakAdjustmentStatusSchema>;

export const breakAdjustmentSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  breakLogId: z.string().uuid(),
  requestCommandId: z.string().uuid().nullable().optional(),
  decisionCommandId: z.string().uuid().nullable().optional(),
  beforeOpenedAt: z.coerce.date().nullable().optional(),
  beforeClosedAt: z.coerce.date().nullable().optional(),
  requestedOpenedAt: z.coerce.date().nullable().optional(),
  requestedClosedAt: z.coerce.date().nullable().optional(),
  afterOpenedAt: z.coerce.date().nullable().optional(),
  afterClosedAt: z.coerce.date().nullable().optional(),
  reason: z.string().min(1),
  evidence: z.string().nullable().optional(),
  requesterId: z.string().min(1),
  approverId: z.string().nullable().optional(),
  status: breakAdjustmentStatusSchema,
  effectiveAt: z.coerce.date().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type BreakAdjustment = z.infer<typeof breakAdjustmentSchema>;
