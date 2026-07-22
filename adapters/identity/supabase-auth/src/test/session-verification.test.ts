import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SupabaseSessionVerificationPort,
  InvalidTokenError,
} from "../session-verification.js";

// SPEC-224 §1/§5 — this is an adapter-contract test against the real
// Supabase project (JWKS verification cannot be meaningfully faked without
// re-implementing jose). Skips entirely when credentials aren't present
// (e.g. plain `node --test` in an environment without .env loaded) rather
// than failing the whole suite.
const SUPABASE_URL = process.env["SUPABASE_URL"];
const SUPABASE_SECRET_KEY = process.env["SUPABASE_SECRET_KEY"];
const SUPABASE_PUBLISHABLE_KEY = process.env["SUPABASE_PUBLISHABLE_KEY"];
const hasCredentials = Boolean(SUPABASE_URL && SUPABASE_SECRET_KEY && SUPABASE_PUBLISHABLE_KEY);

async function withThrowawayUser<T>(
  fn: (accessToken: string) => Promise<T>,
): Promise<T> {
  const email = `test-${Date.now()}-${Math.random().toString(36).slice(2)}@maitre-test.dev`;
  const password = `Test-${Math.random().toString(36).slice(2)}!Aa1`;

  const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SECRET_KEY!,
      Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  const created = (await createRes.json()) as { id: string };

  try {
    const tokenRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY!, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const tokenBody = (await tokenRes.json()) as { access_token: string };
    return await fn(tokenBody.access_token);
  } finally {
    await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${created.id}`, {
      method: "DELETE",
      headers: { apikey: SUPABASE_SECRET_KEY!, Authorization: `Bearer ${SUPABASE_SECRET_KEY}` },
    });
  }
}

test(
  "verifyAccessToken resolves a real Supabase Auth token to a principal",
  { skip: !hasCredentials },
  async () => {
    const verifier = new SupabaseSessionVerificationPort(SUPABASE_URL!);
    await withThrowawayUser(async (accessToken) => {
      const principal = await verifier.verifyAccessToken(accessToken);
      assert.equal(principal.provider, "supabase");
      assert.match(principal.subject, /^[0-9a-f-]{36}$/);
      assert.equal(principal.emailVerified, true);
      assert.ok(principal.expiresAt.getTime() > Date.now());
    });
  },
);

test(
  "verifyAccessToken rejects a tampered signature",
  { skip: !hasCredentials },
  async () => {
    const verifier = new SupabaseSessionVerificationPort(SUPABASE_URL!);
    await withThrowawayUser(async (accessToken) => {
      const tampered = accessToken.slice(0, -5) + "AAAAA";
      await assert.rejects(verifier.verifyAccessToken(tampered), InvalidTokenError);
    });
  },
);

test(
  "verifyAccessToken rejects a malformed token",
  { skip: !hasCredentials },
  async () => {
    const verifier = new SupabaseSessionVerificationPort(SUPABASE_URL!);
    await assert.rejects(
      verifier.verifyAccessToken("not-a-jwt-at-all"),
      InvalidTokenError,
    );
  },
);

test(
  "verifyAccessToken rejects a token whose issuer doesn't match this verifier's project",
  { skip: !hasCredentials },
  async () => {
    const wrongProjectVerifier = new SupabaseSessionVerificationPort(
      "https://wrong-project-ref.supabase.co",
    );
    await withThrowawayUser(async (accessToken) => {
      await assert.rejects(wrongProjectVerifier.verifyAccessToken(accessToken));
    });
  },
);
