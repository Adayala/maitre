import {
  computeTableStatus,
  type TableStatusProjection,
} from "@maitre/floor";
import {
  blocksCapacity,
  reservationWindow,
} from "@maitre/reservations";
import type { Container } from "../composition/container.js";

interface StatusTable {
  id: string;
  branchId: string;
}

export async function projectTableStatus(
  container: Container,
  tenantId: string,
  table: StatusTable,
  now = new Date(),
): Promise<TableStatusProjection> {
  const occupancies = await container.occupancies.listByTable(
    tenantId,
    table.id,
  );
  const activeOccupancy = occupancies.find(
    (occupancy) => occupancy.status === "ACTIVE",
  );
  const checksByVisitId = new Map();

  if (activeOccupancy) {
    const check = await container.checks.findByVisit(
      tenantId,
      activeOccupancy.visitId,
    );
    if (check) checksByVisitId.set(activeOccupancy.visitId, check);
  }

  const floorProjection = computeTableStatus({
    tableId: table.id,
    occupancies,
    checksByVisitId,
    now,
  });
  if (floorProjection.status !== "AVAILABLE") return floorProjection;

  const reservations = await container.reservations.listActiveByBranchWindow(
    tenantId,
    table.branchId,
    now,
    now,
  );
  const reservation = reservations.find((candidate) => {
    if (!blocksCapacity(candidate) || !candidate.tableIds?.includes(table.id)) {
      return false;
    }
    const window = reservationWindow(candidate);
    return window.start <= now && now < window.end;
  });

  return reservation
    ? {
        tableId: table.id,
        status: "RESERVED",
        relatedReservationId: reservation.id,
        asOf: now,
      }
    : floorProjection;
}

export async function listBranchTableStatuses(
  container: Container,
  tenantId: string,
  branchId: string,
  now = new Date(),
): Promise<TableStatusProjection[]> {
  const salons = await container.salons.listByBranch(tenantId, branchId);
  const tableGroups = await Promise.all(
    salons.map((salon) => container.tables.listBySalon(tenantId, salon.id)),
  );
  const tables = tableGroups.flat();
  const visits = await container.visits.listByBranch(tenantId, branchId);
  const tableById = new Map<string, StatusTable>(
    tables.map((table) => [table.id, table]),
  );
  for (const visit of visits) {
    for (const tableId of visit.tableIds) {
      if (!tableById.has(tableId)) {
        tableById.set(tableId, { id: tableId, branchId });
      }
    }
  }

  return Promise.all(
    [...tableById.values()].map((table) =>
      projectTableStatus(container, tenantId, table, now),
    ),
  );
}
