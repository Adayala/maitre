import { randomUUID } from "node:crypto";
import { isSalonOperable } from "../domain/salon.js";
import { assertValidTableCapacity, type Table } from "../domain/table.js";
import type { SalonRepositoryPort, TableRepositoryPort } from "./ports.js";

export class SalonNotOperableError extends Error {
  constructor(salonId: string) {
    super(`Salon ${salonId} does not exist or is not operable`);
    this.name = "SalonNotOperableError";
  }
}

export class DuplicateTableNumberError extends Error {
  constructor(number: string, salonId: string) {
    super(`Table number "${number}" already exists in salon ${salonId}`);
    this.name = "DuplicateTableNumberError";
  }
}

export interface CreateTableInput {
  tenantId: string;
  branchId: string;
  salonId: string;
  number: string;
  capacity: number;
  name?: string;
  actorId?: string;
  id?: string;
}

export interface CreateTableDeps {
  salons: SalonRepositoryPort;
  tables: TableRepositoryPort;
  now?: () => Date;
}

// SPEC-006 §Reglas 1-2 — unique number per salon, capacity within salon bounds.
export async function createTable(
  deps: CreateTableDeps,
  input: CreateTableInput,
): Promise<Table> {
  const salon = await deps.salons.findById(input.tenantId, input.salonId);
  if (!salon || !isSalonOperable(salon)) {
    throw new SalonNotOperableError(input.salonId);
  }

  assertValidTableCapacity(input.capacity, salon.capacity);

  const existing = await deps.tables.findByNumber(
    input.tenantId,
    input.salonId,
    input.number,
  );
  if (existing) {
    throw new DuplicateTableNumberError(input.number, input.salonId);
  }

  const now = (deps.now ?? (() => new Date()))();
  const table: Table = {
    id: input.id ?? randomUUID(),
    tenantId: input.tenantId,
    branchId: input.branchId,
    salonId: input.salonId,
    number: input.number,
    capacity: input.capacity,
    createdAt: now,
    updatedAt: now,
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.actorId !== undefined
      ? { createdBy: input.actorId, updatedBy: input.actorId }
      : {}),
  };

  await deps.tables.save(table);
  return table;
}
