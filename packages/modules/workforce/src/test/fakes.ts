import type {
  Employment,
  WorkShift,
  ShiftAssignment,
  TimeEntry,
  TimeAdjustment,
  BreakLog,
  BreakAdjustment,
} from "../index.js";
import type {
  EmploymentRepositoryPort,
  WorkShiftRepositoryPort,
  ShiftAssignmentRepositoryPort,
  TimeEntryRepositoryPort,
  TimeAdjustmentRepositoryPort,
  BreakLogRepositoryPort,
  BreakAdjustmentRepositoryPort,
} from "../application/ports.js";

export class FakeEmploymentRepository implements EmploymentRepositoryPort {
  constructor(private readonly items: Employment[] = []) {}
  async findById(tenantId: string, id: string) {
    return this.items.find((item) => item.tenantId === tenantId && item.id === id) ?? null;
  }
  async findByEmployeeCode(tenantId: string, employeeCode: string) {
    return this.items.find((item) => item.tenantId === tenantId && item.employeeCode === employeeCode) ?? null;
  }
  async listByTenant(tenantId: string) {
    return this.items.filter((item) => item.tenantId === tenantId);
  }
  async save(employment: Employment) {
    const i = this.items.findIndex((item) => item.id === employment.id);
    if (i >= 0) this.items[i] = employment;
    else this.items.push(employment);
  }
}

export class FakeWorkShiftRepository implements WorkShiftRepositoryPort {
  constructor(private readonly items: WorkShift[] = []) {}
  async findById(tenantId: string, id: string) {
    return this.items.find((item) => item.tenantId === tenantId && item.id === id) ?? null;
  }
  async listByBranch(tenantId: string, branchId: string) {
    return this.items.filter((item) => item.tenantId === tenantId && item.branchId === branchId);
  }
  async save(shift: WorkShift) {
    const i = this.items.findIndex((item) => item.id === shift.id);
    if (i >= 0) this.items[i] = shift;
    else this.items.push(shift);
  }
}

export class FakeShiftAssignmentRepository implements ShiftAssignmentRepositoryPort {
  constructor(private readonly items: ShiftAssignment[] = []) {}
  async findById(tenantId: string, id: string) {
    return this.items.find((item) => item.tenantId === tenantId && item.id === id) ?? null;
  }
  async findByShiftAndEmployment(tenantId: string, workShiftId: string, employmentId: string) {
    return this.items.find(
      (item) =>
        item.tenantId === tenantId &&
        item.workShiftId === workShiftId &&
        item.employmentId === employmentId,
    ) ?? null;
  }
  async listByShift(tenantId: string, workShiftId: string) {
    return this.items.filter((item) => item.tenantId === tenantId && item.workShiftId === workShiftId);
  }
  async save(assignment: ShiftAssignment) {
    const i = this.items.findIndex((item) => item.id === assignment.id);
    if (i >= 0) this.items[i] = assignment;
    else this.items.push(assignment);
  }
}

export class FakeTimeEntryRepository implements TimeEntryRepositoryPort {
  constructor(private readonly items: TimeEntry[] = []) {}
  async findById(tenantId: string, id: string) {
    return this.items.find((item) => item.tenantId === tenantId && item.id === id) ?? null;
  }
  async findOpenByEmployment(tenantId: string, employmentId: string) {
    return this.items.find(
      (item) => item.tenantId === tenantId && item.employmentId === employmentId && item.status === "OPEN",
    ) ?? null;
  }
  async listByBranch(tenantId: string, branchId: string) {
    return this.items.filter((item) => item.tenantId === tenantId && item.branchId === branchId);
  }
  async listByEmployment(tenantId: string, employmentId: string) {
    return this.items.filter((item) => item.tenantId === tenantId && item.employmentId === employmentId);
  }
  async save(entry: TimeEntry) {
    const i = this.items.findIndex((item) => item.id === entry.id);
    if (i >= 0) this.items[i] = entry;
    else this.items.push(entry);
  }
}

export class FakeTimeAdjustmentRepository implements TimeAdjustmentRepositoryPort {
  constructor(private readonly items: TimeAdjustment[] = []) {}
  async findById(tenantId: string, id: string) {
    return this.items.find((item) => item.tenantId === tenantId && item.id === id) ?? null;
  }
  async listByTimeEntry(tenantId: string, timeEntryId: string) {
    return this.items.filter((item) => item.tenantId === tenantId && item.timeEntryId === timeEntryId);
  }
  async save(adjustment: TimeAdjustment) {
    const i = this.items.findIndex((item) => item.id === adjustment.id);
    if (i >= 0) this.items[i] = adjustment;
    else this.items.push(adjustment);
  }
}

export class FakeBreakLogRepository implements BreakLogRepositoryPort {
  constructor(private readonly items: BreakLog[] = []) {}
  async findById(tenantId: string, id: string) {
    return this.items.find((item) => item.tenantId === tenantId && item.id === id) ?? null;
  }
  async findOpenByTimeEntry(tenantId: string, timeEntryId: string) {
    return this.items.find(
      (item) => item.tenantId === tenantId && item.timeEntryId === timeEntryId && item.status === "OPEN",
    ) ?? null;
  }
  async listByTimeEntry(tenantId: string, timeEntryId: string) {
    return this.items.filter((item) => item.tenantId === tenantId && item.timeEntryId === timeEntryId);
  }
  async save(breakLog: BreakLog) {
    const i = this.items.findIndex((item) => item.id === breakLog.id);
    if (i >= 0) this.items[i] = breakLog;
    else this.items.push(breakLog);
  }
}

export class FakeBreakAdjustmentRepository implements BreakAdjustmentRepositoryPort {
  constructor(private readonly items: BreakAdjustment[] = []) {}
  async findById(tenantId: string, id: string) {
    return this.items.find((item) => item.tenantId === tenantId && item.id === id) ?? null;
  }
  async listByBreakLog(tenantId: string, breakLogId: string) {
    return this.items.filter((item) => item.tenantId === tenantId && item.breakLogId === breakLogId);
  }
  async save(adjustment: BreakAdjustment) {
    const i = this.items.findIndex((item) => item.id === adjustment.id);
    if (i >= 0) this.items[i] = adjustment;
    else this.items.push(adjustment);
  }
}

export function anEmployment(overrides: Partial<Employment> = {}): Employment {
  const now = new Date("2026-07-24T12:00:00Z");
  return {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    tenantId: "11111111-1111-1111-1111-111111111111",
    personRef: "person-1",
    employeeCode: "EMP-001",
    relationshipType: "EMPLOYEE",
    eligibleBranchIds: ["22222222-2222-2222-2222-222222222222"],
    status: "ACTIVE",
    validFrom: new Date("2026-01-01T00:00:00Z"),
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}
