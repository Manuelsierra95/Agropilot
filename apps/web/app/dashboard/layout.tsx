import { Providers } from "@/providers/providers"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import NextTopLoader from "nextjs-toploader"
import { NavigationWrapper } from "@/components/dashboard-nav/navigation-wrapper"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <Providers>
      <NuqsAdapter>
        <NextTopLoader color="var(--primary)" showSpinner={false} />
        <NavigationWrapper>{children}</NavigationWrapper>
      </NuqsAdapter>
    </Providers>
  )
}
