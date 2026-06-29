"use client"

import dynamic from "next/dynamic"

import { CampaignSwitcherPlaceholder } from "@workspace/web/components/dashboard-nav/components/switcher-placeholders"

const CampaignSwitcherClient = dynamic(
  () =>
    import("@workspace/web/components/dashboard-nav/components/campaign-switcher").then(
      (mod) => ({
        default: mod.CampaignSwitcher,
      })
    ),
  {
    loading: () => <CampaignSwitcherPlaceholder />,
    ssr: false,
  }
)

export function CampaignSwitcher() {
  return <CampaignSwitcherClient />
}
