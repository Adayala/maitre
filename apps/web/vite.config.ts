import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { deploymentBuildInfoDefine } from "../../tooling/deployment/vite-build-info.js";

export default defineConfig({
  define: deploymentBuildInfoDefine(),
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (id.includes("react-router")) return "router";
          if (id.includes("@tanstack/react-query")) return "query";
          if (id.includes("@supabase")) return "supabase";
          if (id.includes("react-dom") || id.includes("/react/"))
            return "react-core";
        },
      },
    },
  },
  server: { port: 5173 },
});
