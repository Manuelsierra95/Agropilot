import { eq, db, schema } from "@workspace/db"

import { generateRecommendationRows } from "../data/generators"
import { SEED_ORGANIZATION_ID } from "../config"

export async function seedRecommendations(parcelIds: string[]) {
  if (parcelIds.length === 0) return []

  const rows = generateRecommendationRows(parcelIds)

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

  const stored = await db.query.recommendations.findMany({
    where: eq(schema.recommendations.organizationId, SEED_ORGANIZATION_ID),
  })

  return stored.map((row) => ({
    id: row.id,
    parcelId: row.parcelId,
    type: row.type,
  }))
}
