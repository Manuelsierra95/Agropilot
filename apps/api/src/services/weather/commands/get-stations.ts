import { db, schema, eq } from "@workspace/db"
import {
  getBestStations,
  type StationCandidate,
} from "@workspace/scrapers"
import {
  geoService,
  normalizeLatLng,
} from "@workspace/api/services/shared/geometry-utils"

type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

function pointWkt(lng: number, lat: number): string {
  return `POINT(${lng} ${lat})`
}

async function ensureWeatherStation(
  tx: DbTransaction,
  device: StationCandidate
): Promise<string> {
  const existing = await tx.query.weatherStation.findFirst({
    where: eq(schema.weatherStation.stationId, device.code),
    columns: { id: true },
  })
  if (existing) return existing.id

  const [created] = await tx
    .insert(schema.weatherStation)
    .values({
      id: crypto.randomUUID(),
      stationId: device.code,
      name: device.name,
      location: pointWkt(device.longitude, device.latitude),
      altitude: device.elevation,
    })
    .returning({ id: schema.weatherStation.id })
  return created!.id
}

async function upsertParcelStation(
  tx: DbTransaction,
  parcelId: string,
  primaryStationId: string,
  fallbacks: { stationId: string; distanceKm: number }[]
) {
  const existing = await tx.query.parcelStation.findFirst({
    where: eq(schema.parcelStation.parcelId, parcelId),
    columns: { parcelId: true },
  })

  const data = {
    primaryStationId,
    fallbackStations: fallbacks,
    computedAt: new Date(),
  }

  if (existing) {
    await tx
      .update(schema.parcelStation)
      .set(data)
      .where(eq(schema.parcelStation.parcelId, parcelId))
  } else {
    await tx.insert(schema.parcelStation).values({ parcelId, ...data })
  }
}

export async function getStations(
  parcelId: string,
  lat?: number,
  lng?: number
): Promise<void> {
  if (lat == null || lng == null) {
    const [parcel] = await db
      .select({
        lat: geoService.lat(schema.parcels.centroid),
        lng: geoService.lng(schema.parcels.centroid),
      })
      .from(schema.parcels)
      .where(eq(schema.parcels.id, parcelId))
      .limit(1)

    if (!parcel) return

    const coords = normalizeLatLng(
      (parcel as { lat: number }).lat,
      (parcel as { lng: number }).lng
    )
    lat = coords.lat
    lng = coords.lng
  }

  if (lat == null || lng == null) return

  const selection = await getBestStations(lat, lng)

  await db.transaction(async (tx) => {
    const mainStationId = await ensureWeatherStation(tx, selection.main)
    const fallbackIds = await Promise.all(
      selection.fallbacks.map((fb) => ensureWeatherStation(tx, fb))
    )
    await upsertParcelStation(
      tx,
      parcelId,
      mainStationId,
      selection.fallbacks.map((fb, i) => ({
        stationId: fallbackIds[i]!,
        distanceKm: fb.distance,
      }))
    )
  })
}
