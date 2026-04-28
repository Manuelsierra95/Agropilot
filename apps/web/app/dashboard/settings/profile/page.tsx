import { SettingsProfileSection } from "@/features/settings/profile"
import { api } from "@/lib/api"

export default async function SettingsProfilePage() {
  const user = await api.user.getMe()

  return <SettingsProfileSection user={user} />
}
