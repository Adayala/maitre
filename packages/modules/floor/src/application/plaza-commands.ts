import { randomUUID } from "node:crypto";
import {
  InvalidPlazaError,
  PlazaTableConflictError,
  normalizePlazaName,
  uniquePlazaTableIds,
  type Plaza,
} from "../domain/plaza.js";
import type {
  PlazaRepositoryPort,
  ServicePeriodRepositoryPort,
} from "./ports.js";

interface SalonRecord {
  tenantId: string;
  branchId: string;
  status: string;
}

interface TableRecord {
  tenantId: string;
  branchId: string;
  salonId: string;
}

interface EmploymentRecord {
  tenantId: string;
  eligibleBranchIds: string[];
  status: string;
}

export interface PlazaCommandDeps {
  plazas: PlazaRepositoryPort;
  servicePeriods: ServicePeriodRepositoryPort;
  salons: {
    findById(tenantId: string, id: string): Promise<SalonRecord | null>;
  };
  tables: {
    findById(tenantId: string, id: string): Promise<TableRecord | null>;
  };
  employments?: {
    findById(tenantId: string, id: string): Promise<EmploymentRecord | null>;
  };
  now?: () => Date;
}

export interface SavePlazaInput {
  tenantId: string;
  branchId: string;
  salonId: string;
  servicePeriodId: string;
  name: string;
  mode?: Plaza["mode"];
  sourcePlazaId?: string | null;
  waiterEmploymentId?: string | null;
  tableIds: string[];
  id?: string;
}

export async function createPlaza(
  deps: PlazaCommandDeps,
  input: SavePlazaInput,
): Promise<Plaza> {
  const now = (deps.now ?? (() => new Date()))();
  const validated = await validatePlaza(deps, input);
  const plaza: Plaza = {
    id: input.id ?? randomUUID(),
    tenantId: input.tenantId,
    branchId: input.branchId,
    salonId: input.salonId,
    servicePeriodId: input.servicePeriodId,
    name: validated.name,
    mode: input.mode ?? "VARIABLE",
    tableIds: validated.tableIds,
    createdAt: now,
    updatedAt: now,
    ...(input.waiterEmploymentId !== undefined
      ? { waiterEmploymentId: input.waiterEmploymentId }
      : {}),
    ...(input.sourcePlazaId !== undefined
      ? { sourcePlazaId: input.sourcePlazaId }
      : {}),
  };
  await assertTablesAreAvailable(deps, plaza);
  await deps.plazas.save(plaza);
  return plaza;
}

export async function updatePlaza(
  deps: PlazaCommandDeps,
  current: Plaza,
  input: Omit<
    SavePlazaInput,
    "tenantId" | "branchId" | "salonId" | "servicePeriodId"
  >,
): Promise<Plaza> {
  const validated = await validatePlaza(deps, {
    ...input,
    tenantId: current.tenantId,
    branchId: current.branchId,
    salonId: current.salonId,
    servicePeriodId: current.servicePeriodId,
  });
  const updated: Plaza = {
    ...current,
    name: validated.name,
    mode: input.mode ?? current.mode,
    tableIds: validated.tableIds,
    updatedAt: (deps.now ?? (() => new Date()))(),
    ...(input.waiterEmploymentId !== undefined
      ? { waiterEmploymentId: input.waiterEmploymentId }
      : current.waiterEmploymentId !== undefined
        ? { waiterEmploymentId: current.waiterEmploymentId }
        : {}),
  };
  await assertTablesAreAvailable(deps, updated);
  await deps.plazas.save(updated);
  return updated;
}

async function validatePlaza(deps: PlazaCommandDeps, input: SavePlazaInput) {
  const name = normalizePlazaName(input.name);
  const tableIds = uniquePlazaTableIds(input.tableIds);
  if (tableIds.length === 0) {
    throw new InvalidPlazaError("A plaza must contain at least one table");
  }
  const [salon, period] = await Promise.all([
    deps.salons.findById(input.tenantId, input.salonId),
    deps.servicePeriods.findById(input.tenantId, input.servicePeriodId),
  ]);
  if (
    !salon ||
    salon.status !== "ACTIVE" ||
    salon.branchId !== input.branchId
  ) {
    throw new InvalidPlazaError(
      "Plaza salon is not active in the selected branch",
    );
  }
  if (
    !period ||
    period.branchId !== input.branchId ||
    period.status === "CLOSED" ||
    period.status === "CANCELLED"
  ) {
    throw new InvalidPlazaError(
      "Plaza service period is not editable in the selected branch",
    );
  }
  const tables = await Promise.all(
    tableIds.map((tableId) => deps.tables.findById(input.tenantId, tableId)),
  );
  if (
    tables.some(
      (table) =>
        !table ||
        table.branchId !== input.branchId ||
        table.salonId !== input.salonId,
    )
  ) {
    throw new InvalidPlazaError(
      "Every plaza table must belong to the selected salon",
    );
  }
  if (input.waiterEmploymentId) {
    const employment = await deps.employments?.findById(
      input.tenantId,
      input.waiterEmploymentId,
    );
    if (
      !employment ||
      employment.status !== "ACTIVE" ||
      !employment.eligibleBranchIds.includes(input.branchId)
    ) {
      throw new InvalidPlazaError(
        "Assigned waiter is not active in the selected branch",
      );
    }
  }
  return { name, tableIds };
}

async function assertTablesAreAvailable(deps: PlazaCommandDeps, plaza: Plaza) {
  for (const tableId of plaza.tableIds) {
    const conflict = await deps.plazas.findByTableInServicePeriod(
      plaza.tenantId,
      plaza.servicePeriodId,
      tableId,
    );
    if (conflict && conflict.id !== plaza.id) {
      throw new PlazaTableConflictError(tableId);
    }
  }
}
