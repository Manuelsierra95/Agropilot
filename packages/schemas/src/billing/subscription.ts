import { createSelectSchema } from "drizzle-zod"
import { subscriptions } from "@workspace/db/schemas"

export const subscriptionSchema = createSelectSchema(subscriptions)

export type AuthSubscription = ReturnType<typeof subscriptionSchema.parse>
