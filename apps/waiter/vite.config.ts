import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { deploymentBuildInfoDefine } from "../../tooling/deployment/vite-build-info.js";

// Ports in the monorepo: apps/web=5173, apps/kitchen=5175. The Waiter app
// takes 5176 so all three staff/admin frontends can run in parallel on a dev
// machine without colliding.
export default defineConfig({
  define: deploymentBuildInfoDefine(),
  plugins: [react()],
  server: { port: 5176 },
  preview: { port: 5176 },
});
