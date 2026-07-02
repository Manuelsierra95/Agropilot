import type {
  DashboardRecommendation,
  GeneratedRecommendationInput,
  RecommendationAcceptInput,
  RecommendationListQuery,
  RecommendationSelect,
} from "@workspace/schemas"
import { db, schema, and, asc, eq, gt, inArray } from "@workspace/db"
import { HTTPException } from "hono/http-exception"

export type RecommendationWithParcel = RecommendationSelect & {
  parcelName: string | null
}

export function mapRecommendationToDashboard(
  rec: RecommendationSelect
): DashboardRecommendation {
  return {
    id: rec.id,
    type: rec.type,
    priority: rec.priority,
    message: rec.title,
    details: rec.details,
  }
}

function mapTypeToCategory(type: RecommendationSelect["type"]): string {
  switch (type) {
    case "irrigation":
      return "irrigation"
    case "treatment":
      return "treatment"
    case "fertilization":
      return "fertilization"
    case "inspection":
      return "inspection"
    case "harvest":
      return "harvest"
    case "sale":
      return "harvest"
    default:
      return "inspection"
  }
}

function mapPriorityToTaskPriority(
  priority: RecommendationSelect["priority"]
): number {
  switch (priority) {
    case "high":
      return 3
    case "medium":
      return 2
    case "low":
      return 1
  }
}

function formatTodayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export async function listActiveRecommendations(
  organizationId: string,
  filters: RecommendationListQuery = { status: "pending" }
): Promise<RecommendationWithParcel[]> {
  const now = new Date()
  const conditions = [
    eq(schema.recommendations.organizationId, organizationId),
    eq(schema.recommendations.status, filters.status ?? "pending"),
    gt(schema.recommendations.expiresAt, now),
  ]

  if (filters.parcelId) {
    conditions.push(eq(schema.recommendations.parcelId, filters.parcelId))
  }

  const rows = await db.query.recommendations.findMany({
    where: and(...conditions),
    orderBy: [asc(schema.recommendations.expiresAt)],
  })

  const priorityOrder = { high: 0, medium: 1, low: 2 } as const
  rows.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  )

  if (rows.length === 0) return []

  const parcelIds = [
    ...new Set(rows.map((row) => row.parcelId).filter(Boolean)),
  ] as string[]

  const parcelNameById = new Map<string, string>()
  if (parcelIds.length > 0) {
    const parcelRows = await db.query.parcels.findMany({
      where: and(
        eq(schema.parcels.organizationId, organizationId),
        inArray(schema.parcels.id, parcelIds)
      ),
      columns: { id: true, name: true },
    })
    for (const parcel of parcelRows) {
      parcelNameById.set(parcel.id, parcel.name)
    }
  }

  return rows.map((row) => ({
    ...row,
    parcelName: row.parcelId
      ? (parcelNameById.get(row.parcelId) ?? null)
      : null,
  }))
}

export async function getRecommendationById(
  organizationId: string,
  recommendationId: string
): Promise<RecommendationSelect | null> {
  const rec = await db.query.recommendations.findFirst({
    where: and(
      eq(schema.recommendations.id, recommendationId),
      eq(schema.recommendations.organizationId, organizationId)
    ),
  })

  return rec ?? null
}

export async function dismissRecommendation(
  organizationId: string,
  recommendationId: string
): Promise<RecommendationSelect> {
  const rec = await getRecommendationById(organizationId, recommendationId)

  if (!rec) {
    throw new HTTPException(404, { message: "Recommendation not found" })
  }

  if (rec.status !== "pending") {
    throw new HTTPException(409, {
      message: `Recommendation is already ${rec.status}`,
    })
  }

  if (rec.expiresAt <= new Date()) {
    throw new HTTPException(409, { message: "Recommendation has expired" })
  }

  const [updated] = await db
    .update(schema.recommendations)
    .set({
      status: "dismissed",
      dismissedAt: new Date(),
    })
    .where(eq(schema.recommendations.id, recommendationId))
    .returning()

  return updated!
}

export async function acceptRecommendation(
  organizationId: string,
  recommendationId: string,
  input: RecommendationAcceptInput = {}
) {
  return db.transaction(async (tx) => {
    const rec = await tx.query.recommendations.findFirst({
      where: and(
        eq(schema.recommendations.id, recommendationId),
        eq(schema.recommendations.organizationId, organizationId)
      ),
    })

    if (!rec) {
      throw new HTTPException(404, { message: "Recommendation not found" })
    }

    if (rec.status !== "pending") {
      throw new HTTPException(409, {
        message: `Recommendation is already ${rec.status}`,
      })
    }

    if (rec.expiresAt <= new Date()) {
      throw new HTTPException(409, { message: "Recommendation has expired" })
    }

    const startDate = input.startDate ?? formatTodayISO()

    const [task] = await tx
      .insert(schema.tasks)
      .values({
        organizationId,
        title: rec.title,
        category: mapTypeToCategory(rec.type),
        startDate: new Date(`${startDate}T00:00:00.000Z`),
        description: input.description ?? rec.details,
        parcelId: rec.parcelId,
        priority: input.priority ?? mapPriorityToTaskPriority(rec.priority),
        taskType: "recommended",
        status: "pending",
        source:
          rec.source === "copilot"
            ? "manual"
            : rec.source === "weather" ||
                rec.source === "risk_engine" ||
                rec.source === "market" ||
                rec.source === "sensor"
              ? rec.source
              : "manual",
        sourceId: rec.id,
        recommendationId: rec.id,
        meta: rec.meta,
      })
      .returning()

    const [updatedRec] = await tx
      .update(schema.recommendations)
      .set({
        status: "accepted",
        acceptedAt: new Date(),
      })
      .where(eq(schema.recommendations.id, recommendationId))
      .returning()

    return { task: task!, recommendation: updatedRec! }
  })
}

export async function upsertGeneratedRecommendations(
  organizationId: string,
  parcelId: string,
  items: GeneratedRecommendationInput[]
): Promise<void> {
  for (const item of items) {
    const existing = await db.query.recommendations.findFirst({
      where: and(
        eq(schema.recommendations.organizationId, organizationId),
        eq(schema.recommendations.dedupeKey, item.dedupeKey)
      ),
    })

    if (existing) {
      if (existing.status !== "pending") continue

      await db
        .update(schema.recommendations)
        .set({
          title: item.title,
          details: item.details,
          priority: item.priority,
          type: item.type,
          source: item.source,
          expiresAt: item.expiresAt,
          meta: item.meta,
        })
        .where(eq(schema.recommendations.id, existing.id))
      continue
    }

    await db.insert(schema.recommendations).values({
      organizationId,
      parcelId,
      dedupeKey: item.dedupeKey,
      type: item.type,
      source: item.source,
      title: item.title,
      details: item.details,
      priority: item.priority,
      status: "pending",
      expiresAt: item.expiresAt,
      meta: item.meta,
    })
  }
}

export async function listRecommendationsAsDashboard(
  organizationId: string,
  filters: RecommendationListQuery = { status: "pending" }
): Promise<DashboardRecommendation[]> {
  const rows = await listActiveRecommendations(organizationId, filters)
  return rows.map(mapRecommendationToDashboard)
}

export async function listAllParcelsRecommendationsAsDashboard(
  organizationId: string
): Promise<
  Array<{
    parcelId: string
    parcelName: string
    recommendations: DashboardRecommendation[]
  }>
> {
  const rows = await listActiveRecommendations(organizationId, {
    status: "pending",
  })

  const byParcel = new Map<
    string,
    { parcelName: string; recommendations: DashboardRecommendation[] }
  >()

  for (const row of rows) {
    if (!row.parcelId) continue
    const parcelName = row.parcelName ?? "—"
    const existing = byParcel.get(row.parcelId)
    const dashboardRec = mapRecommendationToDashboard(row)

    if (existing) {
      existing.recommendations.push(dashboardRec)
    } else {
      byParcel.set(row.parcelId, {
        parcelName,
        recommendations: [dashboardRec],
      })
    }
  }

  return [...byParcel.entries()].map(([parcelId, value]) => ({
    parcelId,
    parcelName: value.parcelName,
    recommendations: value.recommendations,
  }))
}
