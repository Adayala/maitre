import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import WebSocket from "ws";

/**
 * SPEC-210 — Supabase adapter boundary. The Fastify backend authenticates
 * with the secret key (service_role equivalent), which bypasses RLS; RLS
 * policies remain as defense in depth against any future direct/anon path.
 * Talks to Postgres via PostgREST (HTTPS), not the wire protocol — no DB
 * password is used or required.
 */
export function createSupabaseClient(): SupabaseClient {
  const { url, key } = resolveSupabaseCredentials();
  // Node 20 has no native WebSocket; supabase-js's realtime client (unused
  // by our REST-only repositories) still initializes eagerly and needs one.
  return createClient(url, key, {
    auth: { persistSession: false },
    realtime: { transport: WebSocket } as never,
  });
}

export function resolveSupabaseCredentials(
  env: NodeJS.ProcessEnv = process.env,
): { url: string; key: string } {
  const url = env["SUPABASE_URL"];
  const key =
    env["SUPABASE_SECRET_KEY"] ?? env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL and a server-side Supabase secret must be set to use the Supabase adapters",
    );
  }
  return { url, key };
}
