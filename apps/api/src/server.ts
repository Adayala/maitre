import { buildApp } from "./app.js";
import { createTelemetryFromEnvironment } from "@maitre/telemetry";

const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? "0.0.0.0";
const runtimeTelemetry = createTelemetryFromEnvironment();

buildApp(undefined, runtimeTelemetry.telemetry)
  .then(async (app) => {
    app.addHook("onClose", async () => runtimeTelemetry.shutdown());
    await app.listen({ port, host });
    const shutdown = async () => {
      await app.close();
      process.exit(0);
    };
    process.once("SIGTERM", () => void shutdown());
    process.once("SIGINT", () => void shutdown());
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
