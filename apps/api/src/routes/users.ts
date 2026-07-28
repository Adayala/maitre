import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  createUser,
  inviteMembership,
  assertMembershipInvariants,
  canTransitionMembership,
  MembershipInvariantError,
  type Membership,
  type User,
} from "@maitre/identity";
import type { Container } from "../composition/container.js";
import { requireTenantContext, requirePermission } from "../http/request-context.js";
import { sendProblem, notFound, badRequest } from "../http/problem-details.js";
import { parsePagination, paginate } from "../http/pagination.js";
import { omitUndefined } from "../http/omit-undefined.js";

// SPEC-021 — Users API. POST invites: creates a placeholder domain User
// plus an INVITED Membership for the tenant (SPEC-020), emitting
// UserInvited (SPEC-024). There is no acceptance/linking flow yet — that
// requires a real Supabase Auth signup to claim the invite, out of scope
// for I0 (see SPEC-017 §Provisioning).
const inviteUserBodySchema = z.object({
  email: z.string().email(),
  name: z.string().trim().min(1).max(100),
  roleIds: z.array(z.string()).default(["role_employee"]),
});

const patchUserBodySchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  membershipStatus: z.enum(["ACTIVE", "SUSPENDED", "REVOKED"]).optional(),
  roleIds: z.array(z.string()).min(1).optional(),
});

interface UserListItem {
  id: string;
  email: string | null | undefined;
  name: string;
  status: string;
  membershipId: string;
  roleIds: string[];
}

function toListItem(user: User, membership: Membership): UserListItem {
  return {
    id: user.id,
    email: user.email,
    name: user.displayName,
    status: membership.status,
    membershipId: membership.id,
    roleIds: membership.roleIds,
  };
}

export async function registerUserRoutes(
  app: FastifyInstance,
  container: Container,
): Promise<void> {
  app.post("/v1/users", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "user:create");
      const body = inviteUserBodySchema.parse(req.body);

      const user = await createUser(
        { users: container.users },
        { displayName: body.name, email: body.email, actorId: ctx.userId },
      );
      const membership = await inviteMembership(
        { memberships: container.memberships, outbox: container.outbox },
        {
          tenantId: ctx.tenantId,
          userId: user.id,
          roleIds: body.roleIds,
          branchScopeType: "ALL_BRANCHES",
          actorId: ctx.userId,
          correlationId,
        },
      );

      reply.code(201);
      return { data: toListItem(user, membership) };
    } catch (err) {
      if (err instanceof MembershipInvariantError || err instanceof z.ZodError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get("/v1/users", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "user:read");

      const memberships = await container.memberships.listByTenant(ctx.tenantId);
      const items: UserListItem[] = [];
      for (const membership of memberships) {
        const user = await container.users.findById(membership.userId);
        if (user) items.push(toListItem(user, membership));
      }
      return paginate(items, parsePagination(req));
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{ Params: { id: string } }>("/v1/users/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "user:read");

      const user = await container.users.findById(req.params.id);
      if (!user) return sendProblem(reply, correlationId, notFound("User"));
      const membership = await container.memberships.findActiveByUserAndTenant(
        user.id,
        ctx.tenantId,
      );
      const invited = membership ?? (await findInvitedMembership(container, ctx.tenantId, user.id));
      if (!invited) return sendProblem(reply, correlationId, notFound("User"));

      return { data: toListItem(user, invited) };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.patch<{ Params: { id: string } }>("/v1/users/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "user:write");

      const user = await container.users.findById(req.params.id);
      if (!user) return sendProblem(reply, correlationId, notFound("User"));
      const membership = (await container.memberships.listByTenant(ctx.tenantId))
        .find((item) => item.userId === user.id);
      if (!membership) return sendProblem(reply, correlationId, notFound("User"));

      const body = omitUndefined(patchUserBodySchema.parse(req.body));
      if (
        body.membershipStatus !== undefined &&
        body.membershipStatus !== membership.status &&
        !canTransitionMembership(membership.status, body.membershipStatus)
      ) {
        throw new MembershipInvariantError(
          `Membership cannot transition from ${membership.status} to ${body.membershipStatus}`,
        );
      }
      const updated: User = {
        ...user,
        ...(body.name !== undefined ? { displayName: body.name } : {}),
        updatedAt: new Date(),
      };
      const now = new Date();
      const updatedMembership: Membership = {
        ...membership,
        ...(body.roleIds !== undefined ? { roleIds: body.roleIds } : {}),
        ...(body.membershipStatus !== undefined ? { status: body.membershipStatus } : {}),
        ...(body.membershipStatus === "ACTIVE" ? { activatedAt: now } : {}),
        ...(body.membershipStatus === "SUSPENDED" ? { suspendedAt: now } : {}),
        ...(body.membershipStatus === "REVOKED" ? { revokedAt: now } : {}),
        updatedAt: now,
        updatedBy: ctx.userId,
      };
      assertMembershipInvariants(updatedMembership);
      await container.users.save(updated);
      await container.memberships.save(updatedMembership);

      return { data: toListItem(updated, updatedMembership) };
    } catch (err) {
      if (err instanceof z.ZodError || err instanceof MembershipInvariantError) {
        return sendProblem(reply, correlationId, badRequest(err.message));
      }
      return sendProblem(reply, correlationId, err);
    }
  });
}

async function findInvitedMembership(
  container: Container,
  tenantId: string,
  userId: string,
): Promise<Membership | null> {
  const memberships = await container.memberships.listByTenant(tenantId);
  return memberships.find((m) => m.userId === userId) ?? null;
}
