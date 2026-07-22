import { test } from "node:test";
import assert from "node:assert/strict";
import { userInvitedEvent } from "../application/events.js";
import type { Membership } from "../index.js";

const now = new Date("2026-05-01T00:00:00Z");
const correlationId = "99999999-9999-9999-9999-999999999999";

function anInvitation(overrides: Partial<Membership> = {}): Membership {
  return {
    id: "88888888-8888-8888-8888-888888888888",
    tenantId: "11111111-1111-1111-1111-111111111111",
    userId: "77777777-7777-7777-7777-777777777777",
    status: "INVITED",
    branchScopeType: "ALL_BRANCHES",
    roleIds: ["role_employee"],
    branchIds: [],
    invitedAt: now,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

test("userInvitedEvent has the SPEC-024 envelope shape and minimal payload", () => {
  const membership = anInvitation();
  const event = userInvitedEvent(membership, correlationId);

  assert.equal(event.eventName, "UserInvited");
  assert.equal(event.aggregateType, "MembershipInvitation");
  assert.equal(event.aggregateId, membership.id);
  assert.equal(event.tenantId, membership.tenantId);
  assert.deepEqual(event.payload, {
    invitationId: membership.id,
    tenantId: membership.tenantId,
    userId: membership.userId,
    createdAt: membership.createdAt,
  });
});

test("userInvitedEvent payload excludes email, name, roles and invite link", () => {
  const event = userInvitedEvent(anInvitation(), correlationId);
  assert.equal("email" in event.payload, false);
  assert.equal("name" in event.payload, false);
  assert.equal("roleIds" in event.payload, false);
  assert.equal("inviteLink" in event.payload, false);
});

test("userInvitedEvent includes invitedBy only when the membership has a createdBy actor", () => {
  const withActor = userInvitedEvent(
    anInvitation({ createdBy: "actor-1" }),
    correlationId,
  );
  assert.equal(withActor.payload.invitedBy, "actor-1");

  const withoutActor = userInvitedEvent(anInvitation(), correlationId);
  assert.equal("invitedBy" in withoutActor.payload, false);
});
