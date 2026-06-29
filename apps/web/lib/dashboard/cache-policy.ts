import { getDailyStaleTimeMs } from "@workspace/web/lib/dashboard/daily-key"

export const mutationQueryOptions = {
  staleTime: Number.POSITIVE_INFINITY,
  gcTime: 1000 * 60 * 60 * 24,
} as const

export function dailyQueryOptions() {
  return {
    staleTime: getDailyStaleTimeMs(),
    gcTime: 1000 * 60 * 60 * 24,
  } as const
}
