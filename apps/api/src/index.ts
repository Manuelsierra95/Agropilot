import { app } from "./app"

const PORT = process.env.PORT || 3001
// Bun closes idle connections after this many seconds (default 10). LLM calls need longer.
const COPILOT_IDLE_TIMEOUT_SECONDS = Number(
  process.env.COPILOT_IDLE_TIMEOUT_SECONDS ?? 120
)

export type { AppType } from "./app"
export { app } from "./app"

export default {
  port: PORT,
  fetch: app.fetch,
  idleTimeout: COPILOT_IDLE_TIMEOUT_SECONDS,
}
