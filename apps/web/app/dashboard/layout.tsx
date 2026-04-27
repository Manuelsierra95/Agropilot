import { auth } from "@workspace/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { Providers } from "@/providers/providers"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import NextTopLoader from "nextjs-toploader"
import { NavigationWrapper } from "@/components/dashboard-nav/navigation-wrapper"
import KBar from "@/components/dashboard-nav/kbar"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/auth/sign-in")
  }

  return (
    <Providers>
      <KBar>
        <NuqsAdapter>
          <NextTopLoader color="var(--primary)" showSpinner={false} />
          <NavigationWrapper>{children}</NavigationWrapper>
        </NuqsAdapter>
      </KBar>
    </Providers>
  )
}
