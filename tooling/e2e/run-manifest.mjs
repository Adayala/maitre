const PROFILES = new Set(["local-memory", "release-postgres"]);
const ROLES = ["waiter", "cook", "cashier", "auditor", "tenantB"];

export function createRunManifest(env = process.env) {
  const runId = required(env, "E2E_RUN_ID");
  const profile = required(env, "E2E_PROFILE");
  const seed = Number.parseInt(required(env, "E2E_SEED"), 10);
  const businessClock = required(env, "E2E_BUSINESS_CLOCK");
  const bootstrapSecret = required(env, "E2E_BOOTSTRAP_SECRET");

  if (env["APP_ENV"] !== "e2e") throw new Error("E2E requires APP_ENV=e2e");
  if (env["E2E_FIXTURES_ENABLED"] !== "1") {
    throw new Error("E2E requires guarded fixture identities");
  }
  if (env["VERCEL_ENV"] || env["E2E_SHARED_ENV"] === "1") {
    throw new Error("E2E controls are forbidden in shared environments");
  }
  if (!/^[a-z0-9][a-z0-9-]{5,47}$/.test(runId)) {
    throw new Error("E2E_RUN_ID must be a 6-48 character lowercase namespace");
  }
  if (!PROFILES.has(profile))
    throw new Error(`Unsupported E2E_PROFILE "${profile}"`);
  if (!Number.isSafeInteger(seed) || seed < 1) {
    throw new Error("E2E_SEED must be a positive safe integer");
  }
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.000Z$/.test(businessClock) ||
    Number.isNaN(Date.parse(businessClock))
  ) {
    throw new Error("E2E_BUSINESS_CLOCK must be a fixed UTC instant");
  }
  if (
    !bootstrapSecret.startsWith(`${runId}.`) ||
    bootstrapSecret.length < runId.length + 33
  ) {
    throw new Error("E2E_BOOTSTRAP_SECRET must be strong and run-scoped");
  }
  for (const role of ROLES) {
    required(env, tokenVariable(role));
  }

  return {
    schemaVersion: 1,
    runId,
    seed,
    businessClock,
    profile,
    releaseEvidence: profile === "release-postgres",
    gitSha: env["GITHUB_SHA"] ?? env["GIT_COMMIT_SHA"] ?? "local",
    apiBaseUrl: env["E2E_API_URL"] ?? "http://127.0.0.1:3101",
    applications: {
      dash: env["E2E_DASH_URL"] ?? "http://127.0.0.1:5273",
      floor: env["E2E_FLOOR_URL"] ?? "http://127.0.0.1:5276",
      host: env["E2E_HOST_URL"] ?? "http://127.0.0.1:5278",
      kitchen: env["E2E_KITCHEN_URL"] ?? "http://127.0.0.1:5275",
      cash: env["E2E_CASH_URL"] ?? "http://127.0.0.1:5274",
    },
    principals: Object.fromEntries(
      ROLES.map((role) => [
        role,
        { tokenEnvironmentVariable: tokenVariable(role) },
      ]),
    ),
  };
}

export function tokenForRole(role, env = process.env) {
  if (!ROLES.includes(role)) throw new Error(`Unknown E2E role "${role}"`);
  return required(env, tokenVariable(role));
}

function tokenVariable(role) {
  return `E2E_${role === "tenantB" ? "TENANT_B" : role.toUpperCase()}_TOKEN`;
}

function required(env, key) {
  const value = env[key];
  if (!value) throw new Error(`Missing required ${key}`);
  return value;
}
