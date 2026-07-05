import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // Base path for the deployed site. Defaults to "/" (user/org page or custom
  // domain). For a GitHub project page served from a subpath, set
  // VITE_BASE=/REPO-NAME/ (see .env.example and the deploy workflow).
  base: process.env.VITE_BASE || "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
