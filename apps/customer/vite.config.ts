import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Ports in the monorepo: web=5173, cashier=5175, waiter=5176, owner=5177,
// host=5178. Customer gets 5179 for an isolated public/mobile-friendly shell.
export default defineConfig({
  plugins: [react()],
  server: { port: 5179 },
  preview: { port: 5179 },
});
