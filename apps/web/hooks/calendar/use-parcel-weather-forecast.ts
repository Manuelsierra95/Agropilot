"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import { api } from "@workspace/web/lib/api"
import { dailyQueryOptions } from "@workspace/web/lib/dashboard/cache-policy"
import { dashboardQueryKeys } from "@workspace/web/lib/dashboard/query-keys"
import { weatherResponseToForecast } from "@workspace/web/lib/calendar/mappers"
import { useDashboardScope } from "@workspace/web/hooks/dashboard/use-dashboard-scope"

function addDaysIso(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T12:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function useParcelWeatherForecast() {
  const scope = useDashboardScope()
  const parcelId = scope.parcelId ?? ""
  const from = new Date().toISOString().slice(0, 10)
  const to = addDaysIso(from, 4)

  const query = useQuery({
    queryKey: dashboardQueryKeys.parcelWeather(parcelId, from, to),
    queryFn: () => api.weather.getParcelWeather(parcelId, { from, to }),
    enabled: Boolean(parcelId),
    ...dailyQueryOptions(),
  })

  const forecast = useMemo(
    () =>
      query.data ? weatherResponseToForecast(query.data, from) : undefined,
    [query.data, from]
  )

  return { ...query, forecast }
}
