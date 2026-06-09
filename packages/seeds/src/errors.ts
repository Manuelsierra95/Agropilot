export type SeedErrorCode =
  | "USER_NOT_FOUND"
  | "ORGANIZATION_NOT_FOUND"
  | "MEMBERSHIP_NOT_FOUND"

const MESSAGES: Record<SeedErrorCode, string> = {
  USER_NOT_FOUND:
    "No se encontró el usuario con el ID configurado. Inicia sesión con Google y actualiza SEED_USER_ID en packages/seeds/src/config.ts.",
  ORGANIZATION_NOT_FOUND:
    "No se encontró la organización con el ID configurado. Actualiza SEED_ORGANIZATION_ID en packages/seeds/src/config.ts.",
  MEMBERSHIP_NOT_FOUND:
    "El usuario no pertenece a la organización configurada. Verifica que SEED_USER_ID y SEED_ORGANIZATION_ID correspondan a tu cuenta activa.",
}

export class SeedError extends Error {
  readonly code: SeedErrorCode

  constructor(code: SeedErrorCode) {
    super(MESSAGES[code])
    this.name = "SeedError"
    this.code = code
  }
}
