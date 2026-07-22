import { randomUUID } from "node:crypto";
import type { Membership } from "../domain/membership.js";
import type { OutboxRecord } from "./outbox.js";

export interface UserInvitedPayload {
  invitationId: string;
  tenantId: string;
  userId: string;
  invitedBy?: string;
  createdAt: Date;
}

// SPEC-024 §Payload mínimo — no email/name/token/invite link. The
// invitation's own record (the Membership row, status INVITED) is the
// aggregate; consumers fetch contact details via an authorized read if
// they need them, they don't get a copy in the event.
export function userInvitedEvent(
  membership: Membership,
  correlationId: string,
): OutboxRecord<UserInvitedPayload> {
  return {
    eventId: randomUUID(),
    eventName: "UserInvited",
    eventVersion: 1,
    occurredAt: membership.createdAt,
    producer: "identity",
    tenantId: membership.tenantId,
    aggregateType: "MembershipInvitation",
    aggregateId: membership.id,
    correlationId,
    payload: {
      invitationId: membership.id,
      tenantId: membership.tenantId,
      userId: membership.userId,
      createdAt: membership.createdAt,
      ...(membership.createdBy ? { invitedBy: membership.createdBy } : {}),
    },
    status: "PENDING",
    attempts: 0,
  };
}
