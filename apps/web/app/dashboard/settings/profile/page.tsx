import { SettingsProfileSection } from "@/features/settings/components/profile"
import { api } from "@/lib/api"

export default async function SettingsProfilePage() {
  const org = await api.organization.public()

  return <SettingsProfileSection org={org} />
}
