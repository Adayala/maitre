import type { Employment } from "../domain/employment.js";
import type { WorkShift } from "../domain/work-shift.js";
import type { ShiftAssignment } from "../domain/shift-assignment.js";
import type { TimeEntry } from "../domain/time-entry.js";
import type { TimeAdjustment } from "../domain/time-adjustment.js";
import type { BreakLog } from "../domain/break-log.js";
import type { BreakAdjustment } from "../domain/break-adjustment.js";

export interface EmploymentRepositoryPort {
  findById(tenantId: string, id: string): Promise<Employment | null>;
  findByEmployeeCode(tenantId: string, employeeCode: string): Promise<Employment | null>;
  listByTenant(tenantId: string): Promise<Employment[]>;
  save(employment: Employment): Promise<void>;
}

export interface WorkShiftRepositoryPort {
  findById(tenantId: string, id: string): Promise<WorkShift | null>;
  listByBranch(tenantId: string, branchId: string): Promise<WorkShift[]>;
  save(shift: WorkShift): Promise<void>;
}

export interface ShiftAssignmentRepositoryPort {
  findById(tenantId: string, id: string): Promise<ShiftAssignment | null>;
  findByShiftAndEmployment(tenantId: string, workShiftId: string, employmentId: string): Promise<ShiftAssignment | null>;
  listByShift(tenantId: string, workShiftId: string): Promise<ShiftAssignment[]>;
  save(assignment: ShiftAssignment): Promise<void>;
}

export interface TimeEntryRepositoryPort {
  findById(tenantId: string, id: string): Promise<TimeEntry | null>;
  findOpenByEmployment(tenantId: string, employmentId: string): Promise<TimeEntry | null>;
  listByBranch(tenantId: string, branchId: string): Promise<TimeEntry[]>;
  listByEmployment(tenantId: string, employmentId: string): Promise<TimeEntry[]>;
  save(entry: TimeEntry): Promise<void>;
}

export interface TimeAdjustmentRepositoryPort {
  findById(tenantId: string, id: string): Promise<TimeAdjustment | null>;
  listByTimeEntry(tenantId: string, timeEntryId: string): Promise<TimeAdjustment[]>;
  save(adjustment: TimeAdjustment): Promise<void>;
}

export interface BreakLogRepositoryPort {
  findById(tenantId: string, id: string): Promise<BreakLog | null>;
  findOpenByTimeEntry(tenantId: string, timeEntryId: string): Promise<BreakLog | null>;
  listByTimeEntry(tenantId: string, timeEntryId: string): Promise<BreakLog[]>;
  save(breakLog: BreakLog): Promise<void>;
}

export interface BreakAdjustmentRepositoryPort {
  findById(tenantId: string, id: string): Promise<BreakAdjustment | null>;
  listByBreakLog(tenantId: string, breakLogId: string): Promise<BreakAdjustment[]>;
  save(adjustment: BreakAdjustment): Promise<void>;
}
