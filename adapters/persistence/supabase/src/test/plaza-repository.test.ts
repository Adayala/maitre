import assert from "node:assert/strict";
import test from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Plaza } from "@maitre/floor";
import { SupabasePlazaRepository } from "../plaza-repository.js";

interface ScriptedResult {
  data?: unknown;
  error?: unknown;
}

class ScriptedQuery implements PromiseLike<ScriptedResult> {
  constructor(
    private readonly results: ScriptedResult[],
    readonly calls: string[],
  ) {}
  select(value: string) {
    this.calls.push(`select:${value}`);
    return this;
  }
  eq(column: string, value: unknown) {
    this.calls.push(`eq:${column}:${String(value)}`);
    return this;
  }
  in(column: string, values: unknown[]) {
    this.calls.push(`in:${column}:${values.join(",")}`);
    return this;
  }
  upsert(value: unknown) {
    this.calls.push(`upsert:${JSON.stringify(value)}`);
    return Promise.resolve(this.results.shift() ?? {});
  }
  insert(value: unknown) {
    this.calls.push(`insert:${JSON.stringify(value)}`);
    return Promise.resolve(this.results.shift() ?? {});
  }
  delete() {
    this.calls.push("delete");
    return this;
  }
  maybeSingle() {
    this.calls.push("maybeSingle");
    return Promise.resolve(this.results.shift() ?? {});
  }
  then<TResult1 = ScriptedResult, TResult2 = never>(
    onfulfilled?:
      ((value: ScriptedResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return Promise.resolve(this.results.shift() ?? {}).then(
      onfulfilled,
      onrejected,
    );
  }
}

function client(results: ScriptedResult[]) {
  const calls: string[] = [];
  return {
    calls,
    value: {
      from(table: string) {
        calls.push(`from:${table}`);
        return new ScriptedQuery(results, calls);
      },
    } as unknown as SupabaseClient,
  };
}

const row = {
  id: "plaza-a",
  tenant_id: "tenant-a",
  branch_id: "branch-a",
  salon_id: "salon-a",
  service_period_id: "period-a",
  name: "Terraza",
  waiter_employment_id: "employment-a",
  created_at: "2026-08-01T12:00:00.000Z",
  updated_at: "2026-08-01T13:00:00.000Z",
};

const plaza: Plaza = {
  id: "plaza-a",
  tenantId: "tenant-a",
  branchId: "branch-a",
  salonId: "salon-a",
  servicePeriodId: "period-a",
  name: "Terraza",
  waiterEmploymentId: "employment-a",
  tableIds: ["table-a"],
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
};

test("supabase plaza repository maps rows, links and hierarchy filters", async () => {
  const scripted = client([
    { data: [row], error: null },
    {
      data: [
        { plaza_id: "another-plaza", table_id: "ignored" },
        { plaza_id: row.id, table_id: "table-a" },
      ],
      error: null,
    },
    { data: [row], error: null },
    { data: [], error: null },
    { data: [row], error: null },
    { data: [], error: null },
  ]);
  const repository = new SupabasePlazaRepository(scripted.value);
  assert.deepEqual(await repository.findById("tenant-a", row.id), plaza);
  assert.deepEqual(await repository.listBySalon("tenant-a", "salon-a"), [
    { ...plaza, tableIds: [] },
  ]);
  assert.deepEqual(
    await repository.listByServicePeriod("tenant-a", "period-a"),
    [{ ...plaza, tableIds: [] }],
  );
  assert.ok(scripted.calls.includes("eq:salon_id:salon-a"));
  assert.ok(scripted.calls.includes("eq:service_period_id:period-a"));
});

test("supabase plaza repository returns empty and resolves table conflicts", async () => {
  const scripted = client([
    { data: [], error: null },
    { data: null, error: null },
    { data: { plaza_id: row.id }, error: null },
    { data: [row], error: null },
    { data: [], error: null },
  ]);
  const repository = new SupabasePlazaRepository(scripted.value);
  assert.equal(await repository.findById("tenant-a", "missing"), null);
  assert.equal(
    await repository.findByTableInServicePeriod(
      "tenant-a",
      "period-a",
      "missing",
    ),
    null,
  );
  assert.deepEqual(
    await repository.findByTableInServicePeriod(
      "tenant-a",
      "period-a",
      "table-a",
    ),
    { ...plaza, tableIds: [] },
  );
});

test("supabase plaza repository rewrites normalized table links on save", async () => {
  const scripted = client([
    { error: null },
    { error: null },
    { error: null },
    { error: null },
    { error: null },
  ]);
  const repository = new SupabasePlazaRepository(scripted.value);
  await repository.save(plaza);
  await repository.save({
    ...plaza,
    id: "plaza-empty",
    waiterEmploymentId: null,
    tableIds: [],
  });
  assert.equal(scripted.calls.filter((call) => call === "delete").length, 2);
  assert.equal(
    scripted.calls.filter((call) => call.startsWith("insert:")).length,
    1,
  );
  assert.ok(
    scripted.calls.some((call) => call.includes('"table_id":"table-a"')),
  );
});

test("supabase plaza repository propagates storage errors", async () => {
  const expected = new Error("storage unavailable");
  const repository = new SupabasePlazaRepository(
    client([{ data: null, error: expected }]).value,
  );
  await assert.rejects(repository.findById("tenant-a", "plaza-a"), expected);

  const linkRead = new SupabasePlazaRepository(
    client([{ data: null, error: expected }]).value,
  );
  await assert.rejects(
    linkRead.findByTableInServicePeriod("tenant-a", "period-a", "table-a"),
    expected,
  );

  const tableRead = new SupabasePlazaRepository(
    client([
      { data: [row], error: null },
      { data: null, error: expected },
    ]).value,
  );
  await assert.rejects(tableRead.findById("tenant-a", row.id), expected);

  for (const results of [
    [{ error: expected }],
    [{ error: null }, { error: expected }],
    [{ error: null }, { error: null }, { error: expected }],
  ]) {
    const write = new SupabasePlazaRepository(client(results).value);
    await assert.rejects(write.save(plaza), expected);
  }
});
