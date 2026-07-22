import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  createUser,
  inviteMembership,
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
  status: z.enum(["ACTIVE", "SUSPENDED", "DEACTIVATED"]).optional(),
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
      const membership = await container.memberships.findActiveByUserAndTenant(
        user.id,
        ctx.tenantId,
      );
      if (!membership) return sendProblem(reply, correlationId, notFound("User"));

      const body = omitUndefined(patchUserBodySchema.parse(req.body));
      const updated: User = {
        ...user,
        ...(body.name !== undefined ? { displayName: body.name } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
        updatedAt: new Date(),
      };
      await container.users.save(updated);

      return { data: toListItem(updated, membership) };
    } catch (err) {
      if (err instanceof z.ZodError) {
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
