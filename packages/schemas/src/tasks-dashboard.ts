import z from "zod"
import { dashboardScopeQuerySchema } from "./dashboard-scope"
import { taskCategorySchema } from "./tasks"

export const dashboardCalendarEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: taskCategorySchema,
  parcelId: z.string(),
  parcelName: z.string(),
  color: z.string(),
  status: z.enum(["pending", "in_progress", "completed"]),
  start: z.string().datetime(),
  end: z.string().datetime(),
  meta: z
    .object({
      dose: z.string().optional(),
      product: z.string().optional(),
      waterAmount: z.number().optional(),
      notes: z.string().optional(),
      priority: z.enum(["low", "medium", "high"]).optional(),
    })
    .optional(),
})

export const dashboardUpcomingWeekResponseSchema = z.object({
  events: z.array(dashboardCalendarEventSchema),
})

export const dashboardCalendarEventsQuerySchema = dashboardScopeQuerySchema

export const dashboardCalendarEventsResponseSchema = z.object({
  events: z.array(dashboardCalendarEventSchema),
})

export type DashboardCalendarEvent = z.infer<typeof dashboardCalendarEventSchema>
export type DashboardCalendarEventsQuery = z.infer<
  typeof dashboardCalendarEventsQuerySchema
>
