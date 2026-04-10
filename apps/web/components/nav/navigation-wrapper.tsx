import NavSidebar from "@/components/nav/nav-sidebar"
import NavDock from "@/components/nav/nav-dock"

export function NavigationWrapper({ children }: { children: React.ReactNode }) {
  return (
    <nav>
      {/* Mobile: Navbar Dock */}
      <div className="min-h-screen md:hidden">
        {children}
        <NavDock />
      </div>

      {/* Tablet y Desktop: Sidebar */}
      <div className="hidden md:block">
        <NavSidebar>{children}</NavSidebar>
      </div>
    </nav>
  )
}
