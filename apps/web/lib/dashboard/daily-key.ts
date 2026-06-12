const DASHBOARD_TIMEZONE = "Europe/Madrid"

export function getDashboardDailyKey(
  timeZone: string = DASHBOARD_TIMEZONE
): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date())
}

export function getDailyStaleTimeMs(
  timeZone: string = DASHBOARD_TIMEZONE
): number {
  const now = new Date()
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  }).formatToParts(now)

  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0)
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0)
  const second = Number(parts.find((p) => p.type === "second")?.value ?? 0)

  const elapsedMs = ((hour * 60 + minute) * 60 + second) * 1000
  return Math.max(60_000, 86_400_000 - elapsedMs)
}
