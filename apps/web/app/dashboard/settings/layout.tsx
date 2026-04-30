import { DashboardPageContainer } from "@/components/dashboard-page-container"

export default function DashboardSettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardPageContainer className="mx-4 mt-4 border md:mx-6 md:mt-0">
      <div className="p-4 md:p-6">{children}</div>
    </DashboardPageContainer>
  )
}
