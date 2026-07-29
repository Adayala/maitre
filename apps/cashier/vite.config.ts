import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { deploymentBuildInfoDefine } from "../../tooling/deployment/vite-build-info.js";

// Ports in the monorepo: web=5173, cashier=5174, kitchen=5175, waiter=5176,
// owner=5177, host=5178, customer=5179, staff=5180.
export default defineConfig({
  define: deploymentBuildInfoDefine(),
  plugins: [react()],
  server: { port: 5174 },
  preview: { port: 5174 },
});
