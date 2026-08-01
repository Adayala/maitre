import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const HTTP_METHODS = new Set(["get", "put", "post", "delete", "patch"]);

export function findBreakingChanges(baseline, candidate) {
  const changes = [];
  for (const [path, pathItem] of Object.entries(baseline.paths ?? {})) {
    if (!candidate.paths?.[path]) {
      changes.push(`removed path ${path}`);
      continue;
    }
    for (const method of Object.keys(pathItem ?? {})) {
      if (HTTP_METHODS.has(method) && !candidate.paths[path]?.[method]) {
        changes.push(`removed operation ${method.toUpperCase()} ${path}`);
        continue;
      }
      if (HTTP_METHODS.has(method)) {
        compareOperation(
          `${method.toUpperCase()} ${path}`,
          pathItem[method],
          candidate.paths[path][method],
          changes,
        );
      }
    }
  }

  for (const [name, schema] of Object.entries(
    baseline.components?.schemas ?? {},
  )) {
    const next = candidate.components?.schemas?.[name];
    if (!next) {
      changes.push(`removed component schema ${name}`);
      continue;
    }
    compareSchema(`components.schemas.${name}`, schema, next, changes);
  }
  return changes;
}

export function partitionApprovedChanges(
  changes,
  candidate,
  policy,
  today = new Date(),
) {
  const approved = [];
  const unapproved = [];
  for (const change of changes) {
    const approval = (policy?.approvals ?? []).find((candidateApproval) =>
      approvesChange(change, candidate, candidateApproval, today),
    );
    (approval ? approved : unapproved).push(
      approval ? { change, approvalId: approval.id } : change,
    );
  }
  return { approved, unapproved };
}

function compareSchema(path, baseline, candidate, changes) {
  if (baseline?.$ref && baseline.$ref !== candidate?.$ref) {
    changes.push(
      `changed schema reference at ${path} from ${baseline.$ref} to ${String(candidate?.$ref)}`,
    );
    return;
  }
  if (baseline?.type && candidate?.type && baseline.type !== candidate.type) {
    changes.push(
      `changed type at ${path} from ${baseline.type} to ${candidate.type}`,
    );
  }
  for (const property of Object.keys(baseline?.properties ?? {})) {
    if (!candidate?.properties?.[property]) {
      changes.push(`removed property ${path}.${property}`);
      continue;
    }
    compareSchema(
      `${path}.${property}`,
      baseline.properties[property],
      candidate.properties[property],
      changes,
    );
  }
  const baselineRequired = new Set(baseline?.required ?? []);
  for (const required of candidate?.required ?? []) {
    if (!baselineRequired.has(required)) {
      changes.push(`made property required ${path}.${required}`);
    }
  }
  if (baseline?.items && candidate?.items) {
    compareSchema(`${path}.items`, baseline.items, candidate.items, changes);
  }
  if (Array.isArray(baseline?.enum) && Array.isArray(candidate?.enum)) {
    for (const value of baseline.enum) {
      if (!candidate.enum.includes(value)) {
        changes.push(`removed enum value ${JSON.stringify(value)} at ${path}`);
      }
    }
  }
}

function compareOperation(location, baseline, candidate, changes) {
  compareParameters(
    location,
    baseline.parameters,
    candidate.parameters,
    changes,
  );
  compareRequestBody(
    location,
    baseline.requestBody,
    candidate.requestBody,
    changes,
  );
  compareResponses(location, baseline.responses, candidate.responses, changes);
}

function compareParameters(location, baseline, candidate, changes) {
  const next = new Map(
    (candidate ?? []).map((parameter) => [
      `${parameter.in}:${parameter.name}`,
      parameter,
    ]),
  );
  for (const parameter of baseline ?? []) {
    const key = `${parameter.in}:${parameter.name}`;
    const candidateParameter = next.get(key);
    if (!candidateParameter) {
      changes.push(`removed parameter ${key} from ${location}`);
      continue;
    }
    if (!parameter.required && candidateParameter.required) {
      changes.push(`made parameter ${key} required at ${location}`);
    }
    compareSchema(
      `${location}.parameters.${key}`,
      parameter.schema,
      candidateParameter.schema,
      changes,
    );
  }
}

function compareRequestBody(location, baseline, candidate, changes) {
  if (!baseline) return;
  if (!candidate) {
    changes.push(`removed request body from ${location}`);
    return;
  }
  if (!baseline.required && candidate.required) {
    changes.push(`made request body required at ${location}`);
  }
  compareContent(
    `${location}.requestBody`,
    baseline.content,
    candidate.content,
    changes,
  );
}

function compareResponses(location, baseline, candidate, changes) {
  for (const [status, response] of Object.entries(baseline ?? {})) {
    const next = candidate?.[status];
    if (!next) {
      changes.push(`removed response ${status} from ${location}`);
      continue;
    }
    compareContent(
      `${location}.responses.${status}`,
      response.content,
      next.content,
      changes,
    );
  }
}

function compareContent(path, baseline, candidate, changes) {
  for (const [mediaType, media] of Object.entries(baseline ?? {})) {
    const next = candidate?.[mediaType];
    if (!next) {
      changes.push(`removed media type ${mediaType} at ${path}`);
      continue;
    }
    compareSchema(`${path}.${mediaType}`, media.schema, next.schema, changes);
  }
}

async function main() {
  const candidatePath = resolve(
    process.argv[2] ?? "apps/api/openapi/openapi.json",
  );
  const baseRef =
    process.env["OPENAPI_BASE_REF"] ??
    process.env["GITHUB_BASE_SHA"] ??
    "origin/main";
  let baselineText;
  try {
    baselineText = execFileSync(
      "git",
      ["show", `${baseRef}:apps/api/openapi/openapi.json`],
      {
        encoding: "utf8",
        maxBuffer: 16 * 1024 * 1024,
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
  } catch (error) {
    const stderr =
      error && typeof error === "object" && "stderr" in error
        ? String(error.stderr)
        : "";
    if (
      !stderr.includes("path 'apps/api/openapi/openapi.json' does not exist in")
    ) {
      throw error;
    }
    process.stdout.write(
      `No baseline OpenAPI artifact at ${baseRef}; accepting initial baseline.\n`,
    );
    return;
  }

  const baseline = JSON.parse(baselineText);
  const candidate = JSON.parse(await readFile(candidatePath, "utf8"));
  const changes = findBreakingChanges(baseline, candidate);
  const approvalPath = resolve(
    process.env["OPENAPI_BREAKING_APPROVALS"] ??
      "tooling/openapi/approved-breaking-changes.json",
  );
  const approvalPolicy = JSON.parse(await readFile(approvalPath, "utf8"));
  const { approved, unapproved } = partitionApprovedChanges(
    changes,
    candidate,
    approvalPolicy,
  );
  if (unapproved.length > 0) {
    process.stderr.write(
      `Unapproved breaking OpenAPI changes against ${baseRef}:\n${unapproved
        .map((change) => `- ${change}`)
        .join("\n")}\n`,
    );
    process.exitCode = 1;
    return;
  }
  if (approved.length > 0) {
    const ids = [...new Set(approved.map((item) => item.approvalId))].join(
      ", ",
    );
    process.stdout.write(
      `Accepted ${approved.length} approved OpenAPI migrations (${ids}).\n`,
    );
  }
  process.stdout.write(`No breaking OpenAPI changes against ${baseRef}.\n`);
}

function approvesChange(change, candidate, approval, today) {
  if (!isValidApproval(approval, today)) return false;
  if (approval.kind === "replace-default-response-media-type") {
    return approvesDefaultResponseMediaMigration(change, candidate, approval);
  }
  if (approval.kind === "materialize-runtime-payload-schema") {
    return approvesPayloadSchemaMaterialization(change, candidate, approval);
  }
  return false;
}

function isValidApproval(approval, today) {
  return (
    typeof approval?.id === "string" &&
    typeof approval.pathPrefix === "string" &&
    typeof approval.expiresOn === "string" &&
    typeof approval.reason === "string" &&
    approval.reason.trim() !== "" &&
    approval.expiresOn >= today.toISOString().slice(0, 10)
  );
}

function approvesDefaultResponseMediaMigration(change, candidate, approval) {
  if (typeof approval.from !== "string" || typeof approval.to !== "string") {
    return false;
  }
  const match =
    /^removed media type (\S+) at (GET|PUT|POST|DELETE|PATCH) (\/.+)\.responses\.default$/.exec(
      change,
    );
  if (!match) return false;
  const [, mediaType, method, path] = match;
  return (
    mediaType === approval.from &&
    path.startsWith(approval.pathPrefix) &&
    Boolean(
      candidate.paths?.[path]?.[method.toLowerCase()]?.responses?.default
        ?.content?.[approval.to],
    )
  );
}

function approvesPayloadSchemaMaterialization(change, candidate, approval) {
  const requiredMatch =
    /^made property required (GET|PUT|POST|DELETE|PATCH) (\/.+)\.responses\.(\d{3}|[1-5]XX)\.(\S+)\.(.+)$/.exec(
      change,
    );
  if (requiredMatch) {
    const [, method, path, status, mediaType] = requiredMatch;
    if (!path.startsWith(approval.pathPrefix)) return false;
    const schema =
      candidate.paths?.[path]?.[method.toLowerCase()]?.responses?.[status]
        ?.content?.[mediaType]?.schema;
    return isMaterializedSchema(schema);
  }

  const removedResponseMatch =
    /^removed response (\d{3}|[1-5]XX) from (GET|PUT|POST|DELETE|PATCH) (\/.+)$/.exec(
      change,
    );
  if (!removedResponseMatch) return false;
  const [, removedStatus, method, path] = removedResponseMatch;
  if (!removedStatus.startsWith("2") || !path.startsWith(approval.pathPrefix)) {
    return false;
  }
  const responses =
    candidate.paths?.[path]?.[method.toLowerCase()]?.responses ?? {};
  return Object.entries(responses).some(
    ([status, response]) =>
      status.startsWith("2") &&
      (response?.description === "No content" ||
        Object.values(response?.content ?? {}).some(({ schema }) =>
          isMaterializedSchema(schema),
        )),
  );
}

function isMaterializedSchema(schema) {
  if (!schema || typeof schema !== "object") return false;
  if (schema.$ref === "#/components/schemas/SuccessEnvelope") return false;
  return !(
    schema.type === "object" &&
    schema.additionalProperties === true &&
    Object.keys(schema.properties ?? {}).length === 0
  );
}

const invokedPath = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : "";
if (import.meta.url === invokedPath) await main();
