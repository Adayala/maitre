import assert from "node:assert/strict";
import { test } from "node:test";
import { checkDeploymentHealth } from "./check-deployment-health.mjs";

function response(status, body, contentType = "application/json") {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": contentType },
  });
}

test("post-deploy check requires liveness and readiness", async () => {
  const calls = [];
  const result = await checkDeploymentHealth("https://api.example.test", {
    attempts: 1,
    fetchImpl: async (url) => {
      calls.push(new URL(url).pathname);
      return calls.length === 1
        ? response(200, { status: "ok" })
        : response(200, { status: "ready" });
    },
  });
  assert.deepEqual(calls, ["/health/live", "/health/ready"]);
  assert.deepEqual(result, { live: "ok", ready: "ready", attempts: 1 });
});

test("post-deploy check rejects provider-ready deployments with broken functions", async () => {
  await assert.rejects(
    checkDeploymentHealth("https://api.example.test", {
      attempts: 2,
      delayMs: 0,
      fetchImpl: async () => response(500, { error: "function failed" }),
    }),
    /did not become healthy.*HTTP 500/,
  );
});

test("post-deploy check rejects non-JSON and insecure targets", async () => {
  await assert.rejects(
    checkDeploymentHealth("http://api.example.test", { attempts: 1 }),
    /HTTPS URL/,
  );
  await assert.rejects(
    checkDeploymentHealth("https://api.example.test", {
      attempts: 1,
      fetchImpl: async () => response(200, { status: "ok" }, "text/plain"),
    }),
    /text\/plain/,
  );
});
