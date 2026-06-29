import { db, schema, eq } from "@workspace/db"
import { HTTPException } from "hono/http-exception"
import { getCampaignPeriodForDate } from "@workspace/api/services/campaigns/domain/campaign"

type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

async function findCampaignByName(
  tx: DbTransaction,
  name: string
): Promise<{ id: string } | undefined> {
  return tx.query.campaigns.findFirst({
    where: eq(schema.campaigns.name, name),
    columns: { id: true },
  })
}

export async function ensureCampaignForDate(
  date: string,
  tx: DbTransaction
): Promise<string> {
  const period = getCampaignPeriodForDate(date)
  const existing = await findCampaignByName(tx, period.name)

  if (existing) {
    return existing.id
  }

  const [created] = await tx
    .insert(schema.campaigns)
    .values({
      name: period.name,
      startDate: period.startDate,
      endDate: period.endDate,
      isActive: false,
    })
    .onConflictDoNothing({ target: schema.campaigns.name })
    .returning({ id: schema.campaigns.id })

  if (created) {
    return created.id
  }

  const campaign = await findCampaignByName(tx, period.name)
  if (!campaign) {
    throw new HTTPException(500, {
      message: "Failed to resolve campaign for transaction date",
    })
  }

  return campaign.id
}
