import { db, schema, eq, and, asc, gte, lte } from "@workspace/db"

export type TaskStatus = "pending" | "in_progress" | "done" | "skipped"

export type TaskCategory =
  | "irrigation"
  | "fertilization"
  | "treatment"
  | "harvest"
  | "inspection"

export type TasksQueryFilters = {
  from: string
  to: string
  status?: TaskStatus
  category?: TaskCategory
}

export type TaskQueryRow = {
  startDate: Date
  category: TaskCategory
  status: TaskStatus
}

export async function queryTasks(
  organizationId: string,
  filters: TasksQueryFilters
): Promise<TaskQueryRow[]> {
  const conditions = [
    eq(schema.tasks.organizationId, organizationId),
    gte(schema.tasks.startDate, new Date(`${filters.from}T00:00:00.000Z`)),
    lte(schema.tasks.startDate, new Date(`${filters.to}T23:59:59.999Z`)),
  ]

  if (filters.status) {
    conditions.push(eq(schema.tasks.status, filters.status))
  }

  if (filters.category) {
    conditions.push(eq(schema.tasks.category, filters.category))
  }

  return db.query.tasks.findMany({
    where: and(...conditions),
    orderBy: [asc(schema.tasks.startDate)],
    columns: {
      startDate: true,
      category: true,
      status: true,
    },
  })
}
