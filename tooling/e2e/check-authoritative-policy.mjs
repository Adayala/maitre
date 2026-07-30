import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const DEFAULT_ROOT = fileURLToPath(
  new URL("../../tests/e2e/journeys", import.meta.url),
);

const PROHIBITED = [
  ["focused-test", /\b(?:test|describe)\.only\s*\(/],
  ["disabled-test", /\b(?:test|describe)\.(?:skip|fixme)\s*\(/],
  ["product-route-handler", /\b(?:page|context)\.route\s*\(/],
  ["fulfilled-response", /\broute\.(?:fulfill|abort)\s*\(/],
  ["fixed-sleep", /\.waitForTimeout\s*\(/],
];

export async function inspectAuthoritativeSpecs(root = DEFAULT_ROOT) {
  const files = (await listFiles(root)).filter((file) => file.endsWith(".ts"));
  const specs = files.filter((file) => file.endsWith(".spec.ts"));
  const violations = [];
  for (const file of files) {
    const source = await readFile(file, "utf8");
    for (const [code, pattern] of PROHIBITED) {
      const match = pattern.exec(source);
      if (match) {
        violations.push({
          code,
          file: path.relative(process.cwd(), file),
          line: lineAt(source, match.index),
        });
      }
    }
  }
  if (specs.length === 0) {
    violations.push({
      code: "missing-authoritative-spec",
      file: path.relative(process.cwd(), root),
      line: 1,
    });
  }
  return { files, specs, violations };
}

async function listFiles(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const target = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(target)));
    if (entry.isFile()) files.push(target);
  }
  return files;
}

function lineAt(source, index) {
  return source.slice(0, index).split("\n").length;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const result = await inspectAuthoritativeSpecs();
  if (result.violations.length > 0) {
    for (const violation of result.violations) {
      process.stderr.write(
        `${violation.file}:${violation.line} ${violation.code}\n`,
      );
    }
    process.exitCode = 1;
  } else {
    process.stdout.write(
      `Authoritative E2E policy passed (${result.specs.length} spec, ${result.files.length} source files).\n`,
    );
  }
}
