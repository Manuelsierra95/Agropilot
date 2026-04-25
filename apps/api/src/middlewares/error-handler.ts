import type { ErrorHandler } from "hono"
import { HTTPException } from "hono/http-exception"
import type { Env } from "@env"
import type { ApiVariables } from "@/types/variables"

export const errorHandler: ErrorHandler<{
  Bindings: Env
  Variables: ApiVariables
}> = (err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse()
  }
  console.error(err)
  return c.text("Internal Server Error", 500)
}
