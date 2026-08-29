import { runReleaseCleanupPolicyCli } from "./check-release-cleanup-policy.mjs";

process.exitCode = await runReleaseCleanupPolicyCli();
