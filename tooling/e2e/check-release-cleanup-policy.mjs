import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const DEFAULT_WORKFLOW = fileURLToPath(
  new URL("../../.github/workflows/e2e.yml", import.meta.url),
);

const GUARANTEES = [
  ["isolated-app-env", /\bAPP_ENV:\s*e2e\b/],
  ["ephemeral-profile", /\bE2E_PROFILE:\s*release-postgres\b/],
  [
    "run-scoped-id",
    /\bE2E_RUN_ID:\s*e2e-\$\{\{\s*github\.run_id\s*\}\}-\$\{\{\s*github\.run_attempt\s*\}\}/,
  ],
  ["empty-database", /supabase db reset --local --no-seed/],
  [
    "always-cleanup",
    /Destroy ephemeral database and verify cleanup[\s\S]*?if:\s*\$\{\{\s*always\(\)\s*\}\}/,
  ],
  ["no-backup-teardown", /supabase stop --no-backup/],
  [
    "cleanup-verification",
    /supabase status[\s\S]*?CLEANUP_FAILURE:[\s\S]*?resources remain active/,
  ],
  ["cleanup-evidence", /echo "cleanup=verified"[^\n]*cleanup\.txt/],
];

export function inspectReleaseCleanupPolicy(source) {
  return GUARANTEES.filter(([, pattern]) => !pattern.test(source)).map(
    ([code]) => code,
  );
}

export async function checkReleaseCleanupPolicy(
  workflowPath = DEFAULT_WORKFLOW,
) {
  return inspectReleaseCleanupPolicy(await readFile(workflowPath, "utf8"));
}

export async function runReleaseCleanupPolicyCli({
  check = checkReleaseCleanupPolicy,
  stdout = process.stdout,
  stderr = process.stderr,
} = {}) {
  const violations = await check();
  if (violations.length > 0) {
    for (const violation of violations) stderr.write(`${violation}\n`);
    return 1;
  }
  stdout.write("Release E2E cleanup policy passed.\n");
  return 0;
}
