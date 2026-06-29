"use client"
import { useNavigationSearchActions } from "@workspace/web/lib/navigation/navigation-actions"
import { SearchMenu } from "@workspace/web/components/dashboard-nav/components/search/search-menu"

export function SearchMenuWrapper() {
  const actions = useNavigationSearchActions()
  return (
    <SearchMenu
      className="pt-4"
      variant="sidebar"
      actions={actions}
      placeholder="Search..."
    />
  )
}
