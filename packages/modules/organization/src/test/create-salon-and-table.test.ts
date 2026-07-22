import { test } from "node:test";
import assert from "node:assert/strict";
import { createSalon, BranchNotOperableError } from "../application/create-salon.js";
import {
  createTable,
  SalonNotOperableError,
  DuplicateTableNumberError,
} from "../application/create-table.js";
import { TableCapacityExceedsSalonError, InvalidTableCapacityError } from "../domain/table.js";
import {
  FakeBranchRepository,
  FakeSalonRepository,
  FakeTableRepository,
  aBranch,
  aSalon,
} from "./fakes.js";

const now = new Date("2026-05-01T00:00:00Z");
const tenantId = "11111111-1111-1111-1111-111111111111";

test("createSalon succeeds for an operable branch", async () => {
  const branches = new FakeBranchRepository([aBranch()]);
  const salons = new FakeSalonRepository();

  const salon = await createSalon(
    { branches, salons, now: () => now },
    { tenantId, branchId: "22222222-2222-2222-2222-222222222222", name: "Salón Principal", capacity: 40 },
  );

  assert.equal(salon.status, "ACTIVE");
  assert.equal(salon.capacity, 40);
});

test("createSalon rejects a non-operable branch", async () => {
  const branches = new FakeBranchRepository([aBranch({ status: "ARCHIVED" })]);
  const salons = new FakeSalonRepository();

  await assert.rejects(
    createSalon(
      { branches, salons, now: () => now },
      { tenantId, branchId: "22222222-2222-2222-2222-222222222222", name: "Salón", capacity: 40 },
    ),
    BranchNotOperableError,
  );
});

test("createTable succeeds within salon capacity with a unique number", async () => {
  const salons = new FakeSalonRepository([aSalon({ capacity: 40 })]);
  const tables = new FakeTableRepository();

  const table = await createTable(
    { salons, tables, now: () => now },
    {
      tenantId,
      branchId: "22222222-2222-2222-2222-222222222222",
      salonId: "66666666-6666-6666-6666-666666666666",
      number: "1",
      capacity: 4,
    },
  );

  assert.equal(table.number, "1");
  assert.equal(table.capacity, 4);
});

test("createTable rejects a non-operable salon", async () => {
  const salons = new FakeSalonRepository([aSalon({ status: "INACTIVE" })]);
  const tables = new FakeTableRepository();

  await assert.rejects(
    createTable(
      { salons, tables, now: () => now },
      {
        tenantId,
        branchId: "22222222-2222-2222-2222-222222222222",
        salonId: "66666666-6666-6666-6666-666666666666",
        number: "1",
        capacity: 4,
      },
    ),
    SalonNotOperableError,
  );
});

test("createTable rejects capacity exceeding salon capacity", async () => {
  const salons = new FakeSalonRepository([aSalon({ capacity: 10 })]);
  const tables = new FakeTableRepository();

  await assert.rejects(
    createTable(
      { salons, tables, now: () => now },
      {
        tenantId,
        branchId: "22222222-2222-2222-2222-222222222222",
        salonId: "66666666-6666-6666-6666-666666666666",
        number: "1",
        capacity: 12,
      },
    ),
    TableCapacityExceedsSalonError,
  );
});

test("createTable rejects capacity outside [1,20]", async () => {
  const salons = new FakeSalonRepository([aSalon({ capacity: 40 })]);
  const tables = new FakeTableRepository();

  await assert.rejects(
    createTable(
      { salons, tables, now: () => now },
      {
        tenantId,
        branchId: "22222222-2222-2222-2222-222222222222",
        salonId: "66666666-6666-6666-6666-666666666666",
        number: "1",
        capacity: 21,
      },
    ),
    InvalidTableCapacityError,
  );
});

test("createTable rejects a duplicate number within the same salon", async () => {
  const salons = new FakeSalonRepository([aSalon({ capacity: 40 })]);
  const tables = new FakeTableRepository();
  await createTable(
    { salons, tables, now: () => now },
    {
      tenantId,
      branchId: "22222222-2222-2222-2222-222222222222",
      salonId: "66666666-6666-6666-6666-666666666666",
      number: "1",
      capacity: 4,
    },
  );

  await assert.rejects(
    createTable(
      { salons, tables, now: () => now },
      {
        tenantId,
        branchId: "22222222-2222-2222-2222-222222222222",
        salonId: "66666666-6666-6666-6666-666666666666",
        number: "1",
        capacity: 2,
      },
    ),
    DuplicateTableNumberError,
  );
});
