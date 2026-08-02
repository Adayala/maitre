export type E2ERole = "waiter" | "cook" | "cashier" | "auditor" | "tenantB";

export interface E2ERunManifest {
  schemaVersion: 1;
  runId: string;
  seed: number;
  businessClock: string;
  profile: "local-memory" | "release-postgres";
  releaseEvidence: boolean;
  gitSha: string;
  apiBaseUrl: string;
  applications: {
    dash: string;
    floor: string;
    kitchen: string;
    cash: string;
    guest: string;
  };
  principals: Record<E2ERole, { tokenEnvironmentVariable: string }>;
}

export function createRunManifest(env?: NodeJS.ProcessEnv): E2ERunManifest;
export function tokenForRole(role: E2ERole, env?: NodeJS.ProcessEnv): string;
