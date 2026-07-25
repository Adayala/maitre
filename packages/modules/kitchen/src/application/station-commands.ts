// Station use cases (SPEC-103). create / update / activate / deactivate.
// Consolidated into one file per aggregate, mirroring the module conventions.

import { randomUUID } from "node:crypto";
import {
  type Station,
  type StationStatus,
  DuplicateStationCodeError,
  InvalidStationStateError,
} from "../domain/station.js";
import type { StationRepositoryPort, CommandRepositoryPort } from "./ports.js";

export interface StationDeps {
  stations: StationRepositoryPort;
  now?: () => Date;
}

function nowFrom(deps: { now?: () => Date }): Date {
  return (deps.now ?? (() => new Date()))();
}

async function loadStation(deps: StationDeps, tenantId: string, id: string): Promise<Station> {
  const station = await deps.stations.findById(tenantId, id);
  if (!station) throw new Error(`Station ${id} not found`);
  return station;
}

export interface CreateStationInput {
  id?: string;
  tenantId: string;
  brandId: string;
  branchId: string;
  code: string;
  displayName: string;
  capabilities?: string[];
  displayOrder?: number;
}

export async function createStation(deps: StationDeps, input: CreateStationInput): Promise<Station> {
  const existing = await deps.stations.findByCode(input.tenantId, input.branchId, input.code);
  if (existing) throw new DuplicateStationCodeError(input.code, input.branchId);

  const now = nowFrom(deps);
  const station: Station = {
    id: input.id ?? randomUUID(),
    tenantId: input.tenantId,
    brandId: input.brandId,
    branchId: input.branchId,
    code: input.code,
    displayName: input.displayName,
    capabilities: input.capabilities ?? [],
    status: "ACTIVE",
    displayOrder: input.displayOrder ?? 0,
    revision: 1,
    createdAt: now,
    updatedAt: now,
  };
  await deps.stations.save(station);
  return station;
}

export interface UpdateStationInput {
  tenantId: string;
  id: string;
  displayName?: string;
  capabilities?: string[];
  displayOrder?: number;
}

export async function updateStation(deps: StationDeps, input: UpdateStationInput): Promise<Station> {
  const station = await loadStation(deps, input.tenantId, input.id);
  const now = nowFrom(deps);
  const updated: Station = {
    ...station,
    ...(input.displayName !== undefined ? { displayName: input.displayName } : {}),
    ...(input.capabilities !== undefined ? { capabilities: input.capabilities } : {}),
    ...(input.displayOrder !== undefined ? { displayOrder: input.displayOrder } : {}),
    revision: station.revision + 1,
    updatedAt: now,
  };
  await deps.stations.save(updated);
  return updated;
}

async function setStatus(deps: StationDeps, tenantId: string, id: string, status: StationStatus): Promise<Station> {
  const station = await loadStation(deps, tenantId, id);
  if (station.status === status) return station;
  const now = nowFrom(deps);
  const updated: Station = { ...station, status, revision: station.revision + 1, updatedAt: now };
  await deps.stations.save(updated);
  return updated;
}

export async function activateStation(deps: StationDeps, input: { tenantId: string; id: string }): Promise<Station> {
  return setStatus(deps, input.tenantId, input.id, "ACTIVE");
}

export class StationHasActiveCommandsError extends InvalidStationStateError {
  constructor(id: string, count: number) {
    super(`Station ${id} still owns ${count} non-terminal Command(s); reroute or complete them before deactivating`);
    this.name = "StationHasActiveCommandsError";
  }
}

// SPEC-099 invariant (simplified — no atomic-transfer alternative): a Station
// cannot be deactivated while it owns non-terminal Commands.
export interface DeactivateStationDeps extends StationDeps {
  commands: CommandRepositoryPort;
}

export async function deactivateStation(
  deps: DeactivateStationDeps,
  input: { tenantId: string; id: string },
): Promise<Station> {
  const pending = await deps.commands.countNonTerminalByStation(input.tenantId, input.id);
  if (pending > 0) throw new StationHasActiveCommandsError(input.id, pending);
  return setStatus(deps, input.tenantId, input.id, "INACTIVE");
}
