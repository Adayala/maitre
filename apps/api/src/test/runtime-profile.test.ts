import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveRuntimeProfile } from "../composition/container.js";

test("runtime profile keeps memory and fixture adapters local by default", () => {
  assert.deepEqual(resolveRuntimeProfile({}), {
    environment: "local",
    persistenceDriver: "memory",
    authenticationDriver: "fixture",
    durable: false,
  });
});

test("runtime profile auto-selects Supabase only with complete persistence credentials", () => {
  assert.deepEqual(
    resolveRuntimeProfile({
      APP_ENV: "production",
      PERSISTENCE_DRIVER: "supabase",
      AUTH_DRIVER: "supabase",
      SUPABASE_URL: "https://project.example.test",
      SUPABASE_SECRET_KEY: "unit-test-key",
    }),
    {
      environment: "production",
      persistenceDriver: "supabase",
      authenticationDriver: "supabase",
      durable: true,
    },
  );
});

test("shared and production environments fail closed on ephemeral adapters", () => {
  assert.throws(
    () => resolveRuntimeProfile({ APP_ENV: "production" }),
    /PERSISTENCE_DRIVER must be explicitly configured/,
  );
  assert.throws(
    () =>
      resolveRuntimeProfile({
        VERCEL_ENV: "preview",
        PERSISTENCE_DRIVER: "memory",
        AUTH_DRIVER: "fixture",
      }),
    /Durable persistence is required/,
  );
  assert.throws(
    () =>
      resolveRuntimeProfile({
        APP_ENV: "demo",
        PERSISTENCE_DRIVER: "supabase",
        AUTH_DRIVER: "fixture",
        SUPABASE_URL: "https://project.example.test",
        SUPABASE_SECRET_KEY: "unit-test-key",
      }),
    /Supabase authentication is required/,
  );
});

test("Supabase composition fails before startup when required credentials are incomplete", () => {
  assert.throws(
    () =>
      resolveRuntimeProfile({
        APP_ENV: "local",
        PERSISTENCE_DRIVER: "supabase",
        SUPABASE_URL: "https://project.example.test",
      }),
    /server-side Supabase secret/,
  );
  assert.throws(
    () =>
      resolveRuntimeProfile({
        APP_ENV: "local",
        AUTH_DRIVER: "supabase",
      }),
    /SUPABASE_URL is required/,
  );
});

test("unknown drivers fail instead of silently falling back", () => {
  assert.throws(
    () =>
      resolveRuntimeProfile({
        PERSISTENCE_DRIVER: "postgres",
      }),
    /Unsupported PERSISTENCE_DRIVER/,
  );
  assert.throws(
    () =>
      resolveRuntimeProfile({
        AUTH_DRIVER: "mock",
      }),
    /Unsupported AUTH_DRIVER/,
  );
});
