import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const files = collectFiles(".");
const patterns = [
  ["private key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ["GitHub token", /\bgh[opsu]_[A-Za-z0-9_]{30,}\b/],
  [
    "Supabase service key",
    /\bSUPABASE_(?:SECRET|SERVICE_ROLE)_KEY\s*=\s*["'][^"']{20,}["']/,
  ],
  ["generic bearer token", /\bBearer\s+[A-Za-z0-9_-]{32,}\b/],
];
const findings = [];

for (const file of files) {
  if (file.endsWith(".png") || file.endsWith(".jpg") || file.endsWith(".zip"))
    continue;
  let content;
  try {
    content = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  for (const [label, pattern] of patterns) {
    if (pattern.test(content)) findings.push(`${file}: possible ${label}`);
  }
}

if (findings.length) {
  console.error(findings.join("\n"));
  process.exit(1);
}
console.log(
  `Scanned ${files.length} source files for high-confidence secret patterns.`,
);

function collectFiles(directory) {
  const ignored = new Set([
    ".git",
    "node_modules",
    "dist",
    "coverage",
    "playwright-report",
    "test-results",
  ]);
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (ignored.has(entry.name)) return [];
    const path = join(directory, entry.name);
    return entry.isDirectory() ? collectFiles(path) : [path];
  });
}
