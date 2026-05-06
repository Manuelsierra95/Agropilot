import { format, isSameDay, differenceInDays } from "date-fns"
import { cn } from "@workspace/ui/lib/utils"
import { useCalendarContext } from "../calendar-context"
import { Cloud, CloudRain, CloudSnow, Sun, CloudSun } from "lucide-react"

const weatherIcons = {
  sunny: Sun,
  cloudy: Cloud,
  "partly-cloudy": CloudSun,
  rainy: CloudRain,
  snowy: CloudSnow,
}

export default function CalendarBodyHeader({
  date,
  onlyDay = false,
}: {
  date: Date
  onlyDay?: boolean
}) {
  const isToday = isSameDay(date, new Date())
  const { forecast } = useCalendarContext()

  // Get forecast for this day
  const today = new Date()
  const daysFromToday = differenceInDays(date, today)
  const forecastForDay =
    forecast && daysFromToday >= 0 && daysFromToday <= 4
      ? forecast[daysFromToday]
      : null
  const WeatherIcon = forecastForDay
    ? weatherIcons[forecastForDay.condition]
    : null

  return (
    <div className="sticky top-0 z-10 flex w-full items-center justify-center gap-2 border-b bg-background py-2">
      <span
        className={cn(
          "text-xs font-medium",
          isToday ? "font-bold text-primary" : "text-muted-foreground"
        )}
      >
        {format(date, "EEE")}
      </span>
      {!onlyDay && (
        <span
          className={cn(
            "text-xs font-medium",
            isToday ? "font-bold text-primary" : "text-foreground"
          )}
        >
          {format(date, "dd")}
        </span>
      )}

      {/* Weather forecast info */}
      {forecastForDay && WeatherIcon && (
        <div className="flex items-center justify-center gap-1 pr-2">
          <WeatherIcon
            className="h-3.5 w-3.5 text-muted-foreground"
            strokeWidth={1.5}
          />
          <span className="text-xs text-muted-foreground">
            {forecastForDay.tempMax}°
          </span>
        </div>
      )}
    </div>
  )
}
