import type { IncomingMessage, ServerResponse } from "node:http";
import { createTelemetryFromEnvironment } from "@maitre/telemetry";
import { buildApp } from "../src/app.js";

// SPEC-211 — Vercel adapter reusing the same Fastify instance as server.ts.
let appPromise: ReturnType<typeof buildApp> | undefined;
const runtimeTelemetry = createTelemetryFromEnvironment();

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  if (!appPromise) appPromise = buildApp(undefined, runtimeTelemetry.telemetry);
  const app = await appPromise;
  await app.ready();
  app.server.emit("request", req, res);
}
