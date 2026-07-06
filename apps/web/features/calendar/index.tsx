"use client"

import { PageContainer } from "@workspace/web/components/ui/page-container"
import { WidgetSkeleton } from "@workspace/web/components/widget-skeleton"
import { CalendarAllView } from "@workspace/web/features/calendar/views/all"
import { CalendarSingleView } from "@workspace/web/features/calendar/views/single"
import {
  useCalendarEvents,
  useParcelWeatherForecast,
} from "@workspace/web/hooks/calendar"
import { useIsAllParcelsSelected } from "@workspace/web/hooks/use-is-all-parcels-selected"

export default function Calendar() {
  const isAllParcels = useIsAllParcelsSelected()
  const calendarEvents = useCalendarEvents()
  const weatherForecast = useParcelWeatherForecast()

  const tasks = calendarEvents.data ?? []
  const forecast = isAllParcels ? undefined : weatherForecast.forecast

  const isLoading = calendarEvents.isPending && !calendarEvents.data

  return (
    <PageContainer className="h-full gap-4">
      {isLoading ? (
        <WidgetSkeleton
          className="h-full min-h-[480px]"
          contentHeight="h-full"
        />
      ) : isAllParcels ? (
        <CalendarAllView initialTasks={tasks} />
      ) : (
        <CalendarSingleView initialTasks={tasks} forecast={forecast} />
      )}
    </PageContainer>
  )
}
