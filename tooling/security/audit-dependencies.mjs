import { spawnSync } from "node:child_process";

const allowedAdvisories = new Map([
  [
    "GHSA-qwww-vcr4-c8h2",
    {
      expires: "2026-08-31",
      reason:
        "React Router RSC action advisory; Maitre uses BrowserRouter SPA mode and no RSC/server actions.",
    },
  ],
]);

const result = spawnSync("npm", ["audit", "--json"], { encoding: "utf8" });
let report;
try {
  report = JSON.parse(result.stdout);
} catch {
  console.error(result.stderr || "npm audit did not return valid JSON");
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const failures = [];
const accepted = [];
for (const vulnerability of Object.values(report.vulnerabilities ?? {})) {
  if (!["high", "critical"].includes(vulnerability.severity)) continue;
  const advisoryIds = extractAdvisoryIds(vulnerability.via);
  const allowed =
    advisoryIds.length > 0 &&
    advisoryIds.every((id) => {
      const exception = allowedAdvisories.get(id);
      return exception && exception.expires >= today;
    });
  if (allowed) {
    accepted.push(`${vulnerability.name}: ${advisoryIds.join(", ")}`);
  } else {
    failures.push(
      `${vulnerability.name} (${vulnerability.severity}): ${advisoryIds.join(", ") || "unclassified"}`,
    );
  }
}

if (accepted.length)
  console.warn(`Temporary audited exceptions:\n${accepted.join("\n")}`);
if (failures.length) {
  console.error(
    `Unaccepted high/critical vulnerabilities:\n${failures.join("\n")}`,
  );
  process.exit(1);
}
console.log("No unaccepted high or critical dependency vulnerabilities.");

function extractAdvisoryIds(via, visited = new Set()) {
  return [
    ...new Set(
      (via ?? []).flatMap((item) => {
        if (typeof item === "object" && item.url) {
          return item.url.match(/GHSA-[\w-]+/)?.[0] ?? [];
        }
        if (typeof item === "string" && !visited.has(item)) {
          visited.add(item);
          return extractAdvisoryIds(
            report.vulnerabilities?.[item]?.via,
            visited,
          );
        }
        return [];
      }),
    ),
  ];
}
