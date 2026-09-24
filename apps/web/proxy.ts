import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { isDemoMode } from "@workspace/web/lib/demo-mode"

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isDemoMode()) {
    return NextResponse.next()
  }

  const { auth } = await import("@workspace/auth")
  const { webAppUrl } = await import("@workspace/web/lib/env")

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return NextResponse.redirect(webAppUrl("/auth/sign-in"))
  }

  const { onboardingStatus, onboardingStep } = session.user
  const needsOnboarding =
    onboardingStatus === "not_started" || onboardingStatus === "in_progress"

  if (needsOnboarding && pathname.startsWith("/dashboard")) {
    const step = onboardingStep ?? 1
    return NextResponse.redirect(webAppUrl(`/onboarding?step=${step}`))
  }

  if (!needsOnboarding && pathname.startsWith("/onboarding")) {
    return NextResponse.redirect(webAppUrl("/dashboard"))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/onboarding",
    "/onboarding/:path*",
  ],
}
