import {
  gradeLabel,
  metricLabel,
  type CopilotContext,
  type ExecuteQueryFn,
  type QueryResult,
  type QuerySpec,
} from "@workspace/copilot"

import { queryMarketPrices, queryTransactions } from "@/services/finance"
import { queryParcelCashflow, queryParcelWeather } from "@/services/parcel"
import { queryTasks } from "@/services/tasks"

function queryDataKey(query: QuerySpec, index: number): string {
  switch (query.source) {
    case "marketPrices":
      return `${query.grade}_q${index}`
    case "parcelWeather": {
      const parcelId = query.parcelId ?? "default"
      return `${query.metric}_${parcelId}_q${index}`
    }
    case "transactions":
      return `tx_${query.flow ?? "all"}_q${index}`
    case "parcelCashflow":
      return `cashflow_${query.parcelId ?? "all"}_q${index}`
    case "tasks":
      return `tasks_${query.category ?? "all"}_${query.status ?? "all"}_q${index}`
  }
}

async function executeTransactionsQuery(
  query: Extract<QuerySpec, { source: "transactions" }>,
  index: number,
  organizationId: string
): Promise<QueryResult> {
  const rows = await queryTransactions(organizationId, {
    from: query.from,
    to: query.to,
    flow: query.flow,
    category: query.category,
  })

  const dataKey = queryDataKey(query, index)
  const flowLabel =
    query.flow === "income"
      ? "Ingresos"
      : query.flow === "expense"
        ? "Gastos"
        : "Transacciones"

  return {
    query,
    label: flowLabel,
    rows: rows.map((row) => ({
      date: row.date,
      value: Number(row.amount),
      label: row.flow === "income" ? "Ingresos" : "Gastos",
      dataKey,
    })),
  }
}

async function executeMarketPricesQuery(
  query: Extract<QuerySpec, { source: "marketPrices" }>,
  index: number
): Promise<QueryResult> {
  const rows = await queryMarketPrices({
    grade: query.grade,
    from: query.from,
    to: query.to,
  })

  const dataKey = queryDataKey(query, index)
  const label = gradeLabel(query.grade)

  return {
    query,
    label,
    rows: rows.map((row) => ({
      date: row.date,
      value: Number(row.price),
      label,
      dataKey,
    })),
  }
}

async function executeParcelCashflowQuery(
  query: Extract<QuerySpec, { source: "parcelCashflow" }>,
  index: number,
  ctx: CopilotContext
): Promise<QueryResult> {
  const rows = await queryParcelCashflow(
    ctx.organizationId,
    {
      parcelId: query.parcelId,
      from: query.from,
      to: query.to,
    },
    ctx.defaultParcelId
  )

  const baseDataKey = queryDataKey(query, index)

  return {
    query,
    label: "Flujo de caja parcela",
    rows: rows.flatMap((row) => {
      const income = Number(row.income ?? 0)
      const expense = Number(row.expense ?? 0)
      const entries = []

      if (income > 0) {
        entries.push({
          date: row.date,
          value: income,
          label: "Ingresos diarios",
          dataKey: `${baseDataKey}_income`,
        })
      }

      if (expense > 0) {
        entries.push({
          date: row.date,
          value: expense,
          label: "Gastos diarios",
          dataKey: `${baseDataKey}_expense`,
        })
      }

      return entries
    }),
  }
}

async function executeParcelWeatherQuery(
  query: Extract<QuerySpec, { source: "parcelWeather" }>,
  index: number,
  ctx: CopilotContext
): Promise<QueryResult> {
  const rows = await queryParcelWeather(
    ctx.organizationId,
    {
      parcelId: query.parcelId,
      metric: query.metric,
      from: query.from,
      to: query.to,
    },
    ctx.defaultParcelId
  )

  const dataKey = queryDataKey(query, index)
  const metric = metricLabel(query.metric)
  const parcelName = rows[0]?.parcelName

  return {
    query,
    label: parcelName ? `${metric} — ${parcelName}` : metric,
    rows: rows.map((row) => ({
      date: row.date,
      value: row.value,
      label: metric,
      dataKey,
    })),
  }
}

async function executeTasksQuery(
  query: Extract<QuerySpec, { source: "tasks" }>,
  index: number,
  organizationId: string
): Promise<QueryResult> {
  const rows = await queryTasks(organizationId, {
    from: query.from,
    to: query.to,
    status: query.status,
    category: query.category,
  })

  const dataKey = queryDataKey(query, index)

  return {
    query,
    label: "Tareas",
    rows: rows.map((row) => ({
      date: row.startDate.toISOString().slice(0, 10),
      value: 1,
      label: `Tareas ${row.category}`,
      dataKey,
    })),
  }
}

export const executeCopilotQuery: ExecuteQueryFn = async (
  query,
  index,
  ctx
) => {
  switch (query.source) {
    case "transactions":
      return executeTransactionsQuery(query, index, ctx.organizationId)
    case "marketPrices":
      return executeMarketPricesQuery(query, index)
    case "parcelCashflow":
      return executeParcelCashflowQuery(query, index, ctx)
    case "parcelWeather":
      return executeParcelWeatherQuery(query, index, ctx)
    case "tasks":
      return executeTasksQuery(query, index, ctx.organizationId)
  }
}
