import z from "zod"
import { oilGradeSchema } from "./market"
import { paymentMethodSchema, transactionCategorySchema } from "./finance"
import { taskCategorySchema } from "./tasks"

export const dashboardPricePointSchema = z.object({
  date: z.string().date(),
  price: z.number(),
})

export const dashboardOlivePriceItemSchema = z.object({
  name: z.string(),
  price: z.number(),
  priceMin: z.number(),
  priceMax: z.number(),
  unit: z.string(),
  updatedAt: z.string().date(),
  history: z.array(dashboardPricePointSchema),
})

export const dashboardSellingWindowSchema = z.object({
  lonjaPrice: z.number(),
  costPerKg: z.number(),
  lastSalePrice: z.number().optional(),
  estimatedKg: z.number(),
  campaignTarget: z.number().optional(),
})

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

export const dashboardTransactionSnapshotSchema = z.object({
  type: z.enum(["ingreso", "gasto"]),
  category: z.string(),
  amount: z.number(),
  paymentMethod: paymentMethodSchema,
  invoiceNumber: z.string().optional(),
  date: z.string().date(),
})

export const dashboardFinanceSchema = z.object({
  transactions: z.array(dashboardTransactionSnapshotSchema),
  previousCampaign: z
    .object({
      totalIncome: z.number(),
      totalExpenses: z.number(),
    })
    .optional(),
})

export const dashboardCampaignMarginPointSchema = z.object({
  date: z.string().date(),
  cost: z.number(),
  value: z.number(),
})

export const dashboardCampaignMarginSchema = z.object({
  campaignStart: z.string().date(),
  points: z.array(dashboardCampaignMarginPointSchema),
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

export const dashboardCalendarEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: taskCategorySchema,
  parcelId: z.string(),
  parcelName: z.string(),
  color: z.string(),
  status: z.enum(["pending", "in_progress", "completed"]),
  start: z.string().datetime(),
  end: z.string().datetime(),
  meta: z
    .object({
      dose: z.string().optional(),
      product: z.string().optional(),
      waterAmount: z.number().optional(),
      notes: z.string().optional(),
      priority: z.enum(["low", "medium", "high"]).optional(),
    })
    .optional(),
})

export const dashboardProductionValueSchema = z.object({
  monthlyProductionKg: z.array(z.number()).length(12),
  prevMonthlyProductionKg: z.array(z.number()).length(12),
  lonjaPrice: z.number(),
  numOlivos: z.number(),
  campaignStartYear: z.number().int(),
})

export const dashboardOverviewQuerySchema = z.object({
  parcelId: z.string().uuid().optional(),
  campaignId: z.string().uuid().optional(),
  from: z.string().date().optional(),
  to: z.string().date().optional(),
})

export type DashboardOverviewQuery = z.infer<typeof dashboardOverviewQuerySchema>

export const dashboardOverviewSchema = z.object({
  olivePrices: z.array(dashboardOlivePriceItemSchema),
  sellingWindow: dashboardSellingWindowSchema,
  olivar: dashboardOlivarSchema,
  finance: dashboardFinanceSchema,
  campaignMargin: dashboardCampaignMarginSchema,
  recommendations: z.object({
    recommendations: z.array(dashboardRecommendationSchema),
  }),
  risks: dashboardRisksSchema,
  mapParcels: z.array(dashboardMapParcelSchema),
  recentEvents: z.array(dashboardCalendarEventSchema),
  productionValue: dashboardProductionValueSchema,
})

export type DashboardOverview = z.infer<typeof dashboardOverviewSchema>
export type DashboardOlivePriceItem = z.infer<typeof dashboardOlivePriceItemSchema>
export type DashboardMapParcel = z.infer<typeof dashboardMapParcelSchema>
export type DashboardCampaignMargin = z.infer<typeof dashboardCampaignMarginSchema>
export type DashboardCalendarEvent = z.infer<typeof dashboardCalendarEventSchema>
export type DashboardRecommendation = z.infer<typeof dashboardRecommendationSchema>
export type DashboardRisks = z.infer<typeof dashboardRisksSchema>
export type DashboardTransactionSnapshot = z.infer<
  typeof dashboardTransactionSnapshotSchema
>

/** @internal Used when aggregating market prices by grade */
export const DASHBOARD_OIL_GRADES = oilGradeSchema.options

export const TRANSACTION_CATEGORY_LABELS: Record<
  z.infer<typeof transactionCategorySchema>,
  string
> = {
  irrigation: "Riego",
  fertilization: "Fertilización",
  treatment: "Tratamiento",
  labor: "Mano de obra",
  machinery: "Maquinaria",
  fuel: "Combustible",
  harvest: "Cosecha",
  sale: "Venta de cosecha",
  subsidy: "Subvenciones",
  other: "Otros",
}
