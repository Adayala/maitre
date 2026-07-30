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

function compareSchema(path, baseline, candidate, changes) {
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
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    );
  } catch {
    process.stdout.write(
      `No baseline OpenAPI artifact at ${baseRef}; accepting initial baseline.\n`,
    );
    return;
  }

  const baseline = JSON.parse(baselineText);
  const candidate = JSON.parse(await readFile(candidatePath, "utf8"));
  const changes = findBreakingChanges(baseline, candidate);
  if (changes.length > 0) {
    process.stderr.write(
      `Breaking OpenAPI changes against ${baseRef}:\n${changes
        .map((change) => `- ${change}`)
        .join("\n")}\n`,
    );
    process.exitCode = 1;
    return;
  }
  process.stdout.write(`No breaking OpenAPI changes against ${baseRef}.\n`);
}

const invokedPath = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : "";
if (import.meta.url === invokedPath) await main();
