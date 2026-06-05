import { text } from "drizzle-orm/pg-core"

export const primaryKeyField = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID())
