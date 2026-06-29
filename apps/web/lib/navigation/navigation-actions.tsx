import {
  navigationData,
  NavigationData,
} from "@workspace/web/lib/navigation/navigation-data"
import { SearchAction } from "@workspace/web/components/dashboard-nav/components/search/search-menu"
import type { ScopeKey } from "@workspace/web/lib/navigation/scope"

export function navigationToSearchActions(
  data: NavigationData,
  navigate: (url: string, scope?: ScopeKey[]) => void
): SearchAction[] {
  const actions: SearchAction[] = []

  // ── navMain ──────────────────────────────────────────────
  for (const item of data.navMain) {
    actions.push({
      id: `nav-${item.title.toLowerCase()}`,
      name: item.title,
      keywords: item.title.toLowerCase(),
      section: "Navigation",
      icon: <item.icon className="size-4" />,
      perform: () => navigate(item.url, item.scope),
    })
  }

  // ── modules ──────────────────────────────────────────────
  for (const mod of data.modules) {
    // Skip locked or coming_soon modules entirely
    if (mod.isLocked || mod.status === "coming_soon") continue

    // Parent module
    actions.push({
      id: `module-${mod.title.toLowerCase().replace(/\s+/g, "-")}`,
      name: mod.title,
      subtitle: mod.status === "beta" ? "Beta" : undefined,
      keywords: `module ${mod.title.toLowerCase()}`,
      section: "Modules",
      icon: <mod.icon className="size-4" />,
      perform: () => navigate(mod.url),
    })

    // Sub-items
    for (const sub of mod.items ?? []) {
      actions.push({
        id: `module-sub-${sub.title.toLowerCase().replace(/\s+/g, "-")}`,
        name: sub.title,
        subtitle: mod.title,
        keywords: `${mod.title.toLowerCase()} ${sub.title.toLowerCase()}`,
        section: "Modules",
        icon: sub.icon ? (
          <sub.icon className="size-4" />
        ) : (
          <mod.icon className="size-4" />
        ),
        perform: () => navigate(sub.url),
      })
    }
  }

  // ── settings ─────────────────────────────────────────────
  for (const item of data.settings) {
    actions.push({
      id: `settings-${item.title.toLowerCase()}`,
      name: item.title,
      keywords: `settings ${item.title.toLowerCase()}`,
      section: "Settings",
      icon: <item.icon className="size-4" />,
      perform: () => navigate(item.url),
    })
  }

  // ── parcels ──────────────────────────────────────────────
  for (const parcel of data.parcels) {
    actions.push({
      id: `parcel-${parcel.name.toLowerCase().replace(/\s+/g, "-")}`,
      name: parcel.name,
      subtitle: parcel.crop,
      keywords: `parcel ${parcel.name.toLowerCase()} ${parcel.crop.toLowerCase()}`,
      section: "Parcels",
      icon: <parcel.icon className="size-4" />,
    })
  }

  return actions
}

// ── Ready-to-use hook ─────────────────────────────────────

import { useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import * as React from "react"
import { usePreservedSearchParams } from "@workspace/web/hooks/use-preserved-search-params"
import { SCOPE_KEYS } from "@workspace/web/lib/navigation/scope"

export function useNavigationSearchActions(): SearchAction[] {
  const router = useRouter()
  const buildUrl = usePreservedSearchParams()

  const handleNavigate = useCallback(
    (url: string, scope?: ScopeKey[]) => {
      router.push(buildUrl(url, { include: scope ?? SCOPE_KEYS.global }))
    },
    [router, buildUrl]
  )

  return useMemo(
    () => navigationToSearchActions(navigationData, handleNavigate),
    [handleNavigate]
  )
}
