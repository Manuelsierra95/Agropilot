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
//  .get("/", async (c) => {
//     const authContext = c.get("auth")
//     const teamId = authContext?.team.id

//     if (!authContext || !teamId) {
//       return c.json({ error: "Unauthorized" }, 401)
//     }

//     const parcels = await db
//       .select()
//       .from(schema.parcels)
//       .where(eq(schema.parcels.teamId, teamId))

//     return c.json({
//       teamId,
//       data: parcels,
//     })
//   })
