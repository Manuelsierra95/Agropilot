import type { DashboardRecommendation } from "@workspace/schemas"

export type WeatherRiskLevel = "low" | "medium" | "high"

export type ParcelItem = {
  id: string
  name: string
  area: number
  type: string
  irrigationType: string
}

export type ParcelApiDailyItem = {
  date: string
  icon: string
  tempMin: number
  tempMax: number
  precipitation: number
  waterBalance: number
  hasWaterDeficit: boolean
}

export type ParcelApiMetrics = {
  water: {
    deficit7d: number
    deficit15d: number
    deficit30d: number
    eto7d: number
    eto30d: number
  }
  temperature: {
    avg7d: number
    avg30d: number
    trend: number
    heatStressDays: number
    coldStressDays: number
  }
  rain: {
    rain7d: number
    rain30d: number
    trend: number
    dryDaysConsecutive: number
    dryDays7d: number
  }
  crop: {
    gdd: number
    gdd30d: number
    kc: number
    stage: string
    isCritical: boolean
  }
  environment: {
    humidityAvg7d: number
    humidityAvg30d: number
    variabilityIndex: number
  }
}

export type RiskAction = {
  type: "irrigation" | "treatment" | "inspection" | "note"
  label: string
  payload?: Record<string, unknown>
}

export type RiskRecommendation = {
  title: string
  description: string
  urgency: "low" | "medium" | "high"
  window?: string
  actions: RiskAction[]
}

export type ParcelApiRiskDetail = {
  level: WeatherRiskLevel
  score: number
  reasons: string[]
  recommendation?: RiskRecommendation
}

export type ParcelApiResponse = {
  request: {
    parcelId: string
    coords: {
      lat: number
      lng: number
    }
    cropType: string
    cropName: string
    days: number
  }
  summary: {
    stationId: string
    lastUpdate: string
  }
  dataRange: {
    start: string
    end: string
  }
  daily: {
    data: ParcelApiDailyItem[]
    recent: ParcelApiDailyItem[]
  }
  metrics: ParcelApiMetrics
  risks: {
    waterStress: ParcelApiRiskDetail
    fungalRisk: ParcelApiRiskDetail
    insectRisk: ParcelApiRiskDetail
    thermalStress: ParcelApiRiskDetail
  }
  units: {
    daily: {
      tempMin: string
      tempMax: string
      precipitation: string
      waterBalance: string
    }
    metrics: {
      water: {
        deficit7d: string
        deficit15d: string
        deficit30d: string
        eto7d: string
        eto30d: string
      }
      temperature: {
        avg7d: string
        avg30d: string
        trend: string
        heatStressDays: string
        coldStressDays: string
      }
      rain: {
        rain7d: string
        rain30d: string
        trend: string
        dryDaysConsecutive: string
        dryDays7d: string
      }
      crop: {
        gdd: string
        gdd30d: string
        kc: string
      }
      environment: {
        humidityAvg7d: string
        humidityAvg30d: string
        variabilityIndex: string
      }
    }
    risks: {
      score: string
    }
  }
  recommendations: DashboardRecommendation[]
}

export type ParcelComparisonItem = {
  name: string
  area: number
  rain30d: number
  tempAvg: number
  waterDeficit30d: number
  dryDaysConsecutive: number
  heatStressDays: number
  waterStress: WeatherRiskLevel
}

export type AllModeSummary = {
  totalArea: number
  avgRain30d: number
  avgTemp: number
  highWaterStressCount: number
  maxDry?: ParcelComparisonItem
  maxDeficit?: ParcelComparisonItem
}

/** Legacy shape used by chart components before full apiResponse wiring. */
export type WeatherDaily = {
  date: string
  tempMax: number
  tempMin: number
  precipitation: number
  waterBalance?: number
}

export type WeatherMetrics = {
  waterDeficit7d: number
  waterDeficit15d: number
  waterDeficit30d: number
  dryDaysConsecutive: number
  tempTrend: number
  rainTrend: number
  heatStressDays: number
  coldStressDays: number
  rain7d: number
  rain30d: number
  tempAvg: number
  variabilityIndex: number
}

export type AgroclimateMetrics = {
  currentTemp: number
  tempTrendPct: number
  tempTrend: "up" | "down" | "stable"
  kc: number
  gdd: number
  phenoStage: string
}

export type YieldData = {
  trees: number
  totalKg: number
}
