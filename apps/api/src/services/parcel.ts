import { db, schema, eq, and } from "@workspace/db"
import { HTTPException } from "hono/http-exception"
import {
  type ParcelCreateInput,
  type ParcelSelect,
  type ParcelUpdateInput,
} from "@workspace/schemas"

const HECTARES_TO_SQUARE_METERS = 10_000

function hectaresToSquareMeters(areaHa: number): number {
  return Math.round(areaHa * HECTARES_TO_SQUARE_METERS)
}

type ParcelLocationValues = {
  refcat: string | null
  province: string | null
  municipality: string | null
  streetType: string | null
  streetName: string | null
  streetNumber: string | null
  postalCode: string | null
}

function resolveParcelAreaFields(data: {
  areaHa?: number | string | null
  areaM2?: number | string | null
}): { areaHa: string | null; areaM2: number | null } {
  if (data.areaHa == null) {
    return { areaHa: null, areaM2: null }
  }

  const areaHa = String(data.areaHa)
  const areaM2 =
    data.areaM2 != null
      ? Math.round(Number(data.areaM2))
      : hectaresToSquareMeters(Number(data.areaHa))

  return { areaHa, areaM2 }
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

function splitCreateInput(data: ParcelCreateInput) {
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

function splitUpdateInput(data: ParcelUpdateInput) {
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

export async function listParcels(
  organizationId: string
): Promise<ParcelSelect[]> {
  return db.query.parcels.findMany({
    where: eq(schema.parcels.organizationId, organizationId),
  })
}

export async function getParcelById(
  organizationId: string,
  parcelId: string
): Promise<ParcelSelect> {
  const parcel = await db.query.parcels.findFirst({
    where: and(
      eq(schema.parcels.organizationId, organizationId),
      eq(schema.parcels.id, parcelId)
    ),
  })

  if (!parcel) {
    throw new HTTPException(404, { message: "Parcel not found" })
  }

  return parcel
}

export async function createParcel(
  organizationId: string,
  data: ParcelCreateInput
): Promise<ParcelSelect> {
  const { parcelData, location, hasLocation } = splitCreateInput(data)
  const area = resolveParcelAreaFields(parcelData)

  return db.transaction(async (tx) => {
    const [created] = await tx
      .insert(schema.parcels)
      .values({
        organizationId,
        ...parcelData,
        ...area,
      })
      .returning()

    if (!created) {
      throw new HTTPException(500, { message: "Parcel creation failed" })
    }

    if (hasLocation) {
      await tx.insert(schema.parcelLocation).values({
        parcelId: created.id,
        ...location,
      })
    }

    return created
  })
}

export async function updateParcel(
  organizationId: string,
  parcelId: string,
  data: ParcelUpdateInput
): Promise<ParcelSelect> {
  const { parcelData, location, hasLocation } = splitUpdateInput(data)
  const { areaHa, areaM2, ...restParcelData } = parcelData
  const area =
    areaHa !== undefined
      ? resolveParcelAreaFields({ areaHa, areaM2 })
      : undefined

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(schema.parcels)
      .set({
        ...restParcelData,
        ...(area ?? {}),
      })
      .where(
        and(
          eq(schema.parcels.organizationId, organizationId),
          eq(schema.parcels.id, parcelId)
        )
      )
      .returning()

    if (!updated) {
      throw new HTTPException(404, { message: "Parcel not found" })
    }

    if (hasLocation) {
      await upsertParcelLocation(tx, parcelId, location)
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
