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

export type DashboardOlivar = z.infer<typeof dashboardOlivarSchema>
export type DashboardRisks = z.infer<typeof dashboardRisksSchema>
export type DashboardRecommendation = z.infer<typeof dashboardRecommendationSchema>
export type DashboardMapParcel = z.infer<typeof dashboardMapParcelSchema>
