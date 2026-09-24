export function isDemoMode(): boolean {
  if (typeof process !== "undefined" && process.env) {
    if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") return true
  }

  if (typeof window !== "undefined") {
    try {
      const cookies = document.cookie || ""
      if (/(?:^|;\s*)demo-mode=true/.test(cookies)) return true
      const params = new URLSearchParams(window.location.search)
      if (params.get("demo") === "true") return true
    } catch {
      // ignore
    }
  }

  return false
}

export function getDemoModeFromBuild(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true"
}
