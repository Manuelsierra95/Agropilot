import type { Context } from 'hono'
import type { Env } from '@env'
import type { CustomContext } from 'globals'
import { getAuth } from '@/lib/auth'

/**
 * Verifica si la petición está autenticada mediante Better Auth
 * @param c - Contexto de Hono
 * @returns objeto con usuario y sesión si está autenticado, null en caso contrario
 */
export const getSession = async (
  c: Context<{ Bindings: Env } & CustomContext>
) => {
  const auth = getAuth(c)

  try {
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    return session
  } catch (error) {
    console.error('Error al obtener sesión:', error)
    return null
  }
}

/**
 * Verifica si la petición está autenticada
 * @param c - Contexto de Hono
 * @returns true si está autenticada, false en caso contrario
 */
export const isAuthenticated = async (
  c: Context<{ Bindings: Env } & CustomContext>
): Promise<boolean> => {
  const session = await getSession(c)
  return !!session?.user
}
