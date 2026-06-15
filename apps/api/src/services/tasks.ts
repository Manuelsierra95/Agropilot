import { db, schema, eq, and, asc, gte, lte } from "@workspace/db"
import type {
  DashboardCalendarEvent,
  DashboardCalendarEventsQuery,
  DashboardUpcomingWeekQuery,
  TaskCategory,
  TaskCreateInput,
  TaskStatus,
} from "@workspace/schemas"
import {
  resolveActiveCampaign,
  resolveCampaignById,
  resolveScopeDateRange,
} from "@/services/campaign"
import { resolveParcelIdForOrg, listParcels } from "@/services/parcel"

export type { TaskCategory, TaskStatus } from "@workspace/schemas"

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

const TASK_CATEGORY_COLORS: Record<TaskCategory, string> = {
  irrigation: "blue",
  fertilization: "green",
  treatment: "red",
  harvest: "yellow",
  inspection: "purple",
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
    category: TaskCategory
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
    color: TASK_CATEGORY_COLORS[task.category],
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
  const resolvedParcelId = filters.parcelId
    ? await resolveParcelIdForOrg(organizationId, filters.parcelId)
    : null

  const tasks = await db.query.tasks.findMany({
    where: and(
      eq(schema.tasks.organizationId, organizationId),
      gte(schema.tasks.startDate, new Date(`${from}T00:00:00.000Z`)),
      lte(schema.tasks.startDate, new Date(`${to}T23:59:59.999Z`)),
      ...(resolvedParcelId
        ? [eq(schema.tasks.parcelId, resolvedParcelId)]
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
  const resolvedParcelId = filters.parcelId
    ? await resolveParcelIdForOrg(organizationId, filters.parcelId)
    : null

  const tasks = await db.query.tasks.findMany({
    where: and(
      eq(schema.tasks.organizationId, organizationId),
      gte(schema.tasks.startDate, new Date(`${from}T00:00:00.000Z`)),
      lte(schema.tasks.startDate, new Date(`${to}T23:59:59.999Z`)),
      ...(resolvedParcelId
        ? [eq(schema.tasks.parcelId, resolvedParcelId)]
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
