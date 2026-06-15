"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { api } from "@/lib/api"
import { mutationQueryOptions } from "@/lib/dashboard/cache-policy"
import { dashboardQueryKeys } from "@/lib/dashboard/query-keys"
import { toCalendarEvents } from "@/lib/calendar/mappers"
import { useDashboardScope } from "@/hooks/dashboard/use-dashboard-scope"

export function useCalendarEvents() {
  const scope = useDashboardScope()

  return useQuery({
    queryKey: dashboardQueryKeys.calendarEvents(scope),
    queryFn: () => api.tasks.getCalendarEvents(scope),
    select: toCalendarEvents,
    placeholderData: keepPreviousData,
    ...mutationQueryOptions,
  })
}
