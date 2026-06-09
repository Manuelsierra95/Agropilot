import { db, schema } from "@workspace/db"

import { generateParcelWeatherData } from "../data/generators"

export async function seedParcelWeather(parcelIds: string[]) {
  const rows = generateParcelWeatherData(parcelIds)
  await db.insert(schema.parcelWeather).values(rows)
  console.log(`✓ parcel_weather (${rows.length})`)
}
