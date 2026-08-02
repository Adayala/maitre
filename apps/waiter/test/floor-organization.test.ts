import assert from "node:assert/strict";
import test from "node:test";
import {
  organizeFloorGroups,
  type FloorGroup,
} from "../src/features/floor/floor-organization.js";
import type { OperationalPlaza } from "../src/lib/waiter-types.js";

const physical: FloorGroup[] = [
  {
    key: "salon",
    salonName: "Principal",
    tables: ["1", "2", "3"].map((id) => ({
      id,
      number: id,
      status: "AVAILABLE" as const,
    })),
  },
];

function plaza(
  id: string,
  name: string,
  tableIds: string[],
  isMine: boolean,
): OperationalPlaza {
  return {
    id,
    name,
    mode: "VARIABLE",
    salonId: "salon",
    tableIds,
    isMine,
  };
}

test("keeps the physical map when there are no organizational plazas", () => {
  assert.equal(organizeFloorGroups(physical, []), physical);
});

test("prioritizes multiple own plazas without hiding other or unassigned tables", () => {
  const groups = organizeFloorGroups(physical, [
    plaza("other", "Patio", ["2"], false),
    plaza("mine-b", "Terraza", ["3"], true),
    plaza("mine-a", "Interior", ["1"], true),
  ]);
  assert.deepEqual(
    groups.map(({ salonName, organization, tables }) => ({
      salonName,
      organization,
      tableIds: tables.map((table) => table.id),
    })),
    [
      {
        salonName: "Mi plaza · Interior",
        organization: "MINE",
        tableIds: ["1"],
      },
      {
        salonName: "Mi plaza · Terraza",
        organization: "MINE",
        tableIds: ["3"],
      },
      {
        salonName: "Otra plaza · Patio",
        organization: "OTHER",
        tableIds: ["2"],
      },
    ],
  );
});

test("drops unknown plaza tables and appends the rest of the salon", () => {
  const groups = organizeFloorGroups(physical, [
    plaza("mine", "Barra", ["missing", "1"], true),
    plaza("empty", "Sin mesas visibles", ["missing"], false),
  ]);
  assert.deepEqual(
    groups.map((group) => group.key),
    ["plaza-mine", "unassigned"],
  );
  assert.deepEqual(
    groups[1]?.tables.map((table) => table.id),
    ["2", "3"],
  );
});

test("keeps other plazas after own plazas regardless of their input order", () => {
  const groups = organizeFloorGroups(physical, [
    plaza("mine", "Norte", ["1"], true),
    plaza("other", "Sur", ["2"], false),
  ]);
  assert.deepEqual(
    groups.map((group) => group.organization),
    ["MINE", "OTHER", "REST"],
  );
});
