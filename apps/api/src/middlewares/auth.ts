import honoFactory from '@/hono-factory'

/**
 * Middleware para proteger rutas que requieren autenticación
 * Verifica que el usuario tenga una sesión activa
 */
export const requireAuth = honoFactory.createMiddleware(async (c, next) => {
  const user = c.get('user')
  const session = c.get('session')

  if (!user || !session) {
    return c.json(
      {
        success: false,
        error: 'No autenticado',
        message: 'Debes iniciar sesión para acceder a este recurso',
      },
      401
    )
  }

  await next()
})
