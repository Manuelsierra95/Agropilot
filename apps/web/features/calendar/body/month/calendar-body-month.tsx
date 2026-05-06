import { useCalendarContext } from "../../calendar-context"
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
  isWithinInterval,
  differenceInDays,
} from "date-fns"
import { cn } from "@workspace/ui/lib/utils"
import CalendarEvent from "../../calendar-event"
import { AnimatePresence, motion } from "motion/react"
import { Cloud, CloudRain, CloudSnow, Sun, CloudSun } from "lucide-react"

const weatherIcons = {
  sunny: Sun,
  cloudy: Cloud,
  "partly-cloudy": CloudSun,
  rainy: CloudRain,
  snowy: CloudSnow,
}

export default function CalendarBodyMonth() {
  const { date, events, setDate, setMode, forecast } = useCalendarContext()

  // Get the first day of the month
  const monthStart = startOfMonth(date)
  // Get the last day of the month
  const monthEnd = endOfMonth(date)

  // Get the first Monday of the first week (may be in previous month)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  // Get the last Sunday of the last week (may be in next month)
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  // Get all days between start and end
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  })

  const today = new Date()

  // Filter events to only show those within the current month view
  const visibleEvents = events.filter(
    (event) =>
      isWithinInterval(event.start, {
        start: calendarStart,
        end: calendarEnd,
      }) ||
      isWithinInterval(event.end, { start: calendarStart, end: calendarEnd })
  )

  return (
    <div className="flex flex-grow flex-col overflow-hidden">
      <div className="hidden grid-cols-7 divide-x divide-border border-border md:grid">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div
            key={day}
            className="border-b border-border py-2 text-center text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={monthStart.toISOString()}
          className="relative grid flex-grow overflow-y-auto md:grid-cols-7"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.2,
            ease: "easeInOut",
          }}
        >
          {calendarDays.map((day) => {
            const dayEvents = visibleEvents.filter((event) =>
              isSameDay(event.start, day)
            )
            const isToday = isSameDay(day, today)
            const isCurrentMonth = isSameMonth(day, date)

            // Get forecast for this day
            const daysFromToday = differenceInDays(day, today)
            const forecastForDay =
              forecast && daysFromToday >= 0 && daysFromToday <= 4
                ? forecast[daysFromToday]
                : null
            const WeatherIcon = forecastForDay
              ? weatherIcons[forecastForDay.condition]
              : null

            // Calculate dynamic height based on number of events
            const eventCount = dayEvents.length
            let minHeightClass = "min-h-20"
            if (eventCount > 0) minHeightClass = "min-h-28"
            if (eventCount > 2) minHeightClass = "min-h-36"
            if (eventCount > 4) minHeightClass = "min-h-44"

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "relative flex cursor-pointer flex-col border-r border-b p-2",
                  minHeightClass,
                  !isCurrentMonth && "hidden bg-muted/50 md:flex",
                  calendarDays.indexOf(day) % 7 === 6 && "border-r-0"
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  setDate(day)
                  setMode("day")
                }}
              >
                <div
                  className={cn(
                    "flex h-6 w-6 flex-col items-center justify-center rounded-full p-1 text-sm font-medium",
                    isToday && "bg-primary text-background"
                  )}
                >
                  {format(day, "d")}
                </div>

                {/* Weather forecast info */}
                {forecastForDay && WeatherIcon && (
                  <div className="mt-1 flex items-center gap-1">
                    <WeatherIcon
                      className="h-3 w-3 text-muted-foreground"
                      strokeWidth={1.5}
                    />
                    <span className="text-xs text-muted-foreground">
                      {forecastForDay.tempMax}°
                    </span>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  <div className="mt-1 flex flex-col gap-1">
                    {dayEvents.slice(0, 5).map((event) => (
                      <CalendarEvent
                        key={event.id}
                        event={event}
                        className="relative h-auto"
                        month
                      />
                    ))}
                    {dayEvents.length > 5 && (
                      <motion.button
                        key={`more-${day.toISOString()}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: 0.2,
                        }}
                        className="cursor-pointer text-xs text-muted-foreground hover:text-foreground hover:underline"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDate(day)
                          setMode("day")
                        }}
                      >
                        +{dayEvents.length - 5} ver todos
                      </motion.button>
                    )}
                  </div>
                </AnimatePresence>
              </div>
            )
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
