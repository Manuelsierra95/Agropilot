import { db, schema, eq, and } from "@workspace/db"
import { HTTPException } from "hono/http-exception"
import type {
  ParcelCreateOutput,
  ParcelUpdateOutput,
  ParcelCreateInput,
  ParcelUpdateInput,
} from "@workspace/schemas"
import { getStations } from "@workspace/api/services/weather"
import { geoService } from "@workspace/api/services/shared/geometry-utils"

type ParcelLocationValues = {
  refcat: string | null
  province: string | null
  municipality: string | null
  streetType: string | null
  streetName: string | null
  streetNumber: string | null
  postalCode: string | null
}

function resolveParcelAreaM2(areaM2?: number | string | null): number | null {
  if (areaM2 == null) return null
  return Math.round(Number(areaM2))
}

function extractLocationFields(data: {
  refcat?: string | null
  province?: string | null
  municipality?: string | null
  streetType?: string | null
  streetName?: string | null
  streetNumber?: string | null
  postalCode?: string | null
}): { location: ParcelLocationValues; hasLocation: boolean } {
  const location: ParcelLocationValues = {
    refcat: data.refcat ?? null,
    province: data.province ?? null,
    municipality: data.municipality ?? null,
    streetType: data.streetType ?? null,
    streetName: data.streetName ?? null,
    streetNumber: data.streetNumber ?? null,
    postalCode: data.postalCode ?? null,
  }

  const hasLocation = Object.values(location).some((value) => value != null)

  return { location, hasLocation }
}

function splitLocationInput<
  T extends {
    refcat?: string | null
    province?: string | null
    municipality?: string | null
    streetType?: string | null
    streetName?: string | null
    streetNumber?: string | null
    postalCode?: string | null
  },
>(data: T) {
  const {
    refcat,
    province,
    municipality,
    streetType,
    streetName,
    streetNumber,
    postalCode,
    ...parcelData
  } = data

  return {
    parcelData,
    ...extractLocationFields({
      refcat,
      province,
      municipality,
      streetType,
      streetName,
      streetNumber,
      postalCode,
    }),
  }
}

async function upsertParcelLocation(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  parcelId: string,
  location: ParcelLocationValues
) {
  const existing = await tx.query.parcelLocation.findFirst({
    where: eq(schema.parcelLocation.parcelId, parcelId),
  })

  if (existing) {
    await tx
      .update(schema.parcelLocation)
      .set(location)
      .where(eq(schema.parcelLocation.parcelId, parcelId))
    return
  }

  await tx.insert(schema.parcelLocation).values({
    parcelId,
    ...location,
  })
}

export async function createParcel(
  organizationId: string,
  data: ParcelCreateInput
): Promise<ParcelCreateOutput> {
  const { parcelData, location, hasLocation } = splitLocationInput(data)
  const fallbackAreaM2 = resolveParcelAreaM2(parcelData.areaM2)

  const computedAreaM2 = parcelData.polygon
    ? geoService.areaM2(parcelData.polygon)
    : null

  return db.transaction(async (tx) => {
    const [created] = await tx
      .insert(schema.parcels)
      .values({
        ...parcelData,
        organizationId,
        areaM2: computedAreaM2 ?? fallbackAreaM2,
      })
      .returning({
        id: schema.parcels.id,
        name: schema.parcels.name,
        cropType: schema.parcels.cropType,
        irrigationType: schema.parcels.irrigationType,
        areaM2: schema.parcels.areaM2,
        centroid: schema.parcels.centroid,
        polygon: schema.parcels.polygon,
        createdAt: schema.parcels.createdAt,
        updatedAt: schema.parcels.updatedAt,

        lat: geoService.lat(schema.parcels.centroid),
        lng: geoService.lng(schema.parcels.centroid),
      })

    if (!created) {
      throw new HTTPException(500, { message: "Parcel creation failed" })
    }

    if (hasLocation) {
      await tx.insert(schema.parcelLocation).values({
        parcelId: created.id,
        ...location,
      })
    }

    // opcional side-effect
    if (created.lat && created.lng) {
      queueMicrotask(() => {
        getStations(created.id, created.lat, created.lng).catch(() => {})
      })
    }

    return created
  })
}

export async function updateParcel(
  organizationId: string,
  parcelId: string,
  data: ParcelUpdateInput
): Promise<ParcelUpdateOutput> {
  const { parcelData, location } = splitLocationInput(data)
  const { areaM2, ...restParcelData } = parcelData

  const fallbackAreaM2 =
    areaM2 !== undefined ? resolveParcelAreaM2(areaM2) : null

  const computedAreaM2 = restParcelData.polygon
    ? geoService.areaM2(restParcelData.polygon)
    : null

  const shouldReassignStations =
    restParcelData.centroid !== undefined ||
    restParcelData.polygon !== undefined

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(schema.parcels)
      .set({
        ...restParcelData,
        areaM2: computedAreaM2 ?? fallbackAreaM2,
      })
      .where(
        and(
          eq(schema.parcels.organizationId, organizationId),
          eq(schema.parcels.id, parcelId)
        )
      )
      .returning({
        id: schema.parcels.id,
        name: schema.parcels.name,
        cropType: schema.parcels.cropType,
        irrigationType: schema.parcels.irrigationType,
        areaM2: schema.parcels.areaM2,
        centroid: schema.parcels.centroid,
        polygon: schema.parcels.polygon,
        createdAt: schema.parcels.createdAt,
        updatedAt: schema.parcels.updatedAt,

        lat: geoService.lat(schema.parcels.centroid),
        lng: geoService.lng(schema.parcels.centroid),
      })

    if (!updated) {
      throw new HTTPException(404, { message: "Parcel not found" })
    }

    await upsertParcelLocation(tx, updated.id, location)

    if (shouldReassignStations && updated.lat && updated.lng) {
      queueMicrotask(() => {
        getStations(updated.id, updated.lat!, updated.lng!).catch(() => {})
      })
    }

    return updated
  })
}

export async function deleteParcel(
  organizationId: string,
  parcelId: string
): Promise<void> {
  const [deleted] = await db
    .delete(schema.parcels)
    .where(
      and(
        eq(schema.parcels.organizationId, organizationId),
        eq(schema.parcels.id, parcelId)
      )
    )
    .returning({ id: schema.parcels.id })

  if (!deleted) {
    throw new HTTPException(404, { message: "Parcel not found" })
  }
}
