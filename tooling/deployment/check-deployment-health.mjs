import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export async function checkDeploymentHealth(
  deploymentUrl,
  { fetchImpl = fetch, attempts = 12, delayMs = 5_000 } = {},
) {
  const baseUrl = new URL(deploymentUrl);
  if (baseUrl.protocol !== "https:") {
    throw new Error("Deployment health checks require an HTTPS URL");
  }

  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const live = await readHealth(fetchImpl, baseUrl, "/health/live");
      const ready = await readHealth(fetchImpl, baseUrl, "/health/ready");
      if (live.status !== "ok") {
        throw new Error(`liveness returned status ${String(live.status)}`);
      }
      if (ready.status !== "ready") {
        throw new Error(`readiness returned status ${String(ready.status)}`);
      }
      return { live: "ok", ready: "ready", attempts: attempt };
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await wait(delayMs);
    }
  }
  throw new Error(
    `Deployment did not become healthy after ${attempts} attempts: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`,
  );
}

async function readHealth(fetchImpl, baseUrl, pathname) {
  const response = await fetchImpl(new URL(pathname, baseUrl), {
    headers: { accept: "application/json" },
    redirect: "error",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    throw new Error(`${pathname} returned HTTP ${response.status}`);
  }
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    throw new Error(`${pathname} returned ${contentType || "no content-type"}`);
  }
  return response.json();
}

function wait(delayMs) {
  return new Promise((resolveWait) => setTimeout(resolveWait, delayMs));
}

async function main() {
  const deploymentUrl = process.argv[2];
  if (!deploymentUrl) {
    throw new Error(
      "Usage: check-deployment-health.mjs <https://deployment-url>",
    );
  }
  const result = await checkDeploymentHealth(deploymentUrl);
  process.stdout.write(`Deployment health passed: ${JSON.stringify(result)}\n`);
}

const invokedPath = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : "";
if (import.meta.url === invokedPath) await main();
