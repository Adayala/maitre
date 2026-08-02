import { readFileSync } from "node:fs";
import { collectFiles } from "../shared/collect-files.mjs";

const ignoredDirectories = new Set([
  ".artifacts",
  ".git",
  ".secrets",
  ".superpowers",
  "dist",
  "node_modules",
  "worktrees",
]);
const files = collectFiles(".", { ignoredDirectories });
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
