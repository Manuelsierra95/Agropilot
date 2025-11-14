import type { Context } from 'hono'
import { createAuthMiddleware } from 'better-auth/api'

export const beforeHook = (c: Context) =>
  createAuthMiddleware(async () => {
    const user = c.get('user')

    if (!user) return

    // Solo permitir login con email/password para el usuario demo
    if (user.email !== 'demo@example.com') {
      throw new Error(
        'El inicio de sesión con email/password solo está disponible para la cuenta demo. Use el botón "Continuar con Google".'
      )
    }
    if (user.email !== 'demo@example.com') {
      throw new Error(
        'El registro solo está disponible a través de Google. Use el botón "Continuar con Google".'
      )
    }
  })
