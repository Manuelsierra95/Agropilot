"use client"

import dynamic from "next/dynamic"

import {
  ParcelSwitcherPlaceholder,
  type ParcelSwitcherPlaceholderProps,
} from "@workspace/web/components/dashboard-nav/components/switcher-placeholders"

const ParcelSwitcherClient = dynamic(
  () =>
    import("@workspace/web/components/dashboard-nav/components/parcel-switcher").then(
      (mod) => ({
        default: mod.ParcelSwitcher,
      })
    ),
  {
    loading: () => <ParcelSwitcherPlaceholder />,
    ssr: false,
  }
)

export function ParcelSwitcher(props: ParcelSwitcherPlaceholderProps) {
  return <ParcelSwitcherClient {...props} />
}
