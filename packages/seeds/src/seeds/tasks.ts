import { db, schema } from "@workspace/db"

import { generateTasks } from "../data/generators"

export async function seedTasks(
  parcelIds: string[],
  recommendations: { id: string; parcelId: string | null; type: string }[]
) {
  const tasks = generateTasks(parcelIds, recommendations)
  await db.insert(schema.tasks).values(tasks)
  console.log(`✓ tasks (${tasks.length})`)
}
