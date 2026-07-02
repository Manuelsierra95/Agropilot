export type CalendarTaskCategory = string

export type CalendarTaskPriority = "low" | "medium" | "high"

export type CalendarTaskStatus = "pending" | "in_progress" | "completed"

export interface CalendarTaskMeta {
  dose?: string
  product?: string
  waterAmount?: number
  notes?: string
  priority?: CalendarTaskPriority
}

export interface CalendarTask {
  id: string
  title: string
  category: CalendarTaskCategory
  parcelId: string
  parcelName: string
  color: string
  status: CalendarTaskStatus
  start: Date
  end: Date
  meta?: CalendarTaskMeta
}
