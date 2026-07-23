import Fastify, { type FastifyInstance } from "fastify";
import { buildContainer, type Container } from "./composition/container.js";
import { registerHealthRoutes } from "./routes/health.js";
import { registerMeRoutes } from "./routes/me.js";
import { registerTenantRoutes } from "./routes/tenants.js";
import { registerBrandRoutes } from "./routes/brands.js";
import { registerFiscalEntityRoutes } from "./routes/fiscal-entities.js";
import { registerBranchRoutes } from "./routes/branches.js";
import { registerSalonRoutes } from "./routes/salons.js";
import { registerTableRoutes } from "./routes/tables.js";
import { registerUserRoutes } from "./routes/users.js";
import { registerRoleRoutes } from "./routes/roles.js";
import { registerSubscriptionRoutes } from "./routes/subscriptions.js";
import { registerEntitlementRoutes } from "./routes/entitlements.js";

// SPEC-211 — app.ts instantiates and wires plugins/routes without listen().
// server.ts (local/process) and api/serverless.ts (Vercel) both consume this.
export async function buildApp(container?: Container): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });
  const resolvedContainer = container ?? (await buildContainer());

  await registerHealthRoutes(app, resolvedContainer);
  await registerMeRoutes(app, resolvedContainer);
  await registerTenantRoutes(app, resolvedContainer);
  await registerBrandRoutes(app, resolvedContainer);
  await registerFiscalEntityRoutes(app, resolvedContainer);
  await registerBranchRoutes(app, resolvedContainer);
  await registerSalonRoutes(app, resolvedContainer);
  await registerTableRoutes(app, resolvedContainer);
  await registerUserRoutes(app, resolvedContainer);
  await registerRoleRoutes(app, resolvedContainer);
  await registerSubscriptionRoutes(app, resolvedContainer);
  await registerEntitlementRoutes(app, resolvedContainer);

  return app;
}
