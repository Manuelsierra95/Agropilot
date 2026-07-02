"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { api } from "@workspace/web/lib/api"
import { mutationQueryOptions } from "@workspace/web/lib/dashboard/cache-policy"
import { dashboardQueryKeys } from "@workspace/web/lib/dashboard/query-keys"
import { toCalendarTasks } from "@workspace/web/lib/calendar/mappers"
import { useDashboardScope } from "@workspace/web/hooks/dashboard/use-dashboard-scope"

export function useCalendarEvents() {
  const scope = useDashboardScope()

  return useQuery({
    queryKey: dashboardQueryKeys.calendarEvents(scope),
    queryFn: () => api.tasks.getCalendarEvents(scope),
    select: toCalendarTasks,
    placeholderData: keepPreviousData,
    ...mutationQueryOptions,
  })
}
