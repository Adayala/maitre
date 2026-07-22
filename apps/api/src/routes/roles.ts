import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { ROLE_REGISTRY } from "@maitre/identity";
import type { Container } from "../composition/container.js";
import { requireTenantContext, requirePermission } from "../http/request-context.js";
import { sendProblem, notFound } from "../http/problem-details.js";

// SPEC-022 — Roles API (read-only; catalog is predefined, SPEC-018).
export async function registerRoleRoutes(
  app: FastifyInstance,
  container: Container,
): Promise<void> {
  app.get("/v1/roles", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "role:read");
      const roles = Object.values(ROLE_REGISTRY).sort((a, b) => a.id.localeCompare(b.id));
      return { data: roles };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{ Params: { id: string } }>("/v1/roles/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "role:read");
      const role = ROLE_REGISTRY[req.params.id];
      if (!role) return sendProblem(reply, correlationId, notFound("Role"));
      return { data: role };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get("/v1/permissions", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "permission:read");
      const ids = new Set<string>();
      for (const role of Object.values(ROLE_REGISTRY)) {
        for (const permissionId of role.permissions) {
          if (permissionId !== "*") ids.add(permissionId);
        }
      }
      const permissions = [...ids].sort().map((id) => {
        const [resource, action] = id.split(":");
        return { id, resource, action };
      });
      return { data: permissions };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });
}
