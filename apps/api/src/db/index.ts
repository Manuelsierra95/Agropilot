import { type DrizzleD1Database, drizzle } from 'drizzle-orm/d1'
import type { Context } from 'hono'

import * as appSchema from './app-schema.sql'
import * as authSchema from './auth-schema.sql'
import { Env } from '@env'
import { CustomContext } from 'globals'

export const schema = { ...appSchema, ...authSchema }
export type DBSchema = typeof schema

let dbInstance: DrizzleD1Database<DBSchema>

export function getDB(c: Context<{ Bindings: Env } & CustomContext>) {
  if (!dbInstance) {
    dbInstance = drizzle(c.env.DB, { schema })
  }
  return dbInstance
}
