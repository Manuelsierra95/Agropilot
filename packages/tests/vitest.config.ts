import path from "node:path"
import { defineConfig } from "vitest/config"

const apiRoot = path.resolve(__dirname, "../../apps/api")
const packagesRoot = path.resolve(__dirname, "../../packages")

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    setupFiles: ["./src/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(apiRoot, "src"),
      "@env": path.resolve(apiRoot, "env.d.ts"),
      "api/app": path.resolve(apiRoot, "src/app.ts"),
      "@workspace/db/schemas": path.resolve(
        packagesRoot,
        "db/src/schemas/index.ts"
      ),
      "@workspace/db": path.resolve(packagesRoot, "db/src/index.ts"),
      "@workspace/auth/permissions": path.resolve(
        packagesRoot,
        "auth/src/permissions.ts"
      ),
      "@workspace/auth": path.resolve(packagesRoot, "auth/src/index.ts"),
      "@workspace/schemas": path.resolve(packagesRoot, "schemas/src/index.ts"),
      "@workspace/scrapers": path.resolve(packagesRoot, "scrapers/src/index.ts"),
      "@workspace/copilot": path.resolve(packagesRoot, "copilot/src/index.ts"),
    },
  },
})
