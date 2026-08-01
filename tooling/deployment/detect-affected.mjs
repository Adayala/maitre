import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export const applications = [
  {
    name: "api",
    project_id: "prj_gAFxIYi8bL5TkpbwpoBYlRyaHqZk",
  },
  {
    name: "web",
    project_id: "prj_9qxMJEtIMVtq8k43SuzVTqsYewgd",
    e2e: { app: "dash", label: "Dash", workspace: "apps/web" },
  },
  {
    name: "kitchen",
    project_id: "prj_DRbMDZIlV9NrPZApEw2CHVxnZD1K",
    e2e: { app: "kitchen", label: "Kitchen", workspace: "apps/kitchen" },
  },
  {
    name: "waiter",
    project_id: "prj_np4ZH8Whi8gfoTj9MuTGoojBOEcH",
    e2e: { app: "floor", label: "Floor", workspace: "apps/waiter" },
  },
  {
    name: "cashier",
    project_id: "prj_VBaKDObIvmSTKWuD2eJsyegtoxni",
    e2e: { app: "cash", label: "Cash", workspace: "apps/cashier" },
  },
  {
    name: "host",
    project_id: "prj_QMdvmmgsDT9S6os663n4vOv8BpeH",
    e2e: { app: "host", label: "Host", workspace: "apps/host" },
  },
  {
    name: "customer",
    project_id: "prj_MpM495erYWa5cbtprfEYQTjKCX0r",
    e2e: { app: "guest", label: "Guest", workspace: "apps/customer" },
  },
];

const frontendByDirectory = new Map(
  applications
    .filter(({ e2e }) => e2e)
    .map((application) => [application.e2e.workspace, application]),
);

const noRuntimeImpact = [
  /^docs\//,
  /^openspec\//,
  /^README\.md$/,
  /^DEPLOYMENT\.md$/,
  /^SECURITY\.md$/,
  /^AGENTS\.md$/,
];

const apiImpact = [/^apps\/api\//, /^supabase\//, /^vercel\.api\.json$/];
const allRuntimeImpact = [
  /^packages\//,
  /^adapters\//,
  /^package(?:-lock)?\.json$/,
  /^tsconfig(?:\.base)?\.json$/,
  /^eslint\.config\.mjs$/,
  /^dependency-cruiser\.config\.cjs$/,
  /^\.github\/workflows\//,
  /^tooling\//,
  /^vercel\.spa\.json$/,
];

export function detectAffected(files, { forceAll = false } = {}) {
  const normalizedFiles = files.map((file) => file.trim()).filter(Boolean);
  const deployNames = new Set();
  const e2eNames = new Set();

  if (forceAll) {
    addAll(deployNames, e2eNames);
  } else {
    for (const file of normalizedFiles) {
      if (noRuntimeImpact.some((pattern) => pattern.test(file))) continue;

      const frontend = [...frontendByDirectory.entries()].find(([directory]) =>
        file.startsWith(`${directory}/`),
      )?.[1];
      if (frontend) {
        deployNames.add(frontend.name);
        e2eNames.add(frontend.name);
        continue;
      }

      if (apiImpact.some((pattern) => pattern.test(file))) {
        deployNames.add("api");
        addAllE2e(e2eNames);
        continue;
      }

      if (file.startsWith("tests/e2e/") || file === "playwright.config.mjs") {
        addAllE2e(e2eNames);
        continue;
      }

      // Shared configuration, dependencies, packages, and unknown runtime files
      // are deliberately conservative: every deployable can be affected.
      if (
        allRuntimeImpact.some((pattern) => pattern.test(file)) ||
        !noRuntimeImpact.some((pattern) => pattern.test(file))
      ) {
        addAll(deployNames, e2eNames);
      }
    }
  }

  const deploy = applications
    .filter(({ name }) => deployNames.has(name))
    .map(({ name, project_id }) => ({ name, project_id }));
  const e2e = applications
    .filter(({ name, e2e: config }) => config && e2eNames.has(name))
    .map(({ e2e: config }) => config);

  return {
    deploy,
    e2e,
    has_deploy: deploy.length > 0,
    has_e2e: e2e.length > 0,
  };
}

function addAll(deployNames, e2eNames) {
  for (const { name } of applications) deployNames.add(name);
  addAllE2e(e2eNames);
}

function addAllE2e(e2eNames) {
  for (const { name, e2e } of applications) {
    if (e2e) e2eNames.add(name);
  }
}

async function main() {
  const forceAll = process.argv.includes("--all");
  const files = readFileSync(0, "utf8").split(/\r?\n/);
  process.stdout.write(
    `${JSON.stringify(detectAffected(files, { forceAll }))}\n`,
  );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
