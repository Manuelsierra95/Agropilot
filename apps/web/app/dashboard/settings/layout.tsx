"use client"

import { usePathname, useRouter } from "next/navigation"
import { Building2, CreditCard, User } from "lucide-react"
import { DashboardPageContainer } from "@/components/dashboard-page-container"
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"

const settingsTabs = [
  { value: "profile", label: "Profile", icon: User },
  { value: "organization", label: "Organization", icon: Building2 },
  { value: "billing", label: "Billing", icon: CreditCard },
] as const

type SettingsTabValue = (typeof settingsTabs)[number]["value"]

function getActiveTab(pathname: string): SettingsTabValue {
  if (pathname.includes("/organization")) return "organization"
  if (pathname.includes("/billing")) return "billing"
  return "profile"
}

export default function DashboardSettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const activeTab = getActiveTab(pathname)

  return (
    <DashboardPageContainer className="mx-4 mt-4 border md:mx-6 md:mt-0">
      <div className="space-y-6 p-4 md:p-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona perfil, organizacion y facturacion desde un solo lugar.
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            router.push(`/dashboard/settings/${value as SettingsTabValue}`)
          }
        >
          <TabsList className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground sm:w-auto">
            {settingsTabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap ring-offset-background transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="grid gap-4">{children}</div>
      </div>
    </DashboardPageContainer>
  )
}
