import { join } from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import unocss from "unocss/vite"

const root = import.meta.dirname

export default defineConfig({
  resolve: {
    alias: {
      "~": join(root, "src"),
      "@shared": join(root, "shared"),
    },
  },
  plugins: [
    unocss(),
    react(),
  ],
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
  build: {
    outDir: "dist/public",
    emptyOutDir: true,
  },
})
