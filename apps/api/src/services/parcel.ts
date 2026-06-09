import { db, schema, eq, and, asc, gte, lte } from "@workspace/db"
import { z } from "zod"
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

const parcelWeatherDataSchema = z.object({
  daily: z.array(
    z.object({
      date: z.string(),
      soilMoisture: z.number(),
      rainfall: z.number(),
      temperature: z.number(),
    })
  ),
})

export type ParcelCashflowQueryFilters = {
  parcelId?: string
  from: string
  to: string
}

export type ParcelCashflowRow = {
  date: string
  income: string | null
  expense: string | null
  parcelId: string
}

export type ParcelWeatherMetric = "soil_moisture" | "rainfall" | "temperature"

export type ParcelWeatherQueryFilters = {
  parcelId?: string
  metric: ParcelWeatherMetric
  from: string
  to: string
}

export type ParcelWeatherDailyRow = {
  date: string
  value: number
  parcelId: string
  parcelName: string
}

export async function resolveParcelIdForOrg(
  organizationId: string,
  parcelId?: string,
  defaultParcelId?: string
): Promise<string | null> {
  if (parcelId) {
    const parcel = await db.query.parcels.findFirst({
      where: and(
        eq(schema.parcels.organizationId, organizationId),
        eq(schema.parcels.id, parcelId)
      ),
      columns: { id: true },
    })

    return parcel?.id ?? null
  }

  if (defaultParcelId) {
    const parcel = await db.query.parcels.findFirst({
      where: and(
        eq(schema.parcels.organizationId, organizationId),
        eq(schema.parcels.id, defaultParcelId)
      ),
      columns: { id: true },
    })

    if (parcel) {
      return parcel.id
    }
  }

  const first = await db.query.parcels.findFirst({
    where: eq(schema.parcels.organizationId, organizationId),
    columns: { id: true },
    orderBy: [asc(schema.parcels.name)],
  })

  return first?.id ?? null
}

export async function queryParcelCashflow(
  organizationId: string,
  filters: ParcelCashflowQueryFilters,
  defaultParcelId?: string
): Promise<ParcelCashflowRow[]> {
  const parcelId = await resolveParcelIdForOrg(
    organizationId,
    filters.parcelId,
    defaultParcelId
  )

  if (!parcelId) {
    return []
  }

  return db.query.parcelCashflowDaily.findMany({
    where: and(
      eq(schema.parcelCashflowDaily.parcelId, parcelId),
      gte(schema.parcelCashflowDaily.date, filters.from),
      lte(schema.parcelCashflowDaily.date, filters.to)
    ),
    orderBy: [asc(schema.parcelCashflowDaily.date)],
    columns: {
      date: true,
      income: true,
      expense: true,
      parcelId: true,
    },
  })
}

function weatherMetricValue(
  entry: z.infer<typeof parcelWeatherDataSchema>["daily"][number],
  metric: ParcelWeatherMetric
): number {
  switch (metric) {
    case "soil_moisture":
      return entry.soilMoisture
    case "rainfall":
      return entry.rainfall
    case "temperature":
      return entry.temperature
  }
}

export async function queryParcelWeather(
  organizationId: string,
  filters: ParcelWeatherQueryFilters,
  defaultParcelId?: string
): Promise<ParcelWeatherDailyRow[]> {
  const parcelId = await resolveParcelIdForOrg(
    organizationId,
    filters.parcelId,
    defaultParcelId
  )

  if (!parcelId) {
    return []
  }

  const parcel = await db.query.parcels.findFirst({
    where: and(
      eq(schema.parcels.organizationId, organizationId),
      eq(schema.parcels.id, parcelId)
    ),
    columns: { id: true, name: true },
  })

  if (!parcel) {
    return []
  }

  const weather = await db.query.parcelWeather.findFirst({
    where: eq(schema.parcelWeather.parcelId, parcelId),
    columns: { status: true, data: true },
  })

  if (!weather || weather.status !== "ok") {
    return []
  }

  const parsed = parcelWeatherDataSchema.safeParse(weather.data)
  if (!parsed.success) {
    return []
  }

  return parsed.data.daily
    .filter((entry) => entry.date >= filters.from && entry.date <= filters.to)
    .map((entry) => ({
      date: entry.date,
      value: weatherMetricValue(entry, filters.metric),
      parcelId: parcel.id,
      parcelName: parcel.name,
    }))
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
