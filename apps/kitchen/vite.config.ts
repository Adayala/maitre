import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { deploymentBuildInfoDefine } from "../../tooling/deployment/vite-build-info.js";

// apps/web owns 5173; the KDS app takes its own port so both can run in
// parallel on a dev machine (5174 is often taken by other local apps).
export default defineConfig({
  define: deploymentBuildInfoDefine(),
  plugins: [react()],
  server: { port: 5175 },
  preview: { port: 5175 },
});
