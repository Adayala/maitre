import { createHash } from "node:crypto";
import type {
  MembershipRepositoryPort,
  UserRepositoryPort,
} from "@maitre/identity";
import { FixtureSessionVerificationPort } from "@maitre/adapter-persistence-memory";

interface E2EFixtureRepositories {
  users: UserRepositoryPort;
  memberships: MembershipRepositoryPort;
}

const PRINCIPALS = [
  {
    role: "waiter",
    roleId: "role_waiter",
    tokenVariable: "E2E_WAITER_TOKEN",
  },
  { role: "cook", roleId: "role_cook", tokenVariable: "E2E_COOK_TOKEN" },
  {
    role: "cashier",
    roleId: "role_cashier",
    tokenVariable: "E2E_CASHIER_TOKEN",
  },
] as const;

export async function registerE2EFixtures(
  repositories: E2EFixtureRepositories,
  sessions: FixtureSessionVerificationPort,
  tenantId: string,
  branchId: string,
  env: NodeJS.ProcessEnv = process.env,
): Promise<void> {
  if (env["E2E_FIXTURES_ENABLED"] !== "1") return;
  assertIsolatedE2EEnvironment(env);

  const runId = required(env, "E2E_RUN_ID");
  const now = new Date(required(env, "E2E_BUSINESS_CLOCK"));
  const sessionNow = new Date();
  for (const principal of PRINCIPALS) {
    const subject = `e2e-${runId}-${principal.role}`;
    const userId = deterministicUuid(`${subject}:user`);
    const membershipId = deterministicUuid(`${subject}:membership`);
    const existing = await repositories.users.findById(userId);
    if (!existing) {
      await repositories.users.save({
        id: userId,
        identityProvider: "fixture",
        externalIdentityId: subject,
        displayName: `E2E ${principal.role}`,
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
      });
    }
    const membership =
      await repositories.memberships.findActiveByUserAndTenant(userId, tenantId);
    if (!membership) {
      await repositories.memberships.save({
        id: membershipId,
        tenantId,
        userId,
        status: "ACTIVE",
        branchScopeType: "SELECTED_BRANCHES",
        roleIds: [principal.roleId],
        branchIds: [branchId],
        activatedAt: now,
        createdAt: now,
        updatedAt: now,
      });
    }
    sessions.registerToken(required(env, principal.tokenVariable), {
      provider: "fixture",
      subject,
      issuedAt: sessionNow,
      expiresAt: new Date(sessionNow.getTime() + 4 * 60 * 60 * 1000),
    });
  }

  const tenantBSubject = `e2e-${runId}-tenant-b`;
  const tenantBUserId = deterministicUuid(`${tenantBSubject}:user`);
  if (!(await repositories.users.findById(tenantBUserId))) {
    await repositories.users.save({
      id: tenantBUserId,
      identityProvider: "fixture",
      externalIdentityId: tenantBSubject,
      displayName: "E2E Tenant B",
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now,
    });
  }
  sessions.registerToken(required(env, "E2E_TENANT_B_TOKEN"), {
    provider: "fixture",
    subject: tenantBSubject,
    issuedAt: sessionNow,
    expiresAt: new Date(sessionNow.getTime() + 4 * 60 * 60 * 1000),
  });
}

export function assertIsolatedE2EEnvironment(
  env: NodeJS.ProcessEnv = process.env,
): void {
  const runId = required(env, "E2E_RUN_ID");
  const secret = required(env, "E2E_BOOTSTRAP_SECRET");
  if (
    env["APP_ENV"] !== "e2e" ||
    env["VERCEL_ENV"] ||
    env["E2E_SHARED_ENV"] === "1"
  ) {
    throw new Error("E2E fixtures are forbidden outside an isolated E2E environment");
  }
  if (!secret.startsWith(`${runId}.`) || secret.length < runId.length + 33) {
    throw new Error("E2E bootstrap secret must be strong and run-scoped");
  }
}

function deterministicUuid(value: string): string {
  const hash = createHash("sha256").update(value).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-5${hash.slice(
    13,
    16,
  )}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

function required(env: NodeJS.ProcessEnv, key: string): string {
  const value = env[key];
  if (!value) throw new Error(`Missing required ${key}`);
  return value;
}
