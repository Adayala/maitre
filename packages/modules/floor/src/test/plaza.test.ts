import assert from "node:assert/strict";
import test from "node:test";
import {
  createPlaza,
  updatePlaza,
  InvalidPlazaError,
  PlazaTableConflictError,
  normalizePlazaName,
  uniquePlazaTableIds,
  type Plaza,
  type PlazaRepositoryPort,
  type ServicePeriod,
} from "../index.js";
import { FakeServicePeriodRepository } from "./fakes.js";

const NOW = new Date("2026-08-01T12:00:00.000Z");
const TENANT = "tenant-a";
const BRANCH = "branch-a";
const SALON = "salon-a";
const PERIOD = "period-a";

class FakePlazaRepository implements PlazaRepositoryPort {
  readonly values = new Map<string, Plaza>();
  async findById(tenantId: string, id: string) {
    const value = this.values.get(id);
    return value?.tenantId === tenantId ? value : null;
  }
  async listBySalon(tenantId: string, salonId: string) {
    return [...this.values.values()].filter(
      (value) => value.tenantId === tenantId && value.salonId === salonId,
    );
  }
  async listByServicePeriod(tenantId: string, servicePeriodId: string) {
    return [...this.values.values()].filter(
      (value) =>
        value.tenantId === tenantId &&
        value.servicePeriodId === servicePeriodId,
    );
  }
  async findByTableInServicePeriod(
    tenantId: string,
    servicePeriodId: string,
    tableId: string,
  ) {
    return (
      [...this.values.values()].find(
        (value) =>
          value.tenantId === tenantId &&
          value.servicePeriodId === servicePeriodId &&
          value.tableIds.includes(tableId),
      ) ?? null
    );
  }
  async save(plaza: Plaza) {
    this.values.set(plaza.id, plaza);
  }
}

function period(overrides: Partial<ServicePeriod> = {}): ServicePeriod {
  return {
    id: PERIOD,
    tenantId: TENANT,
    branchId: BRANCH,
    businessDate: "2026-08-01",
    name: "Cena",
    type: "DINNER",
    status: "PLANNED",
    revision: 1,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

async function deps(
  options: {
    salon?: null | { tenantId: string; branchId: string; status: string };
    servicePeriod?: ServicePeriod | null;
    table?: null | { tenantId: string; branchId: string; salonId: string };
    employment?: null | {
      tenantId: string;
      eligibleBranchIds: string[];
      status: string;
    };
    withEmployments?: boolean;
  } = {},
) {
  const plazas = new FakePlazaRepository();
  const servicePeriods = new FakeServicePeriodRepository();
  if (options.servicePeriod !== null) {
    await servicePeriods.save(options.servicePeriod ?? period());
  }
  const salon =
    options.salon === undefined
      ? { tenantId: TENANT, branchId: BRANCH, status: "ACTIVE" }
      : options.salon;
  const table =
    options.table === undefined
      ? { tenantId: TENANT, branchId: BRANCH, salonId: SALON }
      : options.table;
  const employment =
    options.employment === undefined
      ? { tenantId: TENANT, eligibleBranchIds: [BRANCH], status: "ACTIVE" }
      : options.employment;
  return {
    plazas,
    servicePeriods,
    salons: { findById: async () => salon },
    tables: { findById: async () => table },
    ...(options.withEmployments === false
      ? {}
      : { employments: { findById: async () => employment } }),
    now: () => NOW,
  };
}

const input = {
  tenantId: TENANT,
  branchId: BRANCH,
  salonId: SALON,
  servicePeriodId: PERIOD,
  name: "  Terraza  ",
  tableIds: ["table-a", "table-b"],
  waiterEmploymentId: "employment-a",
  id: "plaza-a",
};

test("plaza value helpers normalize names and reject invalid input", () => {
  assert.equal(normalizePlazaName("  Terraza "), "Terraza");
  assert.throws(() => normalizePlazaName("x"), InvalidPlazaError);
  assert.throws(() => normalizePlazaName("x".repeat(81)), InvalidPlazaError);
  assert.deepEqual(uniquePlazaTableIds(["a", "b"]), ["a", "b"]);
  assert.throws(() => uniquePlazaTableIds(["a", "a"]), InvalidPlazaError);
});

test("creates and updates a period plaza with waiter and physical tables", async () => {
  const dependencies = await deps();
  const created = await createPlaza(dependencies, input);
  assert.deepEqual(created, {
    id: "plaza-a",
    tenantId: TENANT,
    branchId: BRANCH,
    salonId: SALON,
    servicePeriodId: PERIOD,
    name: "Terraza",
    mode: "VARIABLE",
    waiterEmploymentId: "employment-a",
    tableIds: ["table-a", "table-b"],
    createdAt: NOW,
    updatedAt: NOW,
  });
  const updated = await updatePlaza(dependencies, created, {
    name: "Patio",
    tableIds: ["table-a"],
    waiterEmploymentId: null,
  });
  assert.equal(updated.name, "Patio");
  assert.equal(updated.mode, "VARIABLE");
  assert.equal(updated.waiterEmploymentId, null);
  assert.deepEqual(await dependencies.plazas.listBySalon(TENANT, SALON), [
    updated,
  ]);
  assert.deepEqual(
    await dependencies.plazas.listByServicePeriod(TENANT, PERIOD),
    [updated],
  );
  assert.equal(await dependencies.plazas.findById("other", updated.id), null);
});

test("fixed plazas keep their source snapshot and can change future carry-forward mode", async () => {
  const dependencies = await deps();
  const created = await createPlaza(dependencies, {
    ...input,
    mode: "FIXED",
    sourcePlazaId: "source-a",
  });
  assert.equal(created.mode, "FIXED");
  assert.equal(created.sourcePlazaId, "source-a");
  const updated = await updatePlaza(dependencies, created, {
    name: created.name,
    tableIds: created.tableIds,
    mode: "VARIABLE",
  });
  assert.equal(updated.mode, "VARIABLE");
  assert.equal(updated.sourcePlazaId, "source-a");
});

test("create supports generated identity, clock and an omitted waiter", async () => {
  const dependencies = await deps({ withEmployments: false });
  const { id: _id, waiterEmploymentId: _waiter, ...withoutOptional } = input;
  const { now: _now, ...dependenciesWithoutClock } = dependencies;
  const created = await createPlaza(dependenciesWithoutClock, withoutOptional);
  assert.match(created.id, /^[0-9a-f-]{36}$/);
  assert.equal(created.waiterEmploymentId, undefined);
  assert.ok(created.createdAt instanceof Date);
  const updated = await updatePlaza(dependenciesWithoutClock, created, {
    name: "Terraza nueva",
    tableIds: created.tableIds,
  });
  assert.equal(updated.waiterEmploymentId, undefined);
});

test("update preserves an omitted waiter and accepts its own table assignment", async () => {
  const dependencies = await deps();
  const created = await createPlaza(dependencies, input);
  const { now: _now, ...dependenciesWithoutClock } = dependencies;
  const updated = await updatePlaza(dependenciesWithoutClock, created, {
    name: "Terraza sur",
    tableIds: created.tableIds,
  });
  assert.equal(updated.waiterEmploymentId, "employment-a");
  assert.ok(updated.updatedAt instanceof Date);
});

test("rejects an empty plaza and invalid salon variants", async () => {
  await assert.rejects(
    createPlaza(await deps(), { ...input, tableIds: [] }),
    /at least one table/,
  );
  for (const salon of [
    null,
    { tenantId: TENANT, branchId: BRANCH, status: "INACTIVE" },
    { tenantId: TENANT, branchId: "other", status: "ACTIVE" },
  ]) {
    await assert.rejects(
      createPlaza(await deps({ salon }), input),
      /salon is not active/,
    );
  }
});

test("rejects missing, foreign and final service periods", async () => {
  for (const servicePeriod of [
    null,
    period({ branchId: "other" }),
    period({ status: "CLOSED" }),
    period({ status: "CANCELLED" }),
  ]) {
    await assert.rejects(
      createPlaza(await deps({ servicePeriod }), input),
      /service period is not editable/,
    );
  }
});

test("rejects tables outside the selected tenant branch or salon", async () => {
  for (const table of [
    null,
    { tenantId: TENANT, branchId: "other", salonId: SALON },
    { tenantId: TENANT, branchId: BRANCH, salonId: "other" },
  ]) {
    await assert.rejects(
      createPlaza(await deps({ table }), input),
      /Every plaza table must belong/,
    );
  }
});

test("rejects missing, inactive and branch-ineligible waiter assignments", async () => {
  const cases = [
    await deps({ withEmployments: false }),
    await deps({ employment: null }),
    await deps({
      employment: {
        tenantId: TENANT,
        eligibleBranchIds: [BRANCH],
        status: "INACTIVE",
      },
    }),
    await deps({
      employment: {
        tenantId: TENANT,
        eligibleBranchIds: ["other"],
        status: "ACTIVE",
      },
    }),
  ];
  for (const dependencies of cases) {
    await assert.rejects(
      createPlaza(dependencies, input),
      /waiter is not active/,
    );
  }
});

test("rejects a table already assigned to another plaza in the period", async () => {
  const dependencies = await deps();
  await createPlaza(dependencies, input);
  await assert.rejects(
    createPlaza(dependencies, {
      ...input,
      id: "plaza-b",
      name: "Interior",
      tableIds: ["table-b"],
    }),
    PlazaTableConflictError,
  );
});
