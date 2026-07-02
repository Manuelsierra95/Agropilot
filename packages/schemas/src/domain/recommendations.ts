import { recommendations } from "@workspace/db/schemas"
import z from "zod"

export const recommendationStatusSchema = z.enum([
  "pending",
  "accepted",
  "dismissed",
  "expired",
])

export const recommendationTypeSchema = z.enum([
  "irrigation",
  "treatment",
  "fertilization",
  "inspection",
  "harvest",
  "sale",
  "general",
])

export const recommendationSourceSchema = z.enum([
  "weather",
  "risk_engine",
  "market",
  "sensor",
  "copilot",
])

export const recommendationPrioritySchema = z.enum(["low", "medium", "high"])

export type RecommendationSelect = typeof recommendations.$inferSelect
export type RecommendationInsert = typeof recommendations.$inferInsert

export const recommendationListQuerySchema = z.object({
  parcelId: z.string().optional(),
  status: recommendationStatusSchema.optional().default("pending"),
})

export const recommendationAcceptInputSchema = z.object({
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  priority: z.number().int().min(0).max(3).optional(),
  description: z.string().optional(),
})

export type RecommendationStatus = z.infer<typeof recommendationStatusSchema>
export type RecommendationType = z.infer<typeof recommendationTypeSchema>
export type RecommendationSource = z.infer<typeof recommendationSourceSchema>
export type RecommendationPriority = z.infer<typeof recommendationPrioritySchema>
export type RecommendationListQuery = z.infer<
  typeof recommendationListQuerySchema
>
export type RecommendationAcceptInput = z.infer<
  typeof recommendationAcceptInputSchema
>

export type GeneratedRecommendationInput = {
  dedupeKey: string
  type: RecommendationType
  source: RecommendationSource
  title: string
  details: string
  priority: RecommendationPriority
  expiresAt: Date
  meta?: Record<string, unknown>
}
