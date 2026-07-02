import { differenceInCalendarDays, format, parseISO } from "date-fns"
import { es } from "date-fns/locale"

import type { CalendarTask } from "@workspace/web/lib/calendar/types"

import type {
  CampaignTimelineData,
  CampaignTimelineTask,
} from "@workspace/web/features/tasks/lib/types"

function mapTaskStatus(
  status: CalendarTask["status"]
): CampaignTimelineTask["status"] {
  return status
}

export function eventsToCampaignTimeline(
  tasks: CalendarTask[],
  campaignStart: string,
  campaignEnd: string,
  title: string
): CampaignTimelineData {
  const start = parseISO(campaignStart)
  const end = parseISO(campaignEnd)
  const totalDays = Math.max(1, differenceInCalendarDays(end, start) + 1)
  const today = new Date()
  const todayIndex = Math.min(
    Math.max(0, differenceInCalendarDays(today, start)),
    totalDays - 1
  )

  const days = Array.from({ length: totalDays }, (_, index) => {
    const day = new Date(start)
    day.setUTCDate(start.getUTCDate() + index)
    return format(day, "EEE d", { locale: es })
  })

  const timelineTasks: CampaignTimelineTask[] = tasks.map((task) => {
    const startDay = Math.max(0, differenceInCalendarDays(task.start, start))
    const endDay = Math.max(startDay, differenceInCalendarDays(task.end, start))
    const durationDays = Math.max(1, endDay - startDay + 1)

    return {
      id: task.id,
      name: task.title,
      status: mapTaskStatus(task.status),
      startDay: Math.min(startDay, totalDays - 1),
      durationDays: Math.min(durationDays, totalDays - startDay),
      note: task.parcelName,
    }
  })

  return { tasks: timelineTasks, days, todayIndex, title }
}
