import { test } from "node:test";
import assert from "node:assert/strict";
import { runtimeBuildInfo } from "../runtime/build-info.js";

test("runtime build info prefers explicit deployment metadata", () => {
  assert.deepEqual(
    runtimeBuildInfo({
      MAITRE_GIT_COMMIT_SHA: "explicit-sha",
      VERCEL_GIT_COMMIT_SHA: "vercel-sha",
      GITHUB_SHA: "github-sha",
      MAITRE_DEPLOYED_AT: "2026-08-29T15:00:00Z",
      VERCEL_DEPLOYMENT_CREATED_AT: "vercel-date",
      VERCEL_ENV: "production",
      NODE_ENV: "test",
    }),
    {
      commitSha: "explicit-sha",
      deployedAt: "2026-08-29T15:00:00Z",
      environment: "production",
    },
  );
});

test("runtime build info uses provider metadata", () => {
  assert.deepEqual(
    runtimeBuildInfo({
      VERCEL_GIT_COMMIT_SHA: "vercel-sha",
      GITHUB_SHA: "github-sha",
      VERCEL_DEPLOYMENT_CREATED_AT: "2026-08-29T15:01:00Z",
      NODE_ENV: "preview",
    }),
    {
      commitSha: "vercel-sha",
      deployedAt: "2026-08-29T15:01:00Z",
      environment: "preview",
    },
  );
});

test("runtime build info supports GitHub and local fallbacks", () => {
  assert.deepEqual(runtimeBuildInfo({ GITHUB_SHA: "github-sha" }), {
    commitSha: "github-sha",
    deployedAt: "unknown",
    environment: "development",
  });
  assert.deepEqual(runtimeBuildInfo({}), {
    commitSha: "unknown",
    deployedAt: "unknown",
    environment: "development",
  });
});
