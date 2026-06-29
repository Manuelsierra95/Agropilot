import { marketPrices } from "@workspace/db/schemas"
import { createSelectSchema } from "drizzle-zod"
import z from "zod"

export const marketProductSchema = z.enum(["olive_oil"])

export const oilGradeSchema = z.enum(["virgen_extra", "virgen", "lampante"])

export const marketPriceSelectSchema = createSelectSchema(marketPrices)

export type MarketProduct = z.infer<typeof marketProductSchema>
export type OilGrade = z.infer<typeof oilGradeSchema>
export type MarketPriceSelect = ReturnType<typeof marketPriceSelectSchema.parse>

export const OIL_GRADE_LABELS: Record<OilGrade, string> = {
  virgen_extra: "Aceite Virgen Extra",
  virgen: "Aceite Virgen",
  lampante: "Aceite Lampante",
}

export function gradeLabel(grade: OilGrade): string {
  return OIL_GRADE_LABELS[grade]
}
