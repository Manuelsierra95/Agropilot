import type { DrizzleD1Database } from 'drizzle-orm/d1'
import type { DBSchema } from '@/db'
import type { getAuth } from '@/lib/auth'
import type { Session, User } from 'better-auth'

export type CustomContext = {
  Variables: {
    db: DrizzleD1Database<DBSchema>
    user: User | null
    session: Session | null
    auth: ReturnType<typeof getAuth>
  }
}
