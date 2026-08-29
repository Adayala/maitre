import assert from "node:assert/strict";
import test from "node:test";
import {
  checkReleaseCleanupPolicy,
  inspectReleaseCleanupPolicy,
  runReleaseCleanupPolicyCli,
} from "./check-release-cleanup-policy.mjs";

const validWorkflow = `
env:
  APP_ENV: e2e
  E2E_PROFILE: release-postgres
  E2E_RUN_ID: e2e-\${{ github.run_id }}-\${{ github.run_attempt }}
steps:
  - run: supabase db reset --local --no-seed
  - name: Destroy ephemeral database and verify cleanup
    if: \${{ always() }}
    run: |
      supabase stop --no-backup
      if supabase status; then
        echo "CLEANUP_FAILURE: Supabase resources remain active"
      fi
      echo "cleanup=verified" > cleanup.txt
`;

test("accepts the repository release cleanup contract", async () => {
  assert.deepEqual(await checkReleaseCleanupPolicy(), []);
  assert.deepEqual(inspectReleaseCleanupPolicy(validWorkflow), []);
});

test("reports every missing isolation and cleanup guarantee", () => {
  assert.deepEqual(inspectReleaseCleanupPolicy("name: unsafe"), [
    "isolated-app-env",
    "ephemeral-profile",
    "run-scoped-id",
    "empty-database",
    "always-cleanup",
    "no-backup-teardown",
    "cleanup-verification",
    "cleanup-evidence",
  ]);
});

test("CLI reports success and each policy violation", async () => {
  const success = [];
  assert.equal(
    await runReleaseCleanupPolicyCli({
      check: async () => [],
      stdout: { write: (value) => success.push(value) },
      stderr: { write: assert.fail },
    }),
    0,
  );
  assert.deepEqual(success, ["Release E2E cleanup policy passed.\n"]);

  const failures = [];
  assert.equal(
    await runReleaseCleanupPolicyCli({
      check: async () => ["always-cleanup", "cleanup-verification"],
      stdout: { write: assert.fail },
      stderr: { write: (value) => failures.push(value) },
    }),
    1,
  );
  assert.deepEqual(failures, ["always-cleanup\n", "cleanup-verification\n"]);
});

test("CLI entrypoint uses the repository workflow", async () => {
  const originalExitCode = process.exitCode;
  await import("./run-release-cleanup-policy.mjs?cli-entrypoint-test");
  process.exitCode = originalExitCode;
});
