export type SeedErrorCode =
  | "USER_NOT_FOUND"
  | "ORGANIZATION_NOT_FOUND"
  | "MEMBERSHIP_NOT_FOUND"
  | "DEMO_PASSWORD_MISSING"

const MESSAGES: Record<SeedErrorCode, string> = {
  USER_NOT_FOUND:
    "No se encontró el usuario demo. Ejecuta seedDemoAuth primero o verifica DEMO_USER_ID en config.ts.",
  ORGANIZATION_NOT_FOUND:
    "No se encontró la organización demo. Verifica DEMO_ORGANIZATION_ID en packages/seeds/src/config.ts.",
  MEMBERSHIP_NOT_FOUND:
    "El usuario demo no pertenece a la organización demo configurada.",
  DEMO_PASSWORD_MISSING:
    "Define DEMO_USER_PASSWORD en el entorno antes de ejecutar los seeds.",
}

export class SeedError extends Error {
  readonly code: SeedErrorCode

  constructor(code: SeedErrorCode, message?: string) {
    super(message ?? MESSAGES[code])
    this.name = "SeedError"
    this.code = code
  }
}
