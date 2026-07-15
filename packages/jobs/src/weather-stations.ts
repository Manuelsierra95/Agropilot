import { db, schema } from "@workspace/db"
import { getStations } from "@workspace/api/services/weather/commands/get-stations"

async function refreshAllParcelStations() {
  const parcels = await db.query.parcels.findMany({
    columns: { id: true },
  })

  let success = 0
  let failed = 0

  for (const parcel of parcels) {
    try {
      await getStations(parcel.id)
      success += 1
    } catch (error) {
      failed += 1
      console.error(`Failed parcel ${parcel.id}:`, error)
    }
  }

  return { total: parcels.length, success, failed }
}

refreshAllParcelStations()
  .then(async (result) => {
    await db.insert(schema.logs).values({
      source: "cron",
      action: "weather-stations",
      level: "info",
      message: `Refreshed stations for ${result.success}/${result.total} parcels`,
      meta: result,
    })
    process.exit(failedExitCode(result.failed))
  })
  .catch(async (err) => {
    await db.insert(schema.logs).values({
      source: "cron",
      action: "weather-stations",
      level: "error",
      message: err.message,
      meta: { stack: err.stack },
    })
    process.exit(1)
  })

function failedExitCode(failed: number): number {
  return failed > 0 ? 1 : 0
}
