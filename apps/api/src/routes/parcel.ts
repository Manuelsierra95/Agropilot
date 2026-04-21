import { Hono } from "hono"
import { requireAuth } from "@/middlewares/require-auth"
// import { db, schema } from "@workspace/db"

export const parcelRoutes = new Hono()
  .use(requireAuth)
  .get("/test", (c) => {
    return c.json({
      message: "This is a test route for parcel",
    })
  })
  .post("/create", (c) => {
    return c.json({
      message: "Parcel created successfully",
    })
  })
