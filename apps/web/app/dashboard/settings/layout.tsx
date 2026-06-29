import { PageContainer } from "@workspace/web/components/ui/page-container"

export default function DashboardSettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PageContainer>
      <div className="p-4 md:p-6">{children}</div>
    </PageContainer>
  )
}
