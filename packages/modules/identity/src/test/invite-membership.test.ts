import { test } from "node:test";
import assert from "node:assert/strict";
import { inviteMembership } from "../application/invite-membership.js";
import { MembershipInvariantError } from "../domain/membership.js";
import type { Membership, MembershipRepositoryPort, OutboxPort, OutboxRecord } from "../index.js";

class FakeMembershipRepository implements MembershipRepositoryPort {
  private readonly items: Membership[] = [];
  async listActiveByUser(userId: string) {
    return this.items.filter((m) => m.userId === userId && m.status === "ACTIVE");
  }
  async listByUser(userId: string) {
    return this.items.filter((m) => m.userId === userId);
  }
  async findActiveByUserAndTenant(userId: string, tenantId: string) {
    return (
      this.items.find(
        (m) => m.userId === userId && m.tenantId === tenantId && m.status === "ACTIVE",
      ) ?? null
    );
  }
  async listByTenant(tenantId: string) {
    return this.items.filter((m) => m.tenantId === tenantId);
  }
  async findById(tenantId: string, id: string) {
    return this.items.find((m) => m.tenantId === tenantId && m.id === id) ?? null;
  }
  async save(membership: Membership) {
    const index = this.items.findIndex((item) => item.id === membership.id);
    if (index >= 0) this.items[index] = membership;
    else this.items.push(membership);
  }
}

class FakeOutboxRepository implements OutboxPort {
  readonly records: OutboxRecord[] = [];
  async append(record: OutboxRecord) {
    this.records.push(record);
  }
}

const now = new Date("2026-05-01T00:00:00Z");

test("inviteMembership creates an INVITED membership (not ACTIVE)", async () => {
  const memberships = new FakeMembershipRepository();
  const outbox = new FakeOutboxRepository();
  const membership = await inviteMembership(
    { memberships, outbox, now: () => now },
    {
      tenantId: "tenant-1",
      userId: "user-1",
      roleIds: ["role_employee"],
      branchScopeType: "ALL_BRANCHES",
    },
  );

  assert.equal(membership.status, "INVITED");
  assert.equal(membership.invitedAt, now);
  assert.equal(membership.activatedAt, null);
});

test("an INVITED membership does not require roles (unlike ACTIVE)", async () => {
  const memberships = new FakeMembershipRepository();
  const outbox = new FakeOutboxRepository();
  const membership = await inviteMembership(
    { memberships, outbox, now: () => now },
    { tenantId: "tenant-1", userId: "user-1", roleIds: [], branchScopeType: "ALL_BRANCHES" },
  );
  assert.equal(membership.status, "INVITED");
});

test("inviteMembership still rejects SELECTED_BRANCHES with no branch ids", async () => {
  const memberships = new FakeMembershipRepository();
  const outbox = new FakeOutboxRepository();
  await assert.rejects(
    inviteMembership(
      { memberships, outbox, now: () => now },
      {
        tenantId: "tenant-1",
        userId: "user-1",
        roleIds: ["role_employee"],
        branchScopeType: "SELECTED_BRANCHES",
      },
    ),
    MembershipInvariantError,
  );
});

test("inviteMembership appends UserInvited to the outbox", async () => {
  const memberships = new FakeMembershipRepository();
  const outbox = new FakeOutboxRepository();
  const membership = await inviteMembership(
    { memberships, outbox, now: () => now },
    {
      tenantId: "tenant-1",
      userId: "user-1",
      roleIds: ["role_employee"],
      branchScopeType: "ALL_BRANCHES",
    },
  );

  assert.equal(outbox.records.length, 1);
  assert.equal(outbox.records[0]!.eventName, "UserInvited");
  assert.equal(outbox.records[0]!.aggregateId, membership.id);
});
