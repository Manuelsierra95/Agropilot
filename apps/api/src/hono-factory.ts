import { createFactory } from 'hono/factory'

import { getAuth } from '@/lib/auth'

import { getDB } from '@/db'
import { CustomContext } from 'globals'
import { Env } from '@env'

export default createFactory<{ Bindings: Env } & CustomContext>({
  initApp: (app) => {
    app.use(async (c, next) => {
      const db = getDB(c)
      c.set('db', db)
      await next()
    })
    app.use(async (c, next) => {
      const auth = getAuth(c)
      c.set('auth', auth)
      await next()
    })
  },
})
