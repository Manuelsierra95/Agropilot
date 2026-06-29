import { db, schema } from "@workspace/db"
import { getOilPrices } from "@workspace/scrapers"

getOilPrices()
  .then(async (result) => {
    await db.insert(schema.logs).values({
      source: "scraper",
      action: "oil",
      level: "info",
      message: `Inserted ${result.totalInserted} prices`,
      duration: result.duration,
      meta: {
        totalInserted: result.totalInserted,
        countries: result.countryCount,
      },
    })
    process.exit(0)
  })
  .catch(async (err) => {
    await db.insert(schema.logs).values({
      source: "scraper",
      action: "oil",
      level: "error",
      message: err.message,
      meta: { stack: err.stack },
    })
    process.exit(1)
  })
