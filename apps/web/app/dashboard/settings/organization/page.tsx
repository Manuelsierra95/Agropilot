import { SettingsOrganizationSection } from "@/features/settings/organization"
import { api } from "@/lib/api"

export default async function SettingsOrganizationPage() {
  const org = await api.organization.getMe()

  const isOwner = org.role === "owner"
  const isAdmin = org.role === "admin" || isOwner

  return (
    <SettingsOrganizationSection
      org={org}
      canEdit={isOwner}
      canManageMembers={isAdmin}
    />
  )
}
