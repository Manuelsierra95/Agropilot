import { SettingsBillingSection } from "@workspace/web/features/settings/billing"
import { api } from "@workspace/web/lib/api"

export default async function SettingsBillingPage() {
  const billing = await api.billing.getMe()

  return <SettingsBillingSection billing={billing} />
}
