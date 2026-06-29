import { db, schema, eq } from "@workspace/db"

export async function resolveCampaignById(campaignId: string) {
  return db.query.campaigns.findFirst({
    where: eq(schema.campaigns.id, campaignId),
  })
}
