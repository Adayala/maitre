import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Ports in the monorepo: web=5173, cashier=5175, waiter=5176, owner=5177.
// Host/maître gets 5178 to keep each role app isolated in local dev.
export default defineConfig({
  plugins: [react()],
  server: { port: 5178 },
  preview: { port: 5178 },
});
