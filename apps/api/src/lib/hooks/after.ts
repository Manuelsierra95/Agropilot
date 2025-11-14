import type { Context } from 'hono'
import { createAuthMiddleware } from 'better-auth/api'
import { regenerateDemoDataIfNeeded } from '@/utils/generateDemoData'

export const afterHook = (c: Context) =>
  createAuthMiddleware(async () => {
    const user = c.get('user')

    if (!user) return

    if (user?.email === 'demo@example.com') {
      try {
        const db = c.get('db')
        await regenerateDemoDataIfNeeded(db, {
          id: user.id,
          email: user.email,
        })
      } catch (error) {
        console.error('Error al regenerar datos demo:', error)
      }
    }
  })
