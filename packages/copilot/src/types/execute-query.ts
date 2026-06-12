import type { QueryResult } from "../schemas/query-result"
import type { QuerySpec } from "../schemas/copilot-queries"

export type CopilotContext = {
  organizationId: string
  userId: string
  organizationName?: string
  activeParcelId?: string
  activeParcelName?: string
}

export type ExecuteQueryFn = (
  query: QuerySpec,
  index: number,
  ctx: CopilotContext
) => Promise<QueryResult>
