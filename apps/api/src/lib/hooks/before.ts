import type { Context } from 'hono'
import { createAuthMiddleware } from 'better-auth/api'

export const beforeHook = (c: Context) =>
  createAuthMiddleware(async () => {
    const url = c.req.url

    if (url.includes('/sign-in/social')) {
      return
    }

    const user = c.get('user')

    if (!user) return

    // Solo bloquear login con email/password si no es el usuario demo
    if (url.includes('/sign-in/email') && user.email !== 'demo@example.com') {
      throw new Error(
        'El inicio de sesión con email/password solo está disponible para la cuenta demo. Use el botón "Continuar con Google".'
      )
    }

    // Bloquear registro con email/password
    if (url.includes('/sign-up/email')) {
      throw new Error(
        'El registro solo está disponible a través de Google. Use el botón "Continuar con Google".'
      )
    }
  })
