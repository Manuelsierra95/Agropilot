import type {
  DashboardCalendarEvent,
  DashboardCampaignMargin,
  DashboardMapParcel,
  DashboardOlivePriceItem,
  DashboardRecommendation,
  DashboardRisks,
  DashboardTransactionSnapshot,
  OilGrade,
  PaymentMethod,
  TaskCategory,
  TaskStatus,
  TransactionCategory,
  TransactionSelect,
} from "@workspace/schemas"
import { TRANSACTION_CATEGORY_LABELS } from "@workspace/schemas"

type MarketPriceRow = { date: string; price: string }

const OLIVE_PRICE_DISPLAY_NAMES: Record<OilGrade, string> = {
  virgen_extra: "Virgen Extra",
  virgen: "Virgen",
  lampante: "Lampante",
}

const MAP_PARCEL_COLORS = [
  "#22c55e",
  "#f59e0b",
  "#3b82f6",
  "#a855f7",
  "#ef4444",
  "#14b8a6",
] as const

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

type SeedRiskLevel = "low" | "medium" | "high"

type SeedRisks = {
  frost?: SeedRiskLevel
  drought?: SeedRiskLevel
  pest?: SeedRiskLevel
  waterStress?: { level?: SeedRiskLevel; score?: number; reasons?: string[] }
  fungalRisk?: { level?: SeedRiskLevel; score?: number; reasons?: string[] }
  insectRisk?: { level?: SeedRiskLevel; score?: number; reasons?: string[] }
  thermalStress?: { level?: SeedRiskLevel; score?: number; reasons?: string[] }
}

function levelToScore(level: SeedRiskLevel): number {
  switch (level) {
    case "low":
      return 0.25
    case "medium":
      return 0.55
    case "high":
      return 0.85
  }
}

function buildRiskDetail(
  level: SeedRiskLevel,
  reasons: string[]
): DashboardRisks["waterStress"] {
  return {
    level,
    score: levelToScore(level),
    reasons,
  }
}

export function mapDbRisksToDashboard(risks: unknown): DashboardRisks {
  const raw = (risks ?? {}) as SeedRisks

  if (raw.waterStress?.level) {
    return {
      waterStress: {
        level: raw.waterStress.level,
        score: raw.waterStress.score ?? levelToScore(raw.waterStress.level),
        reasons: raw.waterStress.reasons ?? [],
      },
      fungalRisk: {
        level: raw.fungalRisk?.level ?? "low",
        score:
          raw.fungalRisk?.score ??
          levelToScore(raw.fungalRisk?.level ?? "low"),
        reasons: raw.fungalRisk?.reasons ?? [],
      },
      insectRisk: {
        level: raw.insectRisk?.level ?? "low",
        score:
          raw.insectRisk?.score ?? levelToScore(raw.insectRisk?.level ?? "low"),
        reasons: raw.insectRisk?.reasons ?? [],
      },
      thermalStress: {
        level: raw.thermalStress?.level ?? "low",
        score:
          raw.thermalStress?.score ??
          levelToScore(raw.thermalStress?.level ?? "low"),
        reasons: raw.thermalStress?.reasons ?? [],
      },
    }
  }

  const drought = raw.drought ?? "low"
  const frost = raw.frost ?? "low"
  const pest = raw.pest ?? "low"

  return {
    waterStress: buildRiskDetail(drought, [
      drought === "high"
        ? "Déficit hídrico prolongado"
        : "Balance hídrico dentro de rangos",
    ]),
    fungalRisk: buildRiskDetail(
      drought === "high" ? "medium" : "low",
      ["Humedad y temperatura favorables a hongos"]
    ),
    insectRisk: buildRiskDetail(pest, [
      pest === "high" ? "Presión de plagas elevada" : "Presión de plagas baja",
    ]),
    thermalStress: buildRiskDetail(frost, [
      frost === "high"
        ? "Riesgo de heladas o estrés térmico"
        : "Temperaturas estables",
    ]),
  }
}

export function mapDbRecommendationsToDashboard(
  recommendations: unknown
): DashboardRecommendation[] {
  if (!recommendations) return []

  if (Array.isArray(recommendations)) {
    return recommendations.map((item, index) => {
      if (typeof item === "string") {
        return {
          type: "general",
          priority: index === 0 ? "high" : "medium",
          message: item,
          details: item,
        }
      }

      const rec = item as {
        type?: string
        priority?: "low" | "medium" | "high"
        message?: string
        details?: string
      }

      return {
        type: rec.type ?? "general",
        priority: rec.priority ?? "medium",
        message: rec.message ?? "",
        details: rec.details ?? rec.message ?? "",
      }
    })
  }

  return []
}

export function mapTransactionToSnapshot(
  tx: TransactionSelect
): DashboardTransactionSnapshot {
  const paymentMethod = (tx.paymentMethod ?? "otro") as PaymentMethod

  return {
    type: tx.flow === "income" ? "ingreso" : "gasto",
    category:
      TRANSACTION_CATEGORY_LABELS[tx.category as TransactionCategory] ??
      tx.category,
    amount: Number(tx.amount),
    paymentMethod,
    invoiceNumber: tx.invoiceNumber ?? undefined,
    date: tx.date,
  }
}

export function buildOlivePriceItems(
  pricesByGrade: Record<OilGrade, MarketPriceRow[]>
): DashboardOlivePriceItem[] {
  return (Object.keys(pricesByGrade) as OilGrade[]).map((grade) => {
    const history = pricesByGrade[grade]
    const numericPrices = history.map((row) => Number(row.price))
    const latest = history.at(-1)

    return {
      name: OLIVE_PRICE_DISPLAY_NAMES[grade],
      price: latest ? Number(latest.price) : 0,
      priceMin: numericPrices.length > 0 ? Math.min(...numericPrices) : 0,
      priceMax: numericPrices.length > 0 ? Math.max(...numericPrices) : 0,
      unit: "€/kg",
      updatedAt: latest?.date ?? new Date().toISOString().slice(0, 10),
      history: history.map((row) => ({
        date: row.date,
        price: Number(row.price),
      })),
    }
  })
}

export function parseWktPolygon(wkt: string | null | undefined): number[][][] | null {
  if (!wkt) return null

  const match = wkt.match(/POLYGON\s*\(\(([^)]+)\)\)/i)
  if (!match?.[1]) return null

  const ring = match[1].split(",").map((pair) => {
    const parts = pair.trim().split(/\s+/).map(Number)
    const lng = parts[0] ?? 0
    const lat = parts[1] ?? 0
    return [lng, lat]
  })

  return ring.length > 0 ? [ring] : null
}

export function parseWktPoint(
  wkt: string | null | undefined
): { lat: number; lng: number } | null {
  if (!wkt) return null

  const match = wkt.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i)
  if (!match?.[1] || !match[2]) return null

  return {
    lng: Number(match[1]),
    lat: Number(match[2]),
  }
}

export function mapParcelsToMapFeatures(
  parcels: {
    id: string
    name: string
    cropType: string
    areaHa: string | null
    polygon: string | null
  }[]
): DashboardMapParcel[] {
  return parcels.flatMap((parcel, index) => {
    const geometryCoordinates = parseWktPolygon(parcel.polygon)
    if (!geometryCoordinates) return []

    return [
      {
        id: parcel.id,
        name: parcel.name,
        area: parcel.areaHa ? Number(parcel.areaHa) : 0,
        type: parcel.cropType,
        color: MAP_PARCEL_COLORS[index % MAP_PARCEL_COLORS.length]!,
        geometryType: "Polygon" as const,
        geometryCoordinates,
      },
    ]
  })
}

type TaskRow = {
  id: string
  title: string
  category: TaskCategory
  parcelId: string | null
  startDate: Date
  endDate: Date | null
  status: TaskStatus
  priority: number
}

export function mapTaskToCalendarEvent(
  task: TaskRow,
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

export function buildCampaignMarginSeries(
  campaignStart: string,
  dailyRows: { date: string; income: string; expense: string }[]
): DashboardCampaignMargin {
  const sorted = [...dailyRows].sort((a, b) => a.date.localeCompare(b.date))

  let cost = 0
  let value = 0

  const points = sorted.map((row) => {
    cost += Number(row.expense)
    value += Number(row.income)
    return {
      date: row.date,
      cost: Math.round(cost),
      value: Math.round(value),
    }
  })

  return {
    campaignStart,
    points,
  }
}

export function buildMonthlyProductionKg(
  dailyRows: { date: string; income: string }[],
  lonjaPrice: number
): number[] {
  const months = Array.from({ length: 12 }, () => 0)

  for (const row of dailyRows) {
    const month = Number(row.date.split("-")[1])
    const index = month >= 10 ? month - 10 : month + 2
    if (index < 0 || index > 11) continue
    const income = Number(row.income)
    if (income > 0 && lonjaPrice > 0) {
      months[index] += Math.round(income / lonjaPrice)
    }
  }

  return months
}

export function getCampaignStartYear(campaignStartDate: string): number {
  const [year, month] = campaignStartDate.split("-").map(Number)
  return month! >= 10 ? year! : year! - 1
}

