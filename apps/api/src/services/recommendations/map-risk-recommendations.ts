import type {
  GeneratedRecommendationInput,
  RecommendationPriority,
  RecommendationType,
} from "@workspace/schemas"
import type { RiskRecommendation } from "@workspace/api/services/weather/domain/weathercloud"

function mapRiskTypeToRecommendationType(
  riskType: RiskRecommendation["riskType"]
): RecommendationType {
  switch (riskType) {
    case "drought":
    case "waterStress":
      return "irrigation"
    case "fungalRisk":
    case "insectRisk":
    case "frost":
      return "treatment"
    case "thermalStress":
      return "inspection"
  }
}

function mapUrgencyToPriority(
  urgency: RiskRecommendation["urgency"]
): RecommendationPriority {
  switch (urgency) {
    case "high":
      return "high"
    case "medium":
      return "medium"
    case "low":
      return "low"
  }
}

function endOfDayPlusHours(date: Date, hours: number): Date {
  const result = new Date(date)
  result.setUTCHours(23, 59, 59, 999)
  result.setTime(result.getTime() + hours * 60 * 60 * 1000)
  return result
}

export function mapRiskRecommendationsToGenerated(
  parcelId: string,
  dayBucket: string,
  recommendations: RiskRecommendation[]
): GeneratedRecommendationInput[] {
  return recommendations.map((rec) => ({
    dedupeKey: `risk_engine:${rec.riskType}:${parcelId}:${dayBucket}`,
    type: mapRiskTypeToRecommendationType(rec.riskType),
    source: "risk_engine" as const,
    title: rec.title,
    details: rec.description,
    priority: mapUrgencyToPriority(rec.urgency),
    expiresAt: endOfDayPlusHours(new Date(`${dayBucket}T12:00:00.000Z`), 24),
    meta: {
      riskType: rec.riskType,
      urgency: rec.urgency,
      window: rec.window,
      actions: rec.actions,
    },
  }))
}
