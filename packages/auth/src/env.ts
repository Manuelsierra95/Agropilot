function trimEnvValue(value: string | undefined): string | undefined {
  if (!value) return undefined

  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim()
  }

  return trimmed
}

export function parseOrigins(value: string | undefined): string[] {
  const raw = trimEnvValue(value)
  if (!raw) return []

  return raw
    .split(",")
    .map((origin) => trimEnvValue(origin))
    .filter((origin): origin is string => Boolean(origin))
}

export function resolveCookieDomain(
  nodeEnv: string | undefined,
  authCookieDomain: string | undefined,
  origins: string[]
): string | undefined {
  if (nodeEnv !== "production") return undefined

  const explicit = trimEnvValue(authCookieDomain)
  if (explicit) {
    return explicit.startsWith(".") ? explicit : `.${explicit}`
  }

  const primaryOrigin = origins[0]
  if (!primaryOrigin) return undefined

  try {
    const hostname = new URL(primaryOrigin).hostname
    if (hostname === "localhost" || hostname.endsWith(".localhost")) {
      return undefined
    }

    const parts = hostname.split(".")
    if (parts.length < 2) return undefined

    return `.${parts.slice(-2).join(".")}`
  } catch {
    return undefined
  }
}
