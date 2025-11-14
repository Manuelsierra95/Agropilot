import { createMiddleware } from 'hono/factory'
import type { Env } from '@env'
import type { CustomContext } from 'globals'
import { getAuth } from '@/lib/auth'

export const authorizationMiddleware = createMiddleware<
  {
    Bindings: Env
  } & CustomContext
>(async (c, next) => {
  const session = await getAuth(c).api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session) {
    return await next()
  }

  const userEmail = session.user.email

  if (userEmail === 'demo@example.com' && c.req.method !== 'GET') {
    return c.json(
      {
        error: 'Forbidden',
        message: 'El usuario demo solo tiene permisos de lectura',
      },
      403
    )
  }

  await next()
})
