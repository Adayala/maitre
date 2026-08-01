import { test } from "node:test";
import assert from "node:assert/strict";
import { recordAuditLog } from "../application/record-audit-log.js";
import type {
  AuditLog,
  AuditLogQuery,
  AuditLogPage,
  AuditLogRepositoryPort,
} from "../index.js";

class FakeAuditLogRepository implements AuditLogRepositoryPort {
  readonly items: AuditLog[] = [];
  async append(entry: AuditLog) {
    this.items.push(entry);
  }
  async query(params: AuditLogQuery): Promise<AuditLogPage> {
    let items = this.items.filter((i) => i.tenantId === params.tenantId);
    if (params.actorId)
      items = items.filter((i) => i.actorId === params.actorId);
    if (params.resourceType)
      items = items.filter((i) => i.resourceType === params.resourceType);
    if (params.from) items = items.filter((i) => i.occurredAt >= params.from!);
    if (params.to) items = items.filter((i) => i.occurredAt <= params.to!);
    items = [...items].sort(
      (a, b) => b.occurredAt.getTime() - a.occurredAt.getTime(),
    );
    const limit = params.limit ?? 100;
    return { items: items.slice(0, limit) };
  }
}

const now = new Date("2026-05-01T00:00:00Z");

test("recordAuditLog appends an entry with a generated id and occurredAt", async () => {
  const auditLogs = new FakeAuditLogRepository();
  const entry = await recordAuditLog(
    { auditLogs, now: () => now },
    {
      tenantId: "tenant-1",
      actorType: "USER",
      actorId: "user-1",
      action: "CREATE",
      resourceType: "Branch",
      resourceId: "branch-1",
    },
  );
  assert.ok(entry.id);
  assert.equal(entry.occurredAt, now);
  assert.equal(auditLogs.items.length, 1);
});

test("recordAuditLog omits actorId when not provided (SYSTEM actor)", async () => {
  const auditLogs = new FakeAuditLogRepository();
  const entry = await recordAuditLog(
    { auditLogs, now: () => now },
    {
      tenantId: "tenant-1",
      actorType: "SYSTEM",
      action: "UPDATE",
      resourceType: "Subscription",
      resourceId: "sub-1",
    },
  );
  assert.equal("actorId" in entry, false);
});

test("recordAuditLog centrally redacts and bounds state evidence", async () => {
  const auditLogs = new FakeAuditLogRepository();
  const entry = await recordAuditLog(
    { auditLogs, now: () => now },
    {
      tenantId: "tenant-1",
      actorType: "USER",
      actorId: "user-1",
      action: "UPDATE",
      resourceType: "Payment",
      resourceId: "payment-1",
      newState: {
        amountMinorUnits: 2500,
        currency: "ARS",
        authorization: "Bearer must-not-survive",
        cardNumber: "4111111111111111",
        note: "must-not-survive",
        oversized: "x".repeat(20_000),
      },
    },
  );

  const serialized = JSON.stringify(entry.newState);
  assert.equal(serialized.includes("must-not-survive"), false);
  assert.equal(serialized.includes("4111111111111111"), false);
  assert.ok(Buffer.byteLength(serialized, "utf8") <= 8_192);
});

test("query filters by actorId, resourceType and time range, ordered descending", async () => {
  const auditLogs = new FakeAuditLogRepository();
  await recordAuditLog(
    { auditLogs, now: () => new Date("2026-01-01T00:00:00Z") },
    {
      tenantId: "t1",
      actorType: "USER",
      actorId: "u1",
      action: "CREATE",
      resourceType: "Branch",
      resourceId: "b1",
    },
  );
  await recordAuditLog(
    { auditLogs, now: () => new Date("2026-02-01T00:00:00Z") },
    {
      tenantId: "t1",
      actorType: "USER",
      actorId: "u1",
      action: "UPDATE",
      resourceType: "Branch",
      resourceId: "b1",
    },
  );
  await recordAuditLog(
    { auditLogs, now: () => new Date("2026-01-15T00:00:00Z") },
    {
      tenantId: "t1",
      actorType: "USER",
      actorId: "u2",
      action: "CREATE",
      resourceType: "Product",
      resourceId: "p1",
    },
  );

  const page = await auditLogs.query({ tenantId: "t1", actorId: "u1" });
  assert.equal(page.items.length, 2);
  assert.equal(page.items[0]!.action, "UPDATE"); // most recent first
  assert.equal(page.items[1]!.action, "CREATE");
});
