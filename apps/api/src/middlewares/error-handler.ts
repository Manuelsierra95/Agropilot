import type { ErrorHandler } from "hono"
import { HTTPException } from "hono/http-exception"
import type { Env } from "@env"
import type { ApiVariables } from "@workspace/api/types/variables"

export const errorHandler: ErrorHandler<{
  Bindings: Env
  Variables: ApiVariables
}> = (err, c) => {
  if (err instanceof HTTPException) {
    return c.json(
      {
        error: {
          code: `HTTP_${err.status}`,
          message: err.message,
        },
      },
      err.status
    )
  }

  console.error(err)
  return c.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal Server Error",
      },
    },
    500
  )
}
