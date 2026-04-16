import path from "node:path";
import { defineConfig } from "vite";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";

export default defineConfig({
  root: "src",
  publicDir: "../public",
  plugins: [
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), "src/assets/img/icons")],
      symbolId: "icon-[dir]-[name]",
    }),
  ],
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
