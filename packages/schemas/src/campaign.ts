import { campaigns } from "@workspace/db/schemas"
import { createSelectSchema } from "drizzle-zod"

export const campaignSelectSchema = createSelectSchema(campaigns)

export type CampaignSelect = ReturnType<typeof campaignSelectSchema.parse>
