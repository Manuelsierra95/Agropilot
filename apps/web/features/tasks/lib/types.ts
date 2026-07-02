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
