import type { QueryResult } from "../schemas/chart-action-schema"
import type { QuerySpec } from "../schemas/copilot-queries"

export type CopilotContext = {
  organizationId: string
  userId: string
  defaultParcelId?: string
}

export type ExecuteQueryFn = (
  query: QuerySpec,
  index: number,
  ctx: CopilotContext
) => Promise<QueryResult>
