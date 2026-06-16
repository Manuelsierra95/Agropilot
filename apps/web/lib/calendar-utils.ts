import type { Event, startOfWeek } from "@/types/calendar"

export function getDaysInMonth(month: number, year: number) {
  return Array.from(
    { length: new Date(year, month + 1, 0).getDate() },
    (_, index) => ({
      day: index + 1,
      events: [],
    })
  )
}

export function getDaysInWeek(
  week: number,
  year: number,
  weekStartsOn: startOfWeek = "sunday"
) {
  const startDay = weekStartsOn === "sunday" ? 0 : 1
  const janFirst = new Date(year, 0, 1)
  const janFirstDayOfWeek = janFirst.getDay()
  const weekStart = new Date(janFirst)
  weekStart.setDate(
    janFirst.getDate() +
      (week - 1) * 7 +
      ((startDay - janFirstDayOfWeek + 7) % 7)
  )

  const days = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart)
    day.setDate(day.getDate() + i)
    days.push(day)
  }

  return days
}

export function getWeekNumber(date: Date) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  )
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  )
  return weekNo
}

export function getEventsForDay(
  day: number,
  currentDate: Date,
  events: Event[]
) {
  return events.filter((event) => {
    const eventStart = new Date(event.startDate)
    const eventEnd = new Date(event.endDate)

    const startOfDay = new Date(currentDate)
    startOfDay.setDate(day)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(currentDate)
    endOfDay.setDate(day + 1)
    endOfDay.setHours(0, 0, 0, 0)

    const isSameDay =
      eventStart.getDate() === day &&
      eventStart.getMonth() === currentDate.getMonth() &&
      eventStart.getFullYear() === currentDate.getFullYear()

    const isSpanningDay = eventStart < endOfDay && eventEnd >= startOfDay

    return isSameDay || isSpanningDay
  })
}

export function getDayName(day: number): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  return days[day] ?? "Sun"
}

export function handleEventStyling(
  event: Event,
  dayEvents: Event[],
  periodOptions?: {
    eventsInSamePeriod?: number
    periodIndex?: number
    adjustForPeriod?: boolean
  }
) {
  const eventsOnHour = dayEvents.filter((e) => {
    if (e.id === event.id) return false

    const eStart =
      e.startDate instanceof Date
        ? e.startDate.getTime()
        : new Date(e.startDate).getTime()
    const eEnd =
      e.endDate instanceof Date
        ? e.endDate.getTime()
        : new Date(e.endDate).getTime()
    const eventStart =
      event.startDate instanceof Date
        ? event.startDate.getTime()
        : new Date(event.startDate).getTime()
    const eventEnd =
      event.endDate instanceof Date
        ? event.endDate.getTime()
        : new Date(event.endDate).getTime()

    return eStart < eventEnd && eEnd > eventStart
  })

  const allEventsInRange = [event, ...eventsOnHour]

  allEventsInRange.sort((a, b) => {
    const aStart =
      a.startDate instanceof Date
        ? a.startDate.getTime()
        : new Date(a.startDate).getTime()
    const bStart =
      b.startDate instanceof Date
        ? b.startDate.getTime()
        : new Date(b.startDate).getTime()
    return aStart - bStart
  })

  const useCustomPeriod =
    periodOptions?.adjustForPeriod &&
    periodOptions.eventsInSamePeriod !== undefined &&
    periodOptions.periodIndex !== undefined

  let numEventsOnHour = useCustomPeriod
    ? periodOptions!.eventsInSamePeriod!
    : allEventsInRange.length
  let indexOnHour = useCustomPeriod
    ? periodOptions!.periodIndex!
    : allEventsInRange.indexOf(event)

  if (numEventsOnHour === 0 || indexOnHour === -1) {
    numEventsOnHour = 1
    indexOnHour = 0
  }

  let eventHeight = 0
  let maxHeight = 0
  let eventTop = 0

  if (event.startDate instanceof Date && event.endDate instanceof Date) {
    const startTime =
      event.startDate.getHours() * 60 + event.startDate.getMinutes()
    const endTime = event.endDate.getHours() * 60 + event.endDate.getMinutes()
    const diffInMinutes = endTime - startTime
    eventHeight = (diffInMinutes / 60) * 64

    const eventStartHour =
      event.startDate.getHours() + event.startDate.getMinutes() / 60
    const dayEndHour = 24
    maxHeight = Math.max(0, (dayEndHour - eventStartHour) * 64)
    eventHeight = Math.min(eventHeight, maxHeight)
    eventTop = eventStartHour * 64
  } else {
    console.error("Invalid event or missing start/end dates.")
  }

  const widthPercentage = Math.min(95 / Math.max(numEventsOnHour, 1), 95)
  const leftPosition = indexOnHour * (widthPercentage + 1)
  const safeLeftPosition = Math.min(leftPosition, 100 - widthPercentage)
  const minimumHeight = 20

  return {
    height: `${
      eventHeight < minimumHeight
        ? minimumHeight
        : eventHeight > maxHeight
          ? maxHeight
          : eventHeight
    }px`,
    top: `${eventTop}px`,
    zIndex: indexOnHour + 1,
    left: `${safeLeftPosition}%`,
    maxWidth: `${widthPercentage}%`,
    minWidth: `${widthPercentage}%`,
  }
}
