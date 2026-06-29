import z from "zod"

export const apiMetaSchema = z.object({
  parcelId: z.string().uuid().optional(),
  scope: z.enum(["parcel", "organization"]),
  from: z.string().optional(),
  to: z.string().optional(),
  mode: z.enum(["preview", "full"]),
})

export const apiPaginationSchema = z.object({
  nextCursor: z.string().uuid().optional(),
  total: z.number().optional(),
})

export type ApiMeta = z.infer<typeof apiMetaSchema>
export type ApiPagination = z.infer<typeof apiPaginationSchema>
