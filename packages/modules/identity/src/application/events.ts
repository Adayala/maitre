import { randomUUID } from "node:crypto";
import type { Membership } from "../domain/membership.js";
import type { User } from "../domain/user.js";
import type { AuthenticatedPrincipal } from "./ports.js";
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

export interface UserAuthenticatedPayload {
  userId: string;
  provider: string;
  authMethod: string;
}

// SPEC-025 §Payload — audit-only fact of a successful authentication, not
// an authorization event. No token/password/full IP/raw user-agent/
// memberships. Tenant context is genuinely optional (this fires from
// GET /v1/me/context, SPEC-213's discovery endpoint, before any tenant is
// selected) — the outbox record itself carries no tenantId.
export function userAuthenticatedEvent(
  user: User,
  principal: AuthenticatedPrincipal,
  correlationId: string,
): OutboxRecord<UserAuthenticatedPayload> {
  return {
    eventId: randomUUID(),
    eventName: "UserAuthenticated",
    eventVersion: 1,
    occurredAt: principal.issuedAt,
    producer: "identity",
    aggregateType: "User",
    aggregateId: user.id,
    correlationId,
    payload: {
      userId: user.id,
      provider: principal.provider,
      authMethod: principal.provider,
    },
    status: "PENDING",
    attempts: 0,
  };
}
