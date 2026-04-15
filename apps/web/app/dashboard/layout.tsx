import { NuqsAdapter } from "nuqs/adapters/next/app"
import NextTopLoader from "nextjs-toploader"
import { NavigationWrapper } from "@/components/nav/navigation-wrapper"
import KBar from "@/components/nav/kbar"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <body>
      <KBar>
        <NuqsAdapter>
          <NextTopLoader color="var(--primary)" showSpinner={false} />
          <NavigationWrapper>{children}</NavigationWrapper>
        </NuqsAdapter>
      </KBar>
    </body>
  )
}
