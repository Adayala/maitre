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
      const success = successfulResponse(operation.responses);
      if (!success) {
        issues.push(`${location} is missing a successful response`);
      } else if (isNoContentResponse(success)) {
        // 204 intentionally has no representation.
      } else if (!hasTypedSuccessContent(success)) {
        issues.push(
          `${location} success response is missing a typed media schema`,
        );
      } else if (hasGenericSuccessEnvelope(success)) {
        issues.push(`${location} still uses the generic success envelope`);
      } else if (hasUnconstrainedSuccessSchema(success)) {
        issues.push(`${location} success response schema is unconstrained`);
      }
      const problem = operation.responses?.default;
      if (!problem) {
        issues.push(
          `${location} is missing the default Problem Details response`,
        );
      } else if (!problem.content?.["application/problem+json"]?.schema) {
        issues.push(
          `${location} default response must use application/problem+json`,
        );
      }
      for (const header of [
        "x-tenant-id",
        "x-branch-id",
        "x-correlation-id",
        "traceparent",
      ]) {
        if (
          !(operation.parameters ?? []).some(
            (parameter) =>
              parameter?.in === "header" && parameter?.name === header,
          )
        ) {
          issues.push(`${location} is missing ${header} header declaration`);
        }
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

function successfulResponse(responses) {
  return Object.entries(responses ?? {}).find(([status]) =>
    /^(?:2\d\d|2XX)$/.test(status),
  )?.[1];
}

function isNoContentResponse(response) {
  return response?.description === "No content" && !response.content;
}

function hasTypedSuccessContent(response) {
  const media = Object.values(response?.content ?? {});
  return media.length > 0 && media.every((entry) => entry?.schema);
}

function hasGenericSuccessEnvelope(response) {
  return Object.values(response?.content ?? {}).some(
    (entry) =>
      typeof entry?.schema?.$ref === "string" &&
      entry.schema.$ref.endsWith("/SuccessEnvelope"),
  );
}

function hasUnconstrainedSuccessSchema(response) {
  return Object.values(response?.content ?? {}).some((entry) =>
    isUnconstrainedSchema(entry?.schema),
  );
}

function isUnconstrainedSchema(schema) {
  return (
    schema &&
    typeof schema === "object" &&
    !schema.$ref &&
    schema.type === "object" &&
    schema.additionalProperties === true &&
    !schema.properties
  );
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
