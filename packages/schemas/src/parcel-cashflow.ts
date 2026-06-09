import { parcelCashflowDaily } from "@workspace/db/schemas"
import { createSelectSchema } from "drizzle-zod"

export const parcelCashflowDailySelectSchema =
  createSelectSchema(parcelCashflowDaily)

export type ParcelCashflowDailySelect = ReturnType<
  typeof parcelCashflowDailySelectSchema.parse
>
