import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export function parseEnvironmentFile(contents) {
  const environment = {};
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const normalized = line.startsWith("export ") ? line.slice(7) : line;
    const separator = normalized.indexOf("=");
    if (separator < 1) {
      throw new Error("Invalid environment file entry");
    }
    const name = normalized.slice(0, separator).trim();
    const rawValue = normalized.slice(separator + 1).trim();
    if (!/^[A-Z][A-Z0-9_]*$/.test(name)) {
      throw new Error(`Invalid environment variable name: ${name}`);
    }
    environment[name] = unquote(rawValue);
  }
  return environment;
}

export function validateDeploymentRuntimeProfile(environment, expected) {
  const configuredEnvironment = environment["APP_ENV"];
  if (configuredEnvironment !== expected) {
    throw new Error(
      `APP_ENV must equal ${expected}; received ${configuredEnvironment ?? "missing"}`,
    );
  }
  if (environment["PERSISTENCE_DRIVER"] !== "supabase") {
    throw new Error(
      "PERSISTENCE_DRIVER must equal supabase for a shared deployment",
    );
  }
  if (environment["AUTH_DRIVER"] !== "supabase") {
    throw new Error("AUTH_DRIVER must equal supabase for a shared deployment");
  }
  if (!environment["SUPABASE_URL"]) {
    throw new Error("SUPABASE_URL is required for a shared deployment");
  }
  if (
    !environment["SUPABASE_SECRET_KEY"] &&
    !environment["SUPABASE_SERVICE_ROLE_KEY"]
  ) {
    throw new Error(
      "A server-side Supabase secret is required for a shared deployment",
    );
  }
  const corsAllowedOrigins = validateCorsAllowedOrigins(
    environment["CORS_ALLOWED_ORIGINS"],
  );
  return {
    environment: expected,
    persistenceDriver: "supabase",
    authenticationDriver: "supabase",
    durable: true,
    supabaseUrlConfigured: true,
    serverCredentialConfigured: true,
    corsAllowedOriginCount: corsAllowedOrigins.length,
  };
}

export function validateCorsAllowedOrigins(value) {
  if (!value) {
    throw new Error("CORS_ALLOWED_ORIGINS is required for a shared deployment");
  }
  const origins = [...new Set(value.split(",").map((origin) => origin.trim()))];
  if (origins.some((origin) => !origin)) {
    throw new Error("CORS_ALLOWED_ORIGINS contains an empty origin");
  }
  for (const origin of origins) {
    let parsed;
    try {
      parsed = new URL(origin);
    } catch {
      throw new Error(
        `CORS_ALLOWED_ORIGINS contains an invalid URL: ${origin}`,
      );
    }
    if (
      parsed.origin !== origin ||
      !["http:", "https:"].includes(parsed.protocol) ||
      parsed.username ||
      parsed.password ||
      parsed.hostname.includes("*")
    ) {
      throw new Error(
        `CORS_ALLOWED_ORIGINS must contain exact HTTP(S) origins: ${origin}`,
      );
    }
  }
  return origins;
}

async function main() {
  const args = parseArguments(process.argv.slice(2));
  const contents = await readFile(resolve(args.envFile), "utf8");
  const environment = parseEnvironmentFile(contents);
  const result = validateDeploymentRuntimeProfile(environment, args.expected);
  process.stdout.write(`Runtime profile passed: ${JSON.stringify(result)}\n`);
}

function parseArguments(args) {
  const envFileIndex = args.indexOf("--env-file");
  const expectedIndex = args.indexOf("--expect");
  const envFile = envFileIndex >= 0 ? args[envFileIndex + 1] : undefined;
  const expected = expectedIndex >= 0 ? args[expectedIndex + 1] : undefined;
  if (!envFile || !expected) {
    throw new Error(
      "Usage: check-runtime-profile.mjs --env-file <path> --expect <environment>",
    );
  }
  return { envFile, expected };
}

function unquote(value) {
  if (
    value.length >= 2 &&
    ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'")))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

const invokedPath = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : "";
if (import.meta.url === invokedPath) {
  await main();
}
