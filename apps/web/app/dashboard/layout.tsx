import { DashboardProviders } from "@workspace/web/components/dashboard-nav/dashboard-providers"
import { NavigationWrapper } from "@workspace/web/components/dashboard-nav/navigation-wrapper"
import { Providers } from "@workspace/web/providers/providers"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import NextTopLoader from "nextjs-toploader"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <Providers>
      <NuqsAdapter>
        <NextTopLoader color="var(--primary)" showSpinner={false} />
        <DashboardProviders>
          <NavigationWrapper>{children}</NavigationWrapper>
        </DashboardProviders>
      </NuqsAdapter>
    </Providers>
  )
}
