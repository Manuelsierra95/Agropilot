import z from "zod"

export const harvestDeliveryStatusSchema = z.enum(["stored", "partial", "sold"])

export const harvestDeliverySelectSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  parcelId: z.string(),
  campaignId: z.string(),
  deliveryDate: z.string(),
  destinationName: z.string().nullable(),
  rawQuantity: z.string(),
  rawUnit: z.string(),
  conversionRate: z.string().nullable(),
  processedQuantity: z.string(),
  processedUnit: z.string(),
  grade: z.string().nullable(),
  quantityRemaining: z.string(),
  status: harvestDeliveryStatusSchema,
  targetSalePricePerUnit: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const harvestSaleSelectSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  deliveryId: z.string(),
  parcelId: z.string(),
  campaignId: z.string(),
  transactionId: z.string().nullable(),
  saleDate: z.string(),
  quantitySold: z.string(),
  pricePerUnit: z.string(),
  totalAmount: z.string(),
  buyerName: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.date(),
})

export const harvestDeliveryListItemSchema = z.object({
  id: z.string(),
  parcelId: z.string(),
  parcelName: z.string(),
  campaignId: z.string(),
  deliveryDate: z.string().date(),
  destinationName: z.string().nullable(),
  rawQuantity: z.number(),
  rawUnit: z.string(),
  conversionRate: z.number().nullable(),
  processedQuantity: z.number(),
  processedUnit: z.string(),
  grade: z.string().nullable(),
  quantityRemaining: z.number(),
  status: harvestDeliveryStatusSchema,
  targetSalePricePerUnit: z.number().nullable(),
  notes: z.string().nullable(),
})

export const harvestDeliveriesQuerySchema = z.object({
  parcelId: z.string(),
  status: z.string().optional(),
})

export const harvestDeliveryCreateSchema = z.object({
  parcelId: z.string(),
  deliveryDate: z.string().date(),
  destinationName: z.string().nullish(),
  rawQuantity: z.coerce.number().positive(),
  rawUnit: z.string().min(1).default("kg"),
  conversionRate: z.number().min(0).max(100).nullable().optional(),
  processedUnit: z.string().min(1).default("l"),
  grade: z.string().nullish(),
  targetSalePricePerUnit: z.number().positive().nullable().optional(),
  notes: z.string().nullish(),
  campaignId: z.string().optional(),
})

export const harvestSaleItemCreateSchema = z.object({
  deliveryId: z.string(),
  quantitySold: z.coerce.number().positive(),
})

export const harvestSaleCreateSchema = z.object({
  parcelId: z.string(),
  saleDate: z.string().date(),
  pricePerUnit: z.coerce.number().positive(),
  deliveries: z.array(harvestSaleItemCreateSchema).min(1),
  buyerName: z.string().nullish(),
  notes: z.string().nullish(),
  campaignId: z.string().optional(),
})

export type HarvestDeliveryStatus = z.infer<typeof harvestDeliveryStatusSchema>
export type HarvestDeliverySelect = z.infer<typeof harvestDeliverySelectSchema>
export type HarvestSaleSelect = z.infer<typeof harvestSaleSelectSchema>
export type HarvestDeliveryListItem = z.infer<
  typeof harvestDeliveryListItemSchema
>
export type HarvestDeliveriesQuery = z.infer<
  typeof harvestDeliveriesQuerySchema
>
export type HarvestDeliveryCreateInput = z.infer<
  typeof harvestDeliveryCreateSchema
>
export type HarvestSaleItemCreateInput = z.infer<
  typeof harvestSaleItemCreateSchema
>
export type HarvestSaleCreateInput = z.infer<typeof harvestSaleCreateSchema>
