import type { QueryResult, QuerySpec } from "../schemas/chart-action-schema"

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
