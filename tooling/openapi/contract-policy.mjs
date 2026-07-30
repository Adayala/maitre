import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const HTTP_METHODS = new Set([
  "get",
  "put",
  "post",
  "delete",
  "options",
  "head",
  "patch",
  "trace",
]);

export function validateContract(document) {
  const issues = [];
  if (document.openapi !== "3.1.0") {
    issues.push(`Expected OpenAPI 3.1.0, received ${String(document.openapi)}`);
  }

  for (const [path, pathItem] of Object.entries(document.paths ?? {})) {
    if (!path.startsWith("/v1/")) continue;
    for (const [method, operation] of Object.entries(pathItem ?? {})) {
      if (!HTTP_METHODS.has(method)) continue;
      const location = `${method.toUpperCase()} ${path}`;
      if (!operation.operationId)
        issues.push(`${location} is missing operationId`);
      if (!operation["x-maitre-owner"])
        issues.push(`${location} is missing x-maitre-owner`);
      if (!operation["x-maitre-spec"])
        issues.push(`${location} is missing x-maitre-spec`);
      if (!operation.security)
        issues.push(`${location} is missing security declaration`);
      if (!operation.responses?.default) {
        issues.push(
          `${location} is missing the default Problem Details response`,
        );
      }
    }
  }

  const problem = document.components?.schemas?.ProblemDetails;
  for (const field of [
    "type",
    "title",
    "status",
    "detail",
    "instance",
    "code",
    "correlationId",
  ]) {
    if (!problem?.required?.includes(field)) {
      issues.push(`ProblemDetails must require ${field}`);
    }
  }
  return issues;
}

async function main() {
  const path = resolve(process.argv[2] ?? "apps/api/openapi/openapi.json");
  const document = JSON.parse(await readFile(path, "utf8"));
  const issues = validateContract(document);
  if (issues.length > 0) {
    process.stderr.write(`${issues.map((issue) => `- ${issue}`).join("\n")}\n`);
    process.exitCode = 1;
    return;
  }
  process.stdout.write(`OpenAPI contract policy passed (${path})\n`);
}

const invokedPath = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : "";
if (import.meta.url === invokedPath) await main();
