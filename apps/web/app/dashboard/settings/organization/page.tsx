import { SettingsOrganizationSection } from "@/features/settings/organization"
import { api } from "@/lib/api"

export default async function SettingsOrganizationPage() {
  const { organization } = await api.organization.public()
  const members = await api.organization.members()

  console.log("Organization data:", organization)
  console.log("Organization members:", members)

  return <SettingsOrganizationSection org={organization} members={members} />
}
