import { existsSync, readFileSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
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
const files = collectFiles(".", {
  ignoredDirectories,
  select: (file) => file.endsWith(".md"),
});
const failures = [];
const baseline = new Set([
  "docs/sdd/spec-003-entity-fiscal-entity/README.md|../spec-127-entity-fiscal-point/README.md",
  "docs/sdd/spec-006-entity-table/README.md|../spec-058-entity-table-occupation/README.md",
]);
const linkPattern =
  /\[[^\]]*]\((?!https?:|mailto:|#)([^)\s]+)(?:\s+"[^"]*")?\)/g;

for (const file of files) {
  const content = readFileSync(file, "utf8");
  for (const match of content.matchAll(linkPattern)) {
    const rawTarget = decodeURIComponent(match[1].split("#")[0]);
    if (!rawTarget) continue;
    if (
      file.startsWith("docs/sdd/_guides/SPEC_") ||
      file.endsWith("markdown-link-reachability-contract.md") ||
      baseline.has(`${file.replace(/^\.\//, "")}|${rawTarget}`)
    )
      continue;
    const target = normalize(join(dirname(file), rawTarget));
    if (!existsSync(target))
      failures.push(`${file}: broken link -> ${match[1]}`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`Validated ${files.length} Markdown files.`);
