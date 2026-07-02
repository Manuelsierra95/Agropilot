import { db, schema } from "@workspace/db"

import { SEED_ORGANIZATION_ID } from "../config"

const RECOMMENDATION_TEMPLATES = [
  {
    dedupeKey: "seed:irrigation:parcel-1",
    type: "irrigation" as const,
    source: "weather" as const,
    title: "Revisar riego en parcelas de secano",
    details: "El balance hídrico indica déficit moderado en los próximos días.",
    priority: "high" as const,
  },
  {
    dedupeKey: "seed:treatment:parcel-1",
    type: "treatment" as const,
    source: "risk_engine" as const,
    title: "Aplicar tratamiento preventivo contra hongos",
    details: "Humedad y temperatura favorables al desarrollo fúngico.",
    priority: "medium" as const,
  },
  {
    dedupeKey: "seed:sale:org",
    type: "sale" as const,
    source: "market" as const,
    title: "Ventana de venta favorable",
    details: "El precio del aceite muestra tendencia alcista esta semana.",
    priority: "low" as const,
  },
]

function expiresInDays(days: number): Date {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + days)
  return date
}

export async function seedRecommendations(parcelIds: string[]) {
  if (parcelIds.length === 0) return

  const rows = RECOMMENDATION_TEMPLATES.flatMap((template, index) => {
    const parcelId =
      template.type === "sale" ? null : (parcelIds[index % parcelIds.length] ?? null)

    const dedupeKey =
      template.type === "sale"
        ? `${template.dedupeKey}:${SEED_ORGANIZATION_ID}`
        : `${template.dedupeKey}:${parcelId}`

    return {
      organizationId: SEED_ORGANIZATION_ID,
      parcelId,
      dedupeKey,
      type: template.type,
      source: template.source,
      title: template.title,
      details: template.details,
      priority: template.priority,
      status: "pending" as const,
      expiresAt: expiresInDays(7),
    }
  })

  await db
    .insert(schema.recommendations)
    .values(rows)
    .onConflictDoNothing({
      target: [
        schema.recommendations.organizationId,
        schema.recommendations.dedupeKey,
      ],
    })
  console.log(`✓ recommendations (${rows.length})`)
}
