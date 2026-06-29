import { SettingsProfileSection } from "@workspace/web/features/settings/profile"
import { api } from "@workspace/web/lib/api"

export default async function SettingsProfilePage() {
  const user = await api.user.getMe()

  return <SettingsProfileSection user={user} />
}
