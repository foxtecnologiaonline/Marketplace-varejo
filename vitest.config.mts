import { defineConfig } from "vitest/config";
import path from "node:path";

const root = import.meta.dirname;

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(root, "src"),
      "server-only": path.resolve(root, "src/test/stubs/server-only.ts")
    }
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts"],
    exclude: ["e2e/**"]
  }
});
