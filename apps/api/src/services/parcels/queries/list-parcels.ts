import { db, schema, eq, and, asc } from "@workspace/db"
import type { ParcelSelect } from "@workspace/schemas"
import { HTTPException } from "hono/http-exception"

export async function listParcels(organizationId: string): Promise<ParcelSelect[]> {
  return db.query.parcels.findMany({
    where: eq(schema.parcels.organizationId, organizationId),
    with: {
      crop: true,
    },
  }) as Promise<ParcelSelect[]>
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
    with: {
      crop: true,
    },
  })

  if (!parcel) {
    throw new HTTPException(404, { message: "Parcel not found" })
  }

  return parcel as ParcelSelect
}

export async function getParcelNameForOrg(
  organizationId: string,
  parcelId: string
): Promise<string | null> {
  const parcel = await db.query.parcels.findFirst({
    where: and(
      eq(schema.parcels.organizationId, organizationId),
      eq(schema.parcels.id, parcelId)
    ),
    columns: { name: true },
  })

  return parcel?.name ?? null
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
