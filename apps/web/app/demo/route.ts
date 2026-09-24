import { NextResponse, type NextRequest } from "next/server"
import { isDemoMode } from "@workspace/web/lib/demo-mode"
import { webAppUrl } from "@workspace/web/lib/env"

export async function GET(request: NextRequest) {
  if (isDemoMode()) {
    const target = new URL("/dashboard", request.nextUrl.origin)
    const redirect = NextResponse.redirect(target)
    redirect.headers.append(
      "Set-Cookie",
      "demo-mode=true; Path=/; Max-Age=86400; SameSite=Lax"
    )
    return redirect
  }

  const { auth } = await import("@workspace/auth")
  const { DEMO_USER_EMAIL, isDemoEnabled } = await import(
    "@workspace/auth/demo"
  )

  if (!isDemoEnabled()) {
    return NextResponse.redirect(webAppUrl("/"))
  }

  const password = process.env.DEMO_USER_PASSWORD
  if (!password) {
    return NextResponse.redirect(webAppUrl("/"))
  }

  const signInResponse = await auth.api.signInEmail({
    body: {
      email: DEMO_USER_EMAIL,
      password,
    },
    asResponse: true,
  })

  if (!signInResponse.ok) {
    return NextResponse.redirect(webAppUrl("/"))
  }

  const redirect = NextResponse.redirect(webAppUrl("/dashboard"))

  for (const cookie of signInResponse.headers.getSetCookie()) {
    redirect.headers.append("Set-Cookie", cookie)
  }

  return redirect
}
