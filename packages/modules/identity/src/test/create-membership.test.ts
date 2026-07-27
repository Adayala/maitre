import { test } from "node:test";
import assert from "node:assert/strict";
import { createMembership } from "../application/create-membership.js";
import { MembershipInvariantError } from "../domain/membership.js";
import type { Membership, MembershipRepositoryPort } from "../index.js";

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

const now = new Date("2026-05-01T00:00:00Z");

test("createMembership creates an ACTIVE membership with the given roles", async () => {
  const memberships = new FakeMembershipRepository();
  const membership = await createMembership(
    { memberships, now: () => now },
    {
      tenantId: "tenant-1",
      userId: "user-1",
      roleIds: ["role_owner"],
      branchScopeType: "ALL_BRANCHES",
    },
  );

  assert.equal(membership.status, "ACTIVE");
  assert.equal(membership.activatedAt, now);
});

test("createMembership rejects ACTIVE with no roles", async () => {
  const memberships = new FakeMembershipRepository();
  await assert.rejects(
    createMembership(
      { memberships, now: () => now },
      {
        tenantId: "tenant-1",
        userId: "user-1",
        roleIds: [],
        branchScopeType: "ALL_BRANCHES",
      },
    ),
    MembershipInvariantError,
  );
});

test("createMembership rejects SELECTED_BRANCHES with no branch ids", async () => {
  const memberships = new FakeMembershipRepository();
  await assert.rejects(
    createMembership(
      { memberships, now: () => now },
      {
        tenantId: "tenant-1",
        userId: "user-1",
        roleIds: ["role_owner"],
        branchScopeType: "SELECTED_BRANCHES",
      },
    ),
    MembershipInvariantError,
  );
});
