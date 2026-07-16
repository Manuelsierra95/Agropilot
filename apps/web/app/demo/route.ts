import { NextResponse } from "next/server"
import { auth } from "@workspace/auth"
import {
  DEMO_USER_EMAIL,
  isDemoEnabled,
} from "@workspace/auth/demo"
import { webAppUrl } from "@workspace/web/lib/env"

export async function GET() {
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
