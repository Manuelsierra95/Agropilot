"use client"

import Link from "next/link"
import { usePreservedSearchParams } from "@/hooks/use-preserved-search-params"
import type { ScopeKey } from "@/lib/navigation/scope"

export function PreservedLink({
  href,
  include,
  override,
  ...props
}: {
  href: string
  include?: ScopeKey[]
  override?: Partial<Record<ScopeKey, string | null>>
} & React.ComponentProps<typeof Link>) {
  const buildUrl = usePreservedSearchParams()
  return <Link href={buildUrl(href, { include, override })} {...props} />
}
