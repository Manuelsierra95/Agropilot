import z from "zod"

export const apiQuerySchema = z
  .object({
    mode: z.enum(["preview", "full"]).default("preview"),
    include: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(500).optional(),
    cursor: z.string().uuid().optional(),
    parcelId: z.string().uuid().optional(),
    campaignId: z.string().uuid().optional(),
    from: z.string().date().optional(),
    to: z.string().date().optional(),
  })
  .refine((data) => !(data.from && !data.to) && !(data.to && !data.from), {
    message: "from and to must be provided together",
  })

export type ApiQuery = z.infer<typeof apiQuerySchema>
