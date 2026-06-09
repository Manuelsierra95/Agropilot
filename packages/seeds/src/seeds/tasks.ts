import { db, schema } from "@workspace/db"

import { generateTasks } from "../data/generators"

export async function seedTasks(parcelIds: string[]) {
  const tasks = generateTasks(parcelIds)
  await db.insert(schema.tasks).values(tasks)
  console.log(`✓ tasks (${tasks.length})`)
}
