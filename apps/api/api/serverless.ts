import type { VercelRequest, VercelResponse } from "@vercel/node";
import { buildApp } from "../src/app.js";

// SPEC-211 — Vercel adapter reusing the same Fastify instance as server.ts.
let appPromise: ReturnType<typeof buildApp> | undefined;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!appPromise) appPromise = buildApp();
  const app = await appPromise;
  await app.ready();
  app.server.emit("request", req, res);
}
