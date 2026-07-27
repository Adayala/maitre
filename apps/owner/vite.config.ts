import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Ports in the monorepo: apps/web=5173, apps/cashier=5175, apps/waiter=5176.
// The Owner app takes 5177 so it can run in parallel without colliding.
export default defineConfig({
  plugins: [react()],
  server: { port: 5177 },
  preview: { port: 5177 },
});
