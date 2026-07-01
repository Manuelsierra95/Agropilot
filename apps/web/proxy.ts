import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@workspace/auth"

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url))
  }

  const { onboardingStatus, onboardingStep } = session.user
  const needsOnboarding =
    onboardingStatus === "not_started" || onboardingStatus === "in_progress"

  if (needsOnboarding && pathname.startsWith("/dashboard")) {
    const step = onboardingStep ?? 1
    return NextResponse.redirect(
      new URL(`/onboarding?step=${step}`, request.url)
    )
  }

  if (!needsOnboarding && pathname.startsWith("/onboarding")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/", "/dashboard/:path*", "/onboarding/:path*"],
}
