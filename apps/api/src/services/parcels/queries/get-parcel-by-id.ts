import { db, schema, eq, and } from "@workspace/db"
import { HTTPException } from "hono/http-exception"
import type { ParcelSelect } from "@workspace/schemas"

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
