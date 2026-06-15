export type CalendarEventType =
  | "irrigation"
  | "treatment"
  | "fertilization"
  | "harvest"
  | "inspection"
  | "alert"

export type CalendarEventPriority = "low" | "medium" | "high"

export type CalendarEventStatus = "pending" | "in_progress" | "completed"

export interface CalendarEventMeta {
  dose?: string
  product?: string
  waterAmount?: number
  notes?: string
  priority?: CalendarEventPriority
}

export interface CalendarEvent {
  id: string
  title: string
  type: CalendarEventType
  parcelId: string
  parcelName: string
  color: string
  status: CalendarEventStatus
  start: Date
  end: Date
  meta?: CalendarEventMeta
}

export type CampaignTimelineTask = {
  id: string
  name: string
  dependsOn?: string
  status: "pending" | "in_progress" | "completed"
  startDay: number
  durationDays: number
  note?: string
}

export type CampaignTimelineData = {
  tasks: CampaignTimelineTask[]
  days: string[]
  todayIndex: number
  title: string
}
