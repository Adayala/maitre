// Occupancy read/release use cases (SPEC-056). Seat/move are covered by
// openVisit/moveVisitTables in visit-commands.ts, since Occupancy always
// exists in service of a Visit in this simplified model. This file adds
// the standalone release command for partial-visit release (e.g. one of
// several tables freed while the Visit stays open on the rest).

import type { Occupancy } from "../domain/occupancy.js";
import type { OccupancyRepositoryPort } from "./ports.js";

export interface ReleaseOccupancyInput {
  tenantId: string;
  occupancyId: string;
}

export async function releaseOccupancy(
  deps: { occupancies: OccupancyRepositoryPort; now?: () => Date },
  input: ReleaseOccupancyInput,
): Promise<Occupancy> {
  const occupancy = await deps.occupancies.findById(input.tenantId, input.occupancyId);
  if (!occupancy) throw new Error(`Occupancy ${input.occupancyId} not found`);
  if (occupancy.status !== "ACTIVE") throw new Error(`Occupancy ${occupancy.id} is not ACTIVE`);
  const now = (deps.now ?? (() => new Date()))();
  const updated: Occupancy = { ...occupancy, status: "CLOSED", endedAt: now, revision: occupancy.revision + 1 };
  await deps.occupancies.save(updated);
  return updated;
}
