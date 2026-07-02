"use client"

import { PageContainer } from "@workspace/web/components/ui/page-container"
import { WidgetSkeleton } from "@workspace/web/components/widget-skeleton"
import { CalendarClient } from "@workspace/web/features/calendar/components/calendar/calendar-client"
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

  return (
    <PageContainer className="h-full gap-4">
      {calendarEvents.isPending && !calendarEvents.data ? (
        <WidgetSkeleton
          className="h-full min-h-[480px]"
          contentHeight="h-full"
        />
      ) : (
        <CalendarClient initialTasks={tasks} forecast={forecast} />
      )}
    </PageContainer>
  )
}
