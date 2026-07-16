import { app } from "@workspace/api/app"
import { getRuntimeBindings } from "@workspace/api/lib/runtime-bindings"

const PORT = process.env.PORT || 3001
// Bun closes idle connections after this many seconds (default 10). LLM calls need longer.
const COPILOT_IDLE_TIMEOUT_SECONDS = Number(
  process.env.COPILOT_IDLE_TIMEOUT_SECONDS ?? 120
)

export type { AppType } from "@workspace/api/app"
export { app } from "@workspace/api/app"

export default {
  port: PORT,
  fetch(request: Request) {
    return app.fetch(request, getRuntimeBindings())
  },
  idleTimeout: COPILOT_IDLE_TIMEOUT_SECONDS,
}
