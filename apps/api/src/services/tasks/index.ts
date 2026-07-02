import { db, schema, eq, and, asc, gte, lte } from "@workspace/db"
import type {
  DashboardCalendarEvent,
  DashboardCalendarEventsQuery,
  DashboardUpcomingWeekQuery,
  TaskCreateInput,
  TaskStatus,
  TaskUpdateInput,
} from "@workspace/schemas"
import {
  resolveActiveCampaign,
  resolveCampaignById,
  resolveScopeDateRange,
} from "@workspace/api/services/campaigns"
import { listParcels } from "@workspace/api/services/parcels/queries/list-parcels"

export type { TaskStatus } from "@workspace/schemas"

export type TasksQueryFilters = {
  from: string
  to: string
  status?: TaskStatus
  category?: string
}

export type TaskQueryRow = {
  startDate: Date
  category: string
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

const PRESET_CATEGORY_COLORS: Record<string, string> = {
  irrigation: "blue",
  fertilization: "green",
  treatment: "red",
  harvest: "yellow",
  inspection: "purple",
}

export function getTaskColor(category: string): string {
  return PRESET_CATEGORY_COLORS[category] ?? "gray"
}

const TASK_STATUS_TO_CALENDAR: Record<
  TaskStatus,
  DashboardCalendarEvent["status"]
> = {
  pending: "pending",
  in_progress: "in_progress",
  done: "completed",
  skipped: "completed",
}

function formatDateIso(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function parseTaskScheduleDate(value: string, endOfDay = false): Date {
  if (value.includes("T")) {
    return new Date(value)
  }

  return new Date(
    endOfDay ? `${value}T23:59:59.999Z` : `${value}T00:00:00.000Z`
  )
}

function getWeekRange(weekStart?: string): { from: string; to: string } {
  const reference = weekStart
    ? new Date(`${weekStart}T12:00:00.000Z`)
    : new Date()

  const day = reference.getUTCDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  const monday = new Date(reference)
  monday.setUTCDate(reference.getUTCDate() + diffToMonday)

  const sunday = new Date(monday)
  sunday.setUTCDate(monday.getUTCDate() + 6)

  return { from: formatDateIso(monday), to: formatDateIso(sunday) }
}

function mapTaskToCalendarEvent(
  task: {
    id: string
    title: string
    category: string
    parcelId: string | null
    startDate: Date
    endDate: Date | null
    status: TaskStatus
    priority: number
  },
  parcelName: string
): DashboardCalendarEvent {
  const end = task.endDate ?? task.startDate

  return {
    id: task.id,
    title: task.title,
    type: task.category,
    parcelId: task.parcelId ?? "",
    parcelName,
    color: getTaskColor(task.category),
    status: TASK_STATUS_TO_CALENDAR[task.status],
    start: task.startDate.toISOString(),
    end: end.toISOString(),
    meta: task.priority
      ? {
          priority:
            task.priority >= 3
              ? "high"
              : task.priority >= 2
                ? "medium"
                : "low",
        }
      : undefined,
  }
}

const CALENDAR_EVENTS_LIMIT = 500

export async function listCalendarTasks(
  organizationId: string,
  filters: DashboardCalendarEventsQuery = {}
): Promise<DashboardCalendarEvent[]> {
  const campaign = filters.campaignId
    ? await resolveCampaignById(filters.campaignId)
    : await resolveActiveCampaign()

  const { from, to } = resolveScopeDateRange(campaign, filters)

  const tasks = await db.query.tasks.findMany({
    where: and(
      eq(schema.tasks.organizationId, organizationId),
      gte(schema.tasks.startDate, new Date(`${from}T00:00:00.000Z`)),
      lte(schema.tasks.startDate, new Date(`${to}T23:59:59.999Z`)),
      ...(filters.parcelId
        ? [eq(schema.tasks.parcelId, filters.parcelId)]
        : [])
    ),
    orderBy: [asc(schema.tasks.startDate)],
    limit: CALENDAR_EVENTS_LIMIT,
  })

  const parcels = await listParcels(organizationId)
  const parcelNameById = new Map(parcels.map((p) => [p.id, p.name]))

  return tasks.map((task) =>
    mapTaskToCalendarEvent(
      task,
      task.parcelId ? (parcelNameById.get(task.parcelId) ?? "—") : "—"
    )
  )
}

export async function listUpcomingWeekTasks(
  organizationId: string,
  filters: DashboardUpcomingWeekQuery = {}
): Promise<DashboardCalendarEvent[]> {
  const { from, to } = getWeekRange(filters.weekStart)

  const tasks = await db.query.tasks.findMany({
    where: and(
      eq(schema.tasks.organizationId, organizationId),
      gte(schema.tasks.startDate, new Date(`${from}T00:00:00.000Z`)),
      lte(schema.tasks.startDate, new Date(`${to}T23:59:59.999Z`)),
      ...(filters.parcelId
        ? [eq(schema.tasks.parcelId, filters.parcelId)]
        : [])
    ),
    orderBy: [asc(schema.tasks.startDate)],
    limit: 50,
  })

  const parcels = await listParcels(organizationId)
  const parcelNameById = new Map(parcels.map((p) => [p.id, p.name]))

  return tasks.map((task) =>
    mapTaskToCalendarEvent(
      task,
      task.parcelId ? (parcelNameById.get(task.parcelId) ?? "—") : "—"
    )
  )
}

export async function createTask(
  organizationId: string,
  data: TaskCreateInput
) {
  const [task] = await db
    .insert(schema.tasks)
    .values({
      organizationId,
      title: data.title,
      category: data.category,
      startDate: new Date(`${data.startDate}T00:00:00.000Z`),
      description: data.description,
      parcelId: data.parcelId,
      priority: data.priority ?? 0,
      taskType: "manual",
      status: "pending",
      source: "manual",
    })
    .returning()

  return task
}

export async function getTaskById(organizationId: string, taskId: string) {
  const task = await db.query.tasks.findFirst({
    where: and(
      eq(schema.tasks.id, taskId),
      eq(schema.tasks.organizationId, organizationId)
    ),
  })

  return task ?? null
}

export async function updateTask(
  organizationId: string,
  taskId: string,
  data: TaskUpdateInput
) {
  const values: Partial<typeof schema.tasks.$inferInsert> = {}

  if (data.title !== undefined) values.title = data.title
  if (data.category !== undefined) values.category = data.category
  if (data.description !== undefined) values.description = data.description
  if (data.parcelId !== undefined) values.parcelId = data.parcelId
  if (data.priority !== undefined) values.priority = data.priority
  if (data.status !== undefined) values.status = data.status

  if (data.startDate !== undefined) {
    values.startDate = parseTaskScheduleDate(data.startDate)
  }

  if (data.endDate !== undefined) {
    values.endDate = data.endDate
      ? parseTaskScheduleDate(data.endDate, true)
      : null
  }

  const [task] = await db
    .update(schema.tasks)
    .set(values)
    .where(
      and(eq(schema.tasks.id, taskId), eq(schema.tasks.organizationId, organizationId))
    )
    .returning()

  return task ?? null
}

export async function deleteTask(organizationId: string, taskId: string) {
  const result = await db
    .delete(schema.tasks)
    .where(
      and(eq(schema.tasks.id, taskId), eq(schema.tasks.organizationId, organizationId))
    )
    .returning({ id: schema.tasks.id })

  return result.length > 0
}
