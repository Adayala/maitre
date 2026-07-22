import Fastify, { type FastifyInstance } from "fastify";
import { buildContainer, type Container } from "./composition/container.js";
import { registerHealthRoutes } from "./routes/health.js";
import { registerMeRoutes } from "./routes/me.js";

// SPEC-211 — app.ts instantiates and wires plugins/routes without listen().
// server.ts (local/process) and api/serverless.ts (Vercel) both consume this.
export async function buildApp(container?: Container): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });
  const resolvedContainer = container ?? (await buildContainer());

  await registerHealthRoutes(app, resolvedContainer);
  await registerMeRoutes(app, resolvedContainer);

  return app;
}
