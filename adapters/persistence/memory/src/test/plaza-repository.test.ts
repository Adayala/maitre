import assert from "node:assert/strict";
import test from "node:test";
import type { Plaza } from "@maitre/floor";
import { InMemoryPlazaRepository } from "../plaza-repository.js";

const plaza: Plaza = {
  id: "plaza-a",
  tenantId: "tenant-a",
  branchId: "branch-a",
  salonId: "salon-a",
  servicePeriodId: "period-a",
  name: "Terraza",
  mode: "FIXED",
  waiterEmploymentId: null,
  tableIds: ["table-a"],
  createdAt: new Date("2026-08-01T12:00:00Z"),
  updatedAt: new Date("2026-08-01T12:00:00Z"),
};

test("in-memory plaza repository scopes every lookup by tenant and hierarchy", async () => {
  const repository = new InMemoryPlazaRepository();
  await repository.save(plaza);
  assert.equal(await repository.findById("tenant-a", plaza.id), plaza);
  assert.equal(await repository.findById("tenant-b", plaza.id), null);
  assert.deepEqual(await repository.listBySalon("tenant-a", "salon-a"), [
    plaza,
  ]);
  assert.deepEqual(await repository.listBySalon("tenant-a", "other"), []);
  assert.deepEqual(
    await repository.listByServicePeriod("tenant-a", "period-a"),
    [plaza],
  );
  assert.deepEqual(
    await repository.listByServicePeriod("tenant-b", "period-a"),
    [],
  );
  assert.equal(
    await repository.findByTableInServicePeriod(
      "tenant-a",
      "period-a",
      "table-a",
    ),
    plaza,
  );
  assert.equal(
    await repository.findByTableInServicePeriod(
      "tenant-a",
      "period-a",
      "other",
    ),
    null,
  );
});
