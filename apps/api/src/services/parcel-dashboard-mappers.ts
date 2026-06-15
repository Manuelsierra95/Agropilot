import type { DashboardRecommendation, DashboardRisks } from "@workspace/schemas"

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
