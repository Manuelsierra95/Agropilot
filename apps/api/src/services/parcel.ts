import { db, schema, eq, and } from "@workspace/db"
import { HTTPException } from "hono/http-exception"
import type {
  ParcelCreateInput,
  ParcelSelect,
  ParcelUpdateInput,
} from "@workspace/schemas"

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
  const [created] = await db
    .insert(schema.parcels)
    .values({
      organizationId,
      ...data,
    })
    .returning()

  if (!created) {
    throw new HTTPException(500, { message: "Parcel creation failed" })
  }

  return created
}

export async function updateParcel(
  organizationId: string,
  parcelId: string,
  data: ParcelUpdateInput
): Promise<ParcelSelect> {
  const [updated] = await db
    .update(schema.parcels)
    .set(data)
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

  return updated
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
