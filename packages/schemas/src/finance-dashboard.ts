import z from "zod"
import { oilGradeSchema } from "./market"
import { paymentMethodSchema, transactionCategorySchema } from "./finance"

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

export const dashboardTransactionSnapshotSchema = z.object({
  type: z.enum(["ingreso", "gasto"]),
  category: z.string(),
  amount: z.number(),
  paymentMethod: paymentMethodSchema,
  invoiceNumber: z.string().optional(),
  date: z.string().date(),
})

export const dashboardFinanceResumeSchema = z.object({
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

export const dashboardProductionValueSchema = z.object({
  monthlyProductionKg: z.array(z.number()).length(12),
  prevMonthlyProductionKg: z.array(z.number()).length(12),
  lonjaPrice: z.number(),
  numOlivos: z.number(),
  campaignStartYear: z.number().int(),
})

export const dashboardOlivePricesResponseSchema = z.object({
  olivePrices: z.array(dashboardOlivePriceItemSchema),
})

export const dashboardSellingWindowResponseSchema = z.object({
  sellingWindow: dashboardSellingWindowSchema,
})

export const dashboardFinanceResumeResponseSchema = z.object({
  finance: dashboardFinanceResumeSchema,
})

export const dashboardCampaignMarginResponseSchema = z.object({
  campaignMargin: dashboardCampaignMarginSchema,
})

export const dashboardRecentTransactionsResponseSchema = z.object({
  transactions: z.array(dashboardTransactionSnapshotSchema),
})

export const dashboardProductionValueResponseSchema = z.object({
  productionValue: dashboardProductionValueSchema,
})

export type DashboardOlivePriceItem = z.infer<typeof dashboardOlivePriceItemSchema>
export type DashboardSellingWindow = z.infer<typeof dashboardSellingWindowSchema>
export type DashboardFinanceResume = z.infer<typeof dashboardFinanceResumeSchema>
export type DashboardCampaignMargin = z.infer<typeof dashboardCampaignMarginSchema>
export type DashboardProductionValue = z.infer<
  typeof dashboardProductionValueSchema
>
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
