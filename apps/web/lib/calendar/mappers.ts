import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import type {
  DashboardCalendarEvent,
  DashboardRecommendation,
  DashboardRisks,
  ParcelWeatherResponse,
} from "@workspace/schemas"

import type { ForecastDay } from "@workspace/web/features/calendar/components/calendar/sidecards/time-weather-card"
import type { Recommendation } from "@workspace/web/features/tasks/components/recommendations-card"
import type { CalendarTask } from "@workspace/web/lib/calendar/types"

export function toCalendarTasks(
  events: DashboardCalendarEvent[]
): CalendarTask[] {
  return events.map((event) => ({
    ...event,
    category: event.type,
    start: new Date(event.start),
    end: new Date(event.end),
  }))
}

type ActiveAlert = {
  id: string
  title: string
  description: string
  severity: "critical" | "warning"
  parcelName: string
  type: "rain" | "disease" | "pest" | "heat"
  since: string
}

const RISK_LABELS: Record<keyof DashboardRisks, string> = {
  waterStress: "Estrés hídrico",
  fungalRisk: "Riesgo fúngico",
  insectRisk: "Riesgo de insectos",
  thermalStress: "Estrés térmico",
}

const RISK_TYPES: Record<keyof DashboardRisks, ActiveAlert["type"]> = {
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

function recommendationAction(type: string): Recommendation["action"] {
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
  parcelId: string,
  id: string
): Recommendation {
  return {
    id,
    parcelId,
    parcelName,
    title: rec.message,
    reason: rec.details,
    action: recommendationAction(rec.type),
    when:
      rec.priority === "high"
        ? "Ahora"
        : rec.priority === "medium"
          ? "Próximos días"
          : "Planificar",
    urgency: priorityToUrgency(rec.priority),
  }
}

export function parcelRecommendationsToCardItems(
  recommendations: DashboardRecommendation[],
  parcelName: string,
  parcelId: string
): Recommendation[] {
  return recommendations.map((rec) =>
    apiRecommendationToCardItem(rec, parcelName, parcelId, rec.id)
  )
}

export function allParcelsRecommendationsToCardItems(
  items: Array<{
    id: string
    parcelId: string
    parcelName: string
    type: string
    priority: "low" | "medium" | "high"
    message: string
    details: string
  }>
): Recommendation[] {
  return items.map((item) =>
    apiRecommendationToCardItem(
      {
        id: item.id,
        type: item.type,
        priority: item.priority,
        message: item.message,
        details: item.details,
      },
      item.parcelName,
      item.parcelId,
      item.id
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
  const byDate = new Map(weather.forecast.map((entry) => [entry.date, entry]))

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
