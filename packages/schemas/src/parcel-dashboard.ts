import z from "zod"
import { taskCategorySchema } from "./tasks"

export const dashboardOlivarSchema = z.object({
  name: z.string(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  stationId: z.string(),
  cropType: z.string(),
  area: z.number(),
  lastUpdate: z.string().datetime(),
  temperature: z.number(),
  temperatureChange: z.number(),
  phenologicalStage: z.string(),
  gdd: z.number(),
  gddTarget: z.number(),
  kc: z.number(),
  waterBalance: z.number(),
  estimatedProfitability: z.number(),
  participants: z.number(),
  pendingTasks: z.number(),
  completedTasks: z.number(),
  totalTrees: z.number(),
  totalYieldKg: z.number(),
  aiInsight: z.string(),
})

export const dashboardRiskDetailSchema = z.object({
  level: z.enum(["low", "medium", "high"]),
  score: z.number().min(0).max(1),
  reasons: z.array(z.string()),
  recommendation: z
    .object({
      title: z.string(),
      description: z.string(),
      urgency: z.enum(["low", "medium", "high"]),
      window: z.string().optional(),
      actions: z.array(
        z.object({
          type: z.enum(["irrigation", "treatment", "inspection", "note"]),
          label: z.string(),
          payload: z.record(z.string(), z.unknown()).optional(),
        })
      ),
    })
    .optional(),
})

export const dashboardRisksSchema = z.object({
  waterStress: dashboardRiskDetailSchema,
  fungalRisk: dashboardRiskDetailSchema,
  insectRisk: dashboardRiskDetailSchema,
  thermalStress: dashboardRiskDetailSchema,
})

export const dashboardRecommendationSchema = z.object({
  type: z.string(),
  priority: z.enum(["low", "medium", "high"]),
  message: z.string(),
  details: z.string(),
})

export const dashboardMapParcelSchema = z.object({
  id: z.string(),
  name: z.string(),
  area: z.number(),
  type: z.string(),
  color: z.string(),
  geometryType: z.literal("Polygon"),
  geometryCoordinates: z.array(z.array(z.array(z.number()))),
})

export const dashboardParcelMapResponseSchema = z.object({
  mapParcels: z.array(dashboardMapParcelSchema),
})

export const dashboardParcelRecommendationsResponseSchema = z.object({
  recommendations: z.array(dashboardRecommendationSchema),
})

export const dashboardParcelRisksResponseSchema = z.object({
  risks: dashboardRisksSchema,
})

export const dashboardCropOverviewResponseSchema = z.object({
  olivar: dashboardOlivarSchema,
})

export const dashboardParcelCropOverviewItemSchema = dashboardOlivarSchema.extend(
  {
    parcelId: z.string().uuid(),
  }
)

export const dashboardParcelsCropOverviewsSchema = z.object({
  parcels: z.array(dashboardParcelCropOverviewItemSchema),
})

export const dashboardParcelsCropOverviewsResponseSchema = z.object({
  cropOverviews: dashboardParcelsCropOverviewsSchema,
})

export const dashboardParcelRecommendationsItemSchema = z.object({
  parcelId: z.string().uuid(),
  name: z.string(),
  recommendations: z.array(dashboardRecommendationSchema),
})

export const dashboardParcelsRecommendationsSchema = z.object({
  parcels: z.array(dashboardParcelRecommendationsItemSchema),
})

export const dashboardParcelsRecommendationsResponseSchema = z.object({
  parcelsRecommendations: dashboardParcelsRecommendationsSchema,
})

export const dashboardParcelRisksItemSchema = z.object({
  parcelId: z.string().uuid(),
  name: z.string(),
  risks: dashboardRisksSchema,
})

export const dashboardParcelsRisksSchema = z.object({
  parcels: z.array(dashboardParcelRisksItemSchema),
})

export const dashboardParcelsRisksResponseSchema = z.object({
  parcelsRisks: dashboardParcelsRisksSchema,
})

export const dashboardParcelAgroclimateDailyItemSchema = z.object({
  date: z.string().date(),
  icon: z.string(),
  tempMin: z.number(),
  tempMax: z.number(),
  precipitation: z.number(),
  waterBalance: z.number(),
  hasWaterDeficit: z.boolean(),
})

export const dashboardParcelAgroclimateMetricsSchema = z.object({
  water: z.object({
    deficit7d: z.number(),
    deficit15d: z.number(),
    deficit30d: z.number(),
    eto7d: z.number(),
    eto30d: z.number(),
  }),
  temperature: z.object({
    avg7d: z.number(),
    avg30d: z.number(),
    trend: z.number(),
    heatStressDays: z.number(),
    coldStressDays: z.number(),
  }),
  rain: z.object({
    rain7d: z.number(),
    rain30d: z.number(),
    trend: z.number(),
    dryDaysConsecutive: z.number(),
    dryDays7d: z.number(),
  }),
  crop: z.object({
    gdd: z.number(),
    gdd30d: z.number(),
    kc: z.number(),
    stage: z.string(),
    isCritical: z.boolean(),
  }),
  environment: z.object({
    humidityAvg7d: z.number(),
    humidityAvg30d: z.number(),
    variabilityIndex: z.number(),
  }),
})

export const dashboardParcelAgroclimateSchema = z.object({
  request: z.object({
    parcelId: z.string().uuid(),
    coords: z.object({ lat: z.number(), lng: z.number() }),
    cropType: z.string(),
    cropName: z.string(),
    days: z.number().int(),
  }),
  summary: z.object({
    stationId: z.string(),
    lastUpdate: z.string(),
  }),
  dataRange: z.object({
    start: z.string().date(),
    end: z.string().date(),
  }),
  daily: z.object({
    data: z.array(dashboardParcelAgroclimateDailyItemSchema),
    recent: z.array(dashboardParcelAgroclimateDailyItemSchema),
  }),
  metrics: dashboardParcelAgroclimateMetricsSchema,
  risks: dashboardRisksSchema,
  units: z.object({
    daily: z.object({
      tempMin: z.string(),
      tempMax: z.string(),
      precipitation: z.string(),
      waterBalance: z.string(),
    }),
    metrics: z.object({
      water: z.object({
        deficit7d: z.string(),
        deficit15d: z.string(),
        deficit30d: z.string(),
        eto7d: z.string(),
        eto30d: z.string(),
      }),
      temperature: z.object({
        avg7d: z.string(),
        avg30d: z.string(),
        trend: z.string(),
        heatStressDays: z.string(),
        coldStressDays: z.string(),
      }),
      rain: z.object({
        rain7d: z.string(),
        rain30d: z.string(),
        trend: z.string(),
        dryDaysConsecutive: z.string(),
        dryDays7d: z.string(),
      }),
      crop: z.object({
        gdd: z.string(),
        gdd30d: z.string(),
        kc: z.string(),
      }),
      environment: z.object({
        humidityAvg7d: z.string(),
        humidityAvg30d: z.string(),
        variabilityIndex: z.string(),
      }),
    }),
    risks: z.object({ score: z.string() }),
  }),
  recommendations: z.array(dashboardRecommendationSchema),
})

export const dashboardParcelAgroclimateResponseSchema = z.object({
  agroclimate: dashboardParcelAgroclimateSchema,
})

export const dashboardParcelComparisonItemSchema = z.object({
  name: z.string(),
  area: z.number(),
  rain30d: z.number(),
  tempAvg: z.number(),
  waterDeficit30d: z.number(),
  dryDaysConsecutive: z.number(),
  heatStressDays: z.number(),
  waterStress: z.enum(["low", "medium", "high"]),
})

export const dashboardParcelsWeatherComparisonSchema = z.object({
  parcels: z.array(dashboardParcelComparisonItemSchema),
})

export const dashboardParcelsWeatherComparisonResponseSchema = z.object({
  comparison: dashboardParcelsWeatherComparisonSchema,
})

export type DashboardOlivar = z.infer<typeof dashboardOlivarSchema>
export type DashboardRisks = z.infer<typeof dashboardRisksSchema>
export type DashboardRecommendation = z.infer<typeof dashboardRecommendationSchema>
export type DashboardMapParcel = z.infer<typeof dashboardMapParcelSchema>
export type DashboardParcelsCropOverviews = z.infer<
  typeof dashboardParcelsCropOverviewsSchema
>
export type DashboardParcelCropOverviewItem = z.infer<
  typeof dashboardParcelCropOverviewItemSchema
>
export type DashboardParcelsRecommendations = z.infer<
  typeof dashboardParcelsRecommendationsSchema
>
export type DashboardParcelsRisks = z.infer<typeof dashboardParcelsRisksSchema>
export type DashboardParcelAgroclimate = z.infer<
  typeof dashboardParcelAgroclimateSchema
>
export type DashboardParcelComparisonItem = z.infer<
  typeof dashboardParcelComparisonItemSchema
>
export type DashboardParcelsWeatherComparison = z.infer<
  typeof dashboardParcelsWeatherComparisonSchema
>
