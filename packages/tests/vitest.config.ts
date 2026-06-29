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
    alias: [
      { find: /^@workspace\/api\/(.+)$/, replacement: path.resolve(apiRoot, "src/$1") },
      { find: "@workspace/api/env", replacement: path.resolve(apiRoot, "env.d.ts") },
      { find: /^@workspace\/db\/(.+)$/, replacement: path.resolve(packagesRoot, "db/src/$1") },
      { find: "@workspace/db", replacement: path.resolve(packagesRoot, "db/src/index.ts") },
      { find: /^@workspace\/auth\/(.+)$/, replacement: path.resolve(packagesRoot, "auth/src/$1") },
      { find: "@workspace/auth/permissions", replacement: path.resolve(packagesRoot, "auth/src/permissions.ts") },
      { find: "@workspace/auth", replacement: path.resolve(packagesRoot, "auth/src/index.ts") },
      { find: /^@workspace\/schemas\/(.+)$/, replacement: path.resolve(packagesRoot, "schemas/src/$1") },
      { find: "@workspace/schemas", replacement: path.resolve(packagesRoot, "schemas/src/index.ts") },
      { find: /^@workspace\/scrapers\/(.+)$/, replacement: path.resolve(packagesRoot, "scrapers/src/$1") },
      { find: "@workspace/scrapers", replacement: path.resolve(packagesRoot, "scrapers/src/index.ts") },
      { find: /^@workspace\/copilot\/(.+)$/, replacement: path.resolve(packagesRoot, "copilot/src/$1") },
      { find: "@workspace/copilot", replacement: path.resolve(packagesRoot, "copilot/src/index.ts") },
    ],
  },
})
