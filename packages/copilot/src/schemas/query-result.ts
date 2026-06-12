import type { QuerySpec } from "./copilot-queries"

export type QueryResultRow = {
  date: string
  value: number
  label: string
  dataKey: string
}

export type QueryResultError = "not_implemented"

export type QueryResult = {
  query: QuerySpec
  rows: QueryResultRow[]
  label: string
  error?: QueryResultError
}
