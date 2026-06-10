"use client"

import dynamic from "next/dynamic"

import { OrgSwitcherPlaceholder } from "@/components/dashboard-nav/components/switcher-placeholders"

const OrgSwitcherClient = dynamic(
  () =>
    import("@/components/dashboard-nav/components/org-switcher").then((mod) => ({
      default: mod.OrgSwitcher,
    })),
  {
    loading: () => <OrgSwitcherPlaceholder />,
    ssr: false,
  }
)

export function OrgSwitcher() {
  return <OrgSwitcherClient />
}
