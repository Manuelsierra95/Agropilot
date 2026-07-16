import { Suspense } from "react"
import { SettingsOrganizationSection } from "@workspace/web/features/settings/organization"
import { api } from "@workspace/web/lib/api"

export default async function SettingsOrganizationPage() {
  const org = await api.organization.getMe()

  const isOwner = org.viewerRole === "owner"
  const isAdmin = org.viewerRole === "admin" || isOwner

  return (
    <Suspense>
      <SettingsOrganizationSection
        org={org}
        canEdit={isOwner}
        canManageMembers={isAdmin}
      />
    </Suspense>
  )
}
