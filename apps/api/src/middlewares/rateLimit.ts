// import type { Env } from "@env"
// import type { MiddlewareHandler } from "hono"

// /**
//  * Rate limiter middleware para Cloudflare Workers
//  * Límite: X peticiones cada X minutos por IP
//  */

// // TODO: Falta implementacion y tests
// const RATE_LIMIT_STATUS = 429

// export const rateLimitMiddleware: MiddlewareHandler<{ Bindings: Env }> = async (
//   c,
//   next
// ) => {
//   const env = c.env

//   if (env.NODE_ENV !== "production") {
//     return next()
//   }

//   const key = [
//     c.req.method,
//     new URL(c.req.url).pathname,
//     c.req.header("cf-connecting-ip") ||
//       c.req.header("x-forwarded-for") ||
//       c.req.header("x-real-ip") ||
//       "unknown",
//   ].join(":")

//   const { success } = await env.RATE_LIMITER.limit({ key })

//   if (!success) {
//     return c.json(
//       {
//         success: false,
//         error: "Rate limit exceeded",
//         message: "Too many requests. Please try again later.",
//       },
//       RATE_LIMIT_STATUS
//     )
//   }

//   return next()
// }
