import {
  addDays,
  differenceInCalendarDays,
  format,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
} from "date-fns"

import type { TaskUpdateInput } from "@workspace/schemas"
import type { CalendarTask } from "@workspace/web/lib/calendar/types"

function isAllDay(date: Date): boolean {
  return (
    date.getHours() === 0 &&
    date.getMinutes() === 0 &&
    date.getSeconds() === 0 &&
    date.getMilliseconds() === 0
  )
}

function formatScheduleDate(date: Date): string {
  if (isAllDay(date)) {
    return format(date, "yyyy-MM-dd")
  }
  return date.toISOString()
}

export function isSameSchedule(a: CalendarTask, b: CalendarTask): boolean {
  return (
    a.start.getTime() === b.start.getTime() &&
    a.end.getTime() === b.end.getTime()
  )
}

export function moveTaskToDay(
  task: CalendarTask,
  targetDay: Date
): CalendarTask {
  const dayOffset = differenceInCalendarDays(targetDay, task.start)
  if (dayOffset === 0) return task

  return {
    ...task,
    start: addDays(task.start, dayOffset),
    end: addDays(task.end, dayOffset),
  }
}

export function moveTaskToHour(
  task: CalendarTask,
  targetDay: Date,
  hour: number
): CalendarTask {
  const durationMs = task.end.getTime() - task.start.getTime()
  const newStart = setMilliseconds(
    setSeconds(setMinutes(setHours(targetDay, hour), 0), 0),
    0
  )

  return {
    ...task,
    start: newStart,
    end: new Date(newStart.getTime() + durationMs),
  }
}

export function toTaskUpdatePayload(task: CalendarTask): TaskUpdateInput {
  return {
    startDate: formatScheduleDate(task.start),
    endDate: formatScheduleDate(task.end),
  }
}
