import { campaigns } from "@workspace/db/schemas"
import { createSelectSchema } from "drizzle-zod"
import z from "zod"

export const campaignSelectSchema = createSelectSchema(campaigns)

export type CampaignSelect = ReturnType<typeof campaignSelectSchema.parse>

export const campaignListItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  status: z.enum(["active", "closed"]),
  balance: z.number().nullable(),
})

export type CampaignListItem = z.infer<typeof campaignListItemSchema>

export const campaignListQuerySchema = z.object({
  parcelId: z.string().uuid().optional(),
})

export type CampaignListQuery = z.infer<typeof campaignListQuerySchema>
