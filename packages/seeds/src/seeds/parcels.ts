import { getStations } from "@workspace/api/services/weather/commands/get-stations"
import { db, schema } from "@workspace/db"

import {
  generateParcelCropSeasons,
  generateParcelCrops,
  PARCEL_COORDS,
} from "../data/generators"
import { resolveParcelGeometry } from "../data/fetch-real-parcels"
import { SEED_ORGANIZATION_ID } from "../config"

export type ParcelSeedResult = {
  parcels: {
    id: string
    lat: number
    lng: number
  }[]
}

export async function seedParcels(
  campaigns: { id: string; startDate: string }[]
): Promise<ParcelSeedResult> {
  const resolved = await Promise.all(
    PARCEL_COORDS.map((coord, index) => resolveParcelGeometry(coord, index))
  )

  const parcels = resolved.map((geometry, index) => ({
    id: crypto.randomUUID(),
    organizationId: SEED_ORGANIZATION_ID,
    name: geometry.name,
    cropType: "olive" as const,
    irrigationType: (index % 2 === 0 ? "dryland" : "irrigated") as
      | "dryland"
      | "irrigated",
    areaM2: geometry.areaM2,
    centroid: geometry.centroid,
    polygon: geometry.polygon,
    lat: geometry.lat,
    lng: geometry.lng,
    location: geometry,
  }))

  await db.insert(schema.parcels).values(
    parcels.map(({ lat: _lat, lng: _lng, location: _location, ...parcel }) => parcel)
  )
  console.log(`✓ parcels (${parcels.length})`)

  await db.insert(schema.parcelLocation).values(
    parcels.map((parcel) => ({
      id: crypto.randomUUID(),
      parcelId: parcel.id,
      refcat: parcel.location.refcat,
      province: parcel.location.province,
      municipality: parcel.location.municipality,
      streetType: parcel.location.streetType,
      streetName: parcel.location.streetName,
      postalCode: parcel.location.postalCode,
    }))
  )
  console.log("✓ parcel_location")

  const crops = generateParcelCrops(parcels.map((p) => p.id))
  await db.insert(schema.parcelCrops).values(crops)
  console.log("✓ parcel_crops")

  const seasons = generateParcelCropSeasons(
    parcels.map((p) => p.id),
    campaigns
  )
  await db.insert(schema.parcelCropSeasons).values(seasons)
  console.log(`✓ parcel_crop_seasons (${seasons.length})`)

  for (const parcel of parcels) {
    await getStations(parcel.id, parcel.lat, parcel.lng).catch(() => {})
  }
  console.log("✓ parcel_station (via getStations)")

  return {
    parcels: parcels.map((p) => ({ id: p.id, lat: p.lat, lng: p.lng })),
  }
}
