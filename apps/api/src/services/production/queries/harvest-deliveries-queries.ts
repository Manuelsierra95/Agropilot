import { db, schema, eq, and, inArray, asc } from "@workspace/db"
import { HTTPException } from "hono/http-exception"
import type {
  HarvestDeliveriesQuery,
  HarvestDeliveryListItem,
  HarvestDeliveryStatus,
} from "@workspace/schemas"

export async function listHarvestDeliveries(
  organizationId: string,
  query: HarvestDeliveriesQuery
): Promise<HarvestDeliveryListItem[]> {
  const conditions = [
    eq(schema.harvestDeliveries.organizationId, organizationId),
    eq(schema.harvestDeliveries.parcelId, query.parcelId),
  ]

  const statuses = query.status?.split(",").filter(Boolean) as
    | HarvestDeliveryStatus[]
    | undefined
  if (statuses && statuses.length > 0) {
    conditions.push(inArray(schema.harvestDeliveries.status, statuses))
  }

  const rows = await db
    .select({
      id: schema.harvestDeliveries.id,
      parcelId: schema.harvestDeliveries.parcelId,
      parcelName: schema.parcels.name,
      campaignId: schema.harvestDeliveries.campaignId,
      deliveryDate: schema.harvestDeliveries.deliveryDate,
      destinationName: schema.harvestDeliveries.destinationName,
      rawQuantity: schema.harvestDeliveries.rawQuantity,
      rawUnit: schema.harvestDeliveries.rawUnit,
      conversionRate: schema.harvestDeliveries.conversionRate,
      processedQuantity: schema.harvestDeliveries.processedQuantity,
      processedUnit: schema.harvestDeliveries.processedUnit,
      grade: schema.harvestDeliveries.grade,
      quantityRemaining: schema.harvestDeliveries.quantityRemaining,
      status: schema.harvestDeliveries.status,
      targetSalePricePerUnit: schema.harvestDeliveries.targetSalePricePerUnit,
      notes: schema.harvestDeliveries.notes,
    })
    .from(schema.harvestDeliveries)
    .innerJoin(
      schema.parcels,
      eq(schema.harvestDeliveries.parcelId, schema.parcels.id)
    )
    .where(and(...conditions))
    .orderBy(asc(schema.harvestDeliveries.deliveryDate))

  return rows.map((row) => ({
    ...row,
    rawQuantity: Number(row.rawQuantity),
    conversionRate: row.conversionRate ? Number(row.conversionRate) : null,
    processedQuantity: Number(row.processedQuantity),
    quantityRemaining: Number(row.quantityRemaining),
    targetSalePricePerUnit: row.targetSalePricePerUnit
      ? Number(row.targetSalePricePerUnit)
      : null,
  }))
}

export async function getHarvestDeliveryById(
  organizationId: string,
  deliveryId: string
) {
  const delivery = await db.query.harvestDeliveries.findFirst({
    where: and(
      eq(schema.harvestDeliveries.organizationId, organizationId),
      eq(schema.harvestDeliveries.id, deliveryId)
    ),
  })

  if (!delivery) {
    throw new HTTPException(404, { message: "Delivery not found" })
  }

  return delivery
}
