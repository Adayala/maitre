// SPEC-006 — Table domain model.
// Status is DERIVED (never persisted) — computed from Floor/Reservation
// domain state, which are out of scope for I0 (Fase 2/3). computeTableStatus
// takes plain booleans so this module has no dependency on those domains.

export type TableShape = "ROUND" | "RECTANGULAR" | "SQUARE" | "IRREGULAR";
export type TableStatus =
  | "AVAILABLE"
  | "OCCUPIED"
  | "RESERVED"
  | "PAYING"
  | "CLEANING"
  | "BLOCKED";

export interface TableLocation {
  floor: number;
  zone?: string;
}

export interface TableFeatures {
  isWheelchairAccessible: boolean;
  hasPowerOutlet: boolean;
  isOutdoors: boolean;
}

export interface Table {
  id: string;
  tenantId: string;
  branchId: string;
  salonId: string;
  number: string;
  name?: string;
  capacity: number;
  location?: TableLocation;
  features?: TableFeatures;
  shape?: TableShape;
  minDurationMinutes?: number;
  createdAt: Date;
  createdBy?: string;
  updatedAt: Date;
  updatedBy?: string;
}

export class InvalidTableCapacityError extends Error {
  constructor(capacity: number) {
    super(`Table capacity ${capacity} must be between 1 and 20`);
    this.name = "InvalidTableCapacityError";
  }
}

export class TableCapacityExceedsSalonError extends Error {
  constructor(tableCapacity: number, salonCapacity: number) {
    super(
      `Table capacity ${tableCapacity} exceeds salon capacity ${salonCapacity}`,
    );
    this.name = "TableCapacityExceedsSalonError";
  }
}

// SPEC-006 §Reglas 2 y 5.
export function assertValidTableCapacity(capacity: number, salonCapacity: number): void {
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 20) {
    throw new InvalidTableCapacityError(capacity);
  }
  if (capacity > salonCapacity) {
    throw new TableCapacityExceedsSalonError(capacity, salonCapacity);
  }
}

export interface TableStatusInputs {
  isBlocked: boolean;
  isCleaning: boolean;
  hasPayingVisit: boolean;
  hasOpenVisit: boolean;
  hasFutureReservation: boolean;
}

// SPEC-006 §Status (DERIVED) — precedence: BLOCKED > CLEANING > PAYING >
// OCCUPIED > RESERVED > AVAILABLE.
export function computeTableStatus(inputs: TableStatusInputs): TableStatus {
  if (inputs.isBlocked) return "BLOCKED";
  if (inputs.isCleaning) return "CLEANING";
  if (inputs.hasPayingVisit) return "PAYING";
  if (inputs.hasOpenVisit) return "OCCUPIED";
  if (inputs.hasFutureReservation) return "RESERVED";
  return "AVAILABLE";
}

// SPEC-006 §Reglas 4 — a BLOCKED table cannot be reserved or seated.
export function canAcceptReservationOrVisit(status: TableStatus): boolean {
  return status !== "BLOCKED";
}
