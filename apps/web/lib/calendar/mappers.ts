import { differenceInCalendarDays, format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import type {
  DashboardCalendarEvent,
  DashboardRecommendation,
  DashboardRisks,
  ParcelWeatherResponse,
} from "@workspace/schemas"

import type { ActiveAlert } from "@/features/calendar/components/active-alerts-card"
import type { ForecastDay } from "@/features/calendar/components/calendar/sidecards/time-weather-card"
import type { Recommendation } from "@/features/calendar/components/recommendations-card"
import type {
  CalendarEvent,
  CampaignTimelineData,
  CampaignTimelineTask,
} from "@/lib/calendar/types"

export function toCalendarEvents(
  events: DashboardCalendarEvent[]
): CalendarEvent[] {
  return events.map((event) => ({
    ...event,
    start: new Date(event.start),
    end: new Date(event.end),
  }))
}

const RISK_LABELS: Record<keyof DashboardRisks, string> = {
  waterStress: "Estrés hídrico",
  fungalRisk: "Riesgo fúngico",
  insectRisk: "Riesgo de insectos",
  thermalStress: "Estrés térmico",
}

const RISK_TYPES: Record<
  keyof DashboardRisks,
  ActiveAlert["type"]
> = {
  waterStress: "rain",
  fungalRisk: "disease",
  insectRisk: "pest",
  thermalStress: "heat",
}

function levelToSeverity(
  level: DashboardRisks[keyof DashboardRisks]["level"]
): ActiveAlert["severity"] | null {
  if (level === "high") return "critical"
  if (level === "medium") return "warning"
  return null
}

export function risksToActiveAlerts(
  risks: DashboardRisks,
  parcelName: string
): ActiveAlert[] {
  const now = new Date().toISOString()
  const alerts: ActiveAlert[] = []

  for (const key of Object.keys(RISK_LABELS) as Array<keyof DashboardRisks>) {
    const risk = risks[key]
    const severity = levelToSeverity(risk.level)
    if (!severity) continue

    alerts.push({
      id: `${parcelName}-${key}`,
      title: RISK_LABELS[key],
      description: risk.reasons[0] ?? "Riesgo detectado en la parcela.",
      severity,
      parcelName,
      type: RISK_TYPES[key],
      since: now,
    })
  }

  return alerts
}

export function risksToActiveAlertsAll(
  parcels: Array<{
    parcelId: string
    name: string
    risks: DashboardRisks
  }>
): ActiveAlert[] {
  return parcels.flatMap((parcel) =>
    risksToActiveAlerts(parcel.risks, parcel.name).map((alert) => ({
      ...alert,
      id: `${parcel.parcelId}-${alert.id}`,
    }))
  )
}

function recommendationAction(
  type: string
): Recommendation["action"] {
  if (type.includes("irrig") || type === "irrigation") return "irrigate"
  if (type.includes("treat")) return "treat"
  if (type.includes("inspect")) return "inspect"
  return "schedule"
}

function priorityToUrgency(
  priority: DashboardRecommendation["priority"]
): Recommendation["urgency"] {
  if (priority === "high") return "now"
  if (priority === "medium") return "soon"
  return "plan"
}

export function apiRecommendationToCardItem(
  rec: DashboardRecommendation,
  parcelName: string,
  id: string
): Recommendation {
  return {
    id,
    title: rec.message,
    reason: rec.details,
    action: recommendationAction(rec.type),
    when:
      rec.priority === "high"
        ? "Ahora"
        : rec.priority === "medium"
          ? "Próximos días"
          : "Planificar",
    parcelName,
    urgency: priorityToUrgency(rec.priority),
  }
}

export function parcelRecommendationsToCardItems(
  recommendations: DashboardRecommendation[],
  parcelName: string
): Recommendation[] {
  return recommendations.map((rec, index) =>
    apiRecommendationToCardItem(rec, parcelName, `rec-${index}`)
  )
}

export function allParcelsRecommendationsToCardItems(
  items: Array<{
    parcelId: string
    parcelName: string
    type: string
    priority: "low" | "medium" | "high"
    message: string
    details: string
  }>
): Recommendation[] {
  return items.map((item, index) =>
    apiRecommendationToCardItem(
      {
        type: item.type,
        priority: item.priority,
        message: item.message,
        details: item.details,
      },
      item.parcelName,
      `rec-all-${item.parcelId}-${index}`
    )
  )
}

function addDaysIso(isoDate: string, days: number): string {
  const date = parseISO(isoDate)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function weatherResponseToForecast(
  weather: ParcelWeatherResponse,
  fromDate = new Date().toISOString().slice(0, 10)
): ForecastDay[] {
  const byDate = new Map(
    weather.forecast.map((entry) => [entry.date, entry])
  )

  return Array.from({ length: 5 }, (_, index) => {
    const date = addDaysIso(fromDate, index)
    const entry = byDate.get(date)
    if (!entry) {
      return {
        date,
        day: format(parseISO(date), "EEE d", { locale: es }),
        condition: "cloudy" as const,
        tempMax: 0,
        tempMin: 0,
        humidity: 0,
      }
    }

    return {
      date: entry.date,
      day: format(parseISO(entry.date), "EEE d", { locale: es }),
      condition: entry.condition,
      tempMax: entry.tempMax,
      tempMin: entry.tempMin,
      humidity: entry.humidity,
    }
  })
}

function mapEventStatus(
  status: CalendarEvent["status"]
): CampaignTimelineTask["status"] {
  return status
}

export function eventsToCampaignTimeline(
  events: CalendarEvent[],
  campaignStart: string,
  campaignEnd: string,
  title: string
): CampaignTimelineData {
  const start = parseISO(campaignStart)
  const end = parseISO(campaignEnd)
  const totalDays = Math.max(1, differenceInCalendarDays(end, start) + 1)
  const today = new Date()
  const todayIndex = Math.min(
    Math.max(0, differenceInCalendarDays(today, start)),
    totalDays - 1
  )

  const days = Array.from({ length: totalDays }, (_, index) => {
    const day = new Date(start)
    day.setUTCDate(start.getUTCDate() + index)
    return format(day, "EEE d", { locale: es })
  })

  const tasks: CampaignTimelineTask[] = events.map((event) => {
    const startDay = Math.max(
      0,
      differenceInCalendarDays(event.start, start)
    )
    const endDay = Math.max(
      startDay,
      differenceInCalendarDays(event.end, start)
    )
    const durationDays = Math.max(1, endDay - startDay + 1)

    return {
      id: event.id,
      name: event.title,
      status: mapEventStatus(event.status),
      startDay: Math.min(startDay, totalDays - 1),
      durationDays: Math.min(durationDays, totalDays - startDay),
      note: event.parcelName,
    }
  })

  return { tasks, days, todayIndex, title }
}
