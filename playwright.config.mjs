import { defineConfig, devices } from "@playwright/test";

const host = "127.0.0.1";
const startupTimeout = Number(
  process.env["E2E_API_STARTUP_TIMEOUT_MS"] ?? 30_000,
);
const artifactRoot = process.env["ARTIFACTS_DIR"] ?? ".artifacts";
const playwrightArtifactRoot = `${artifactRoot}/playwright`;
const ports = {
  api: 3101,
  dash: 5273,
  cash: 5274,
  kitchen: 5275,
  floor: 5276,
  host: 5278,
  guest: 5279,
};

const webapps = {
  dash: {
    command: `npm run preview --workspace apps/web -- --host ${host} --port ${ports.dash} --strictPort`,
    url: `http://${host}:${ports.dash}/login`,
  },
  cash: {
    command: `npm run preview --workspace apps/cashier -- --host ${host} --port ${ports.cash} --strictPort`,
    url: `http://${host}:${ports.cash}`,
  },
  kitchen: {
    command: `npm run preview --workspace apps/kitchen -- --host ${host} --port ${ports.kitchen} --strictPort`,
    url: `http://${host}:${ports.kitchen}`,
  },
  floor: {
    command: `npm run preview --workspace apps/waiter -- --host ${host} --port ${ports.floor} --strictPort`,
    url: `http://${host}:${ports.floor}`,
  },
  host: {
    command: `npm run preview --workspace apps/host -- --host ${host} --port ${ports.host} --strictPort`,
    url: `http://${host}:${ports.host}`,
  },
  guest: {
    command: `npm run preview --workspace apps/customer -- --host ${host} --port ${ports.guest} --strictPort`,
    url: `http://${host}:${ports.guest}`,
  },
};

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  workers: process.env["CI"] ? 1 : undefined,
  reporter: process.env["CI"]
    ? [
        ["line"],
        [
          "junit",
          { outputFile: `${playwrightArtifactRoot}/results/e2e-junit.xml` },
        ],
        [
          "html",
          { open: "never", outputFolder: `${playwrightArtifactRoot}/report` },
        ],
      ]
    : [
        ["list"],
        [
          "html",
          { open: "never", outputFolder: `${playwrightArtifactRoot}/report` },
        ],
      ],
  outputDir: `${playwrightArtifactRoot}/results`,
  use: {
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
    locale: "es-AR",
    timezoneId: "America/Argentina/Buenos_Aires",
  },
  expect: { timeout: 10_000 },
  webServer: webServersFor(process.env["E2E_APP"]),
  projects: [
    appProject("dash", ports.dash, "Desktop Chrome"),
    appProject("host", ports.host, "iPad (gen 7)"),
    appProject("floor", ports.floor, "iPad (gen 7)"),
    appProject("kitchen", ports.kitchen, "iPad (gen 7)"),
    appProject("cash", ports.cash, "iPad (gen 7)"),
    appProject("guest", ports.guest, "Pixel 7"),
    {
      name: "journeys",
      testMatch: /journeys\/mvp-.*\.spec\.ts/,
      fullyParallel: false,
      use: {
        ...devices["iPad (gen 7)"],
        browserName: "chromium",
        baseURL: `http://${host}:${ports.floor}`,
      },
    },
    {
      name: "journey-restart",
      testMatch: /journeys\/restart-durability\.spec\.ts/,
      fullyParallel: false,
      use: {
        ...devices["iPad (gen 7)"],
        browserName: "chromium",
        baseURL: `http://${host}:${ports.floor}`,
      },
    },
  ],
});

function webServersFor(selectedApp) {
  const isJourney =
    selectedApp === "journeys" || selectedApp === "journey-restart";
  const appNames = isJourney
    ? ["dash", "floor", "host", "kitchen", "cash", "guest"]
    : selectedApp
      ? [selectedApp]
      : Object.keys(webapps);
  const selectedWebapps = appNames.map((name) => {
    const server = webapps[name];
    if (!server) {
      throw new Error(`Unknown E2E_APP "${name}"`);
    }
    return {
      name,
      ...server,
      timeout: startupTimeout,
      reuseExistingServer: false,
    };
  });

  return [
    {
      name: "api",
      command: isJourney
        ? `AUTH_DRIVER=fixture PORT=${ports.api} npm run start --workspace apps/api`
        : `PORT=${ports.api} npm run start --workspace apps/api`,
      url: `http://${host}:${ports.api}/health/ready`,
      timeout: startupTimeout,
      reuseExistingServer: false,
      stdout: "pipe",
      stderr: "pipe",
    },
    ...selectedWebapps,
  ];
}

function appProject(name, port, deviceName) {
  return {
    name,
    testMatch: new RegExp(`apps/${name}/.*\\.spec\\.ts`),
    use: {
      ...devices[deviceName],
      browserName: "chromium",
      baseURL: `http://${host}:${port}`,
    },
  };
}
