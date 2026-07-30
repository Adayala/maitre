import assert from "node:assert/strict";
import test from "node:test";
import { resolveSupabaseCredentials } from "../client.js";

test("resolves the current Supabase secret key", () => {
  assert.deepEqual(
    resolveSupabaseCredentials({
      SUPABASE_URL: "http://127.0.0.1:54321",
      SUPABASE_SECRET_KEY: "sb_secret_test",
    }),
    {
      url: "http://127.0.0.1:54321",
      key: "sb_secret_test",
    },
  );
});

test("accepts the local CLI service-role key", () => {
  assert.deepEqual(
    resolveSupabaseCredentials({
      SUPABASE_URL: "http://127.0.0.1:54321",
      SUPABASE_SERVICE_ROLE_KEY: "local-service-role",
    }),
    {
      url: "http://127.0.0.1:54321",
      key: "local-service-role",
    },
  );
});

test("fails closed when the URL or server credential is absent", () => {
  assert.throws(
    () => resolveSupabaseCredentials({ SUPABASE_URL: "http://localhost" }),
    /server-side Supabase secret/,
  );
  assert.throws(
    () => resolveSupabaseCredentials({ SUPABASE_SECRET_KEY: "secret" }),
    /SUPABASE_URL/,
  );
});
