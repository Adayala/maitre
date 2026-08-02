// A Plaza is an operational grouping of tables for one service period.
// It is not a physical table and it does not own an independent cover count.
export type PlazaMode = "FIXED" | "VARIABLE";

export interface Plaza {
  id: string;
  tenantId: string;
  branchId: string;
  salonId: string;
  servicePeriodId: string;
  name: string;
  mode: PlazaMode;
  sourcePlazaId?: string | null;
  waiterEmploymentId?: string | null;
  tableIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class InvalidPlazaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidPlazaError";
  }
}

export class PlazaTableConflictError extends Error {
  constructor(tableId: string) {
    super(
      `Table ${tableId} is already assigned to another plaza in this service period`,
    );
    this.name = "PlazaTableConflictError";
  }
}

export function normalizePlazaName(name: string): string {
  const normalized = name.trim();
  if (normalized.length < 2 || normalized.length > 80) {
    throw new InvalidPlazaError(
      "Plaza name must contain between 2 and 80 characters",
    );
  }
  return normalized;
}

export function uniquePlazaTableIds(tableIds: string[]): string[] {
  const unique = [...new Set(tableIds)];
  if (unique.length !== tableIds.length) {
    throw new InvalidPlazaError("A table cannot be repeated within a plaza");
  }
  return unique;
}
