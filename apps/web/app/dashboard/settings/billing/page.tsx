import { SettingsBillingSection } from "@/features/settings/billing"
import { api } from "@/lib/api"

export default async function SettingsBillingPage() {
  const billing = await api.billing.getMe()

  return <SettingsBillingSection billing={billing} />
}
