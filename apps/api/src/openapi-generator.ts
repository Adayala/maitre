import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { buildApp } from "./app.js";
import { applyOperationPayloadContracts } from "./openapi-operation-contracts.js";

export async function generateOpenApi(outputPath: string): Promise<void> {
  const app = await buildApp();
  try {
    await app.ready();
    const document = app.swagger() as Record<string, unknown>;
    applyOperationPayloadContracts(document);
    const sortedDocument = sortValue(document);
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(
      outputPath,
      `${JSON.stringify(sortedDocument, null, 2)}\n`,
      "utf8",
    );
  } finally {
    await app.close();
  }
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => [key, sortValue(nested)]),
  );
}

const invokedPath = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : "";
if (import.meta.url === invokedPath) {
  const output = resolve(process.argv[2] ?? "apps/api/openapi/openapi.json");
  await generateOpenApi(output);
  process.stdout.write(`Generated ${output}\n`);
}
