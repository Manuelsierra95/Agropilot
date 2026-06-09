import { db, schema } from "@workspace/db"

import { generateParcels } from "../data/generators"

const MUNICIPALITIES = ["Úbeda", "Baeza", "Linares", "Andújar"] as const

export type ParcelSeedResult = {
  parcels: ReturnType<typeof generateParcels>
}

export async function seedParcels(
  weatherStationIds: string[]
): Promise<ParcelSeedResult> {
  const parcels = generateParcels()

  await db.insert(schema.parcels).values(parcels)
  console.log(`✓ parcels (${parcels.length})`)

  await db.insert(schema.parcelLocation).values(
    parcels.map((parcel, index) => ({
      id: crypto.randomUUID(),
      parcelId: parcel.id,
      refcat: `12345${String(index + 1).padStart(8, "0")}AB`,
      province: "Jaén",
      municipality: MUNICIPALITIES[index % MUNICIPALITIES.length]!,
      streetType: "Camino",
      streetName: `Vereda ${parcel.name}`,
      postalCode: "23400",
    }))
  )
  console.log("✓ parcel_location")

  const primaryStationId = weatherStationIds[0]
  if (primaryStationId) {
    await db.insert(schema.parcelStation).values(
      parcels.map((parcel, index) => ({
        parcelId: parcel.id,
        primaryStationId:
          weatherStationIds[index % weatherStationIds.length]!,
        fallbackStations: weatherStationIds
          .filter((id) => id !== weatherStationIds[index % weatherStationIds.length])
          .map((stationId, i) => ({
            stationId,
            distanceKm: 5 + i * 3,
          })),
      }))
    )
    console.log("✓ parcel_station")
  }

  return { parcels }
}
