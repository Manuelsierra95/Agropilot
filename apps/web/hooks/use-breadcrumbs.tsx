"use client"

import { usePathname } from "next/navigation"
import { useMemo } from "react"
import { navigationData } from "@/lib/navigation/navigation-data"

export type BreadcrumbItem = {
  title: string
  link: string
}

// Mapa plano de url → título construido desde navigationData
function buildUrlMap(): Record<string, string> {
  const map: Record<string, string> = {}

  for (const item of navigationData.navMain) {
    map[item.url] = item.title
  }

  for (const item of navigationData.modules) {
    map[item.url] = item.title
    if (item.items) {
      for (const sub of item.items) {
        map[sub.url] = sub.title
      }
    }
  }

  for (const item of navigationData.settings) {
    map[item.url] = item.title
  }

  return map
}

const URL_MAP = buildUrlMap()

export function useBreadcrumbs(): BreadcrumbItem[] {
  const pathname = usePathname()

  return useMemo(() => {
    if (!pathname) return []

    const segments = pathname.split("/").filter(Boolean)

    return segments.reduce<BreadcrumbItem[]>((acc, segment, index) => {
      const url = "/" + segments.slice(0, index + 1).join("/")
      const title =
        URL_MAP[url] ?? segment.charAt(0).toUpperCase() + segment.slice(1) // fallback

      acc.push({ title, link: url })

      return acc
    }, [])
  }, [pathname])
}
