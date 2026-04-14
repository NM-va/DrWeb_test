import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  publicDir: "../public",
  server: {
    host: true,
    port: 5173,
    strictPort: false,
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
});
