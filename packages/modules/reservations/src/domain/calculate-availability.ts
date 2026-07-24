// SPEC-079 — simplified Capacity Calculator.
//
// SCOPE NOTE (approved "CRUD simple + invariantes clave" decision): the full
// spec models a pure function over a versioned snapshot (policy revisions,
// salons/tables graph of allowlisted table combinations, buffers before/
// after by resource type, reason-code catalog, freshness/confidence). This
// implementation is a single simplified pure function:
// `calculateAvailability` — given branch, partySize, startAt,
// durationMinutes, existing CONFIRMED/SEATED Reservations and ACTIVE Floor
// Occupancies for the branch, returns whether capacity exists (does any
// single Table with capacity >= partySize have no overlapping
// reservation/occupancy in [start, start+duration)) and which table IDs
// are free.
//
// Deferred vs SPEC-079: no multi-table combination-joining (only single
// tables are considered), no buffers before/after, no DST edge-case
// handling (plain Date arithmetic, UTC millis comparison only), no
// CapacityPolicyVersion/reason-code catalog beyond the boolean-ish result
// here, no CALCULATION_LIMIT truncation. Also see reservation.ts's scope
// note: PENDING reservations do not block capacity in this model, only
// CONFIRMED/SEATED ones do.

export interface AvailabilityTable {
  id: string;
  capacity: number;
}

export interface AvailabilityWindow {
  start: Date;
  end: Date;
}

export interface CalculateAvailabilityInput {
  partySize: number;
  startAt: Date;
  durationMinutes: number;
  tables: AvailabilityTable[];
  /** Existing blocked windows per table (from CONFIRMED/SEATED reservations). */
  reservedWindows: Map<string, AvailabilityWindow[]>;
  /** Tables with an open-ended ACTIVE Floor Occupancy (blocks all future windows). */
  activeOccupancyTableIds: Set<string>;
}

export interface CalculateAvailabilityResult {
  available: boolean;
  freeTableIds: string[];
}

function windowsOverlap(a: AvailabilityWindow, b: AvailabilityWindow): boolean {
  // Semi-open [start, end) overlap check.
  return a.start.getTime() < b.end.getTime() && b.start.getTime() < a.end.getTime();
}

export function calculateAvailability(input: CalculateAvailabilityInput): CalculateAvailabilityResult {
  const end = new Date(input.startAt.getTime() + input.durationMinutes * 60_000);
  const requested: AvailabilityWindow = { start: input.startAt, end };

  const freeTableIds: string[] = [];
  for (const table of input.tables) {
    if (table.capacity < input.partySize) continue;
    if (input.activeOccupancyTableIds.has(table.id)) continue;

    const windows = input.reservedWindows.get(table.id) ?? [];
    const hasConflict = windows.some((w) => windowsOverlap(w, requested));
    if (!hasConflict) freeTableIds.push(table.id);
  }

  return { available: freeTableIds.length > 0, freeTableIds };
}
