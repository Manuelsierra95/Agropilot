import { DashboardPageContainer } from "@/components/ui/dashboard-page-container"

export default function DashboardSettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardPageContainer>
      <div className="p-4 md:p-6">{children}</div>
    </DashboardPageContainer>
  )
}
