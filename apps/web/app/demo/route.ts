import { NextRequest, NextResponse } from "next/server"
import { auth } from "@workspace/auth"
import {
  DEMO_USER_EMAIL,
  isDemoEnabled,
} from "@workspace/auth/demo"

export async function GET(request: NextRequest) {
  if (!isDemoEnabled()) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  const password = process.env.DEMO_USER_PASSWORD
  if (!password) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  const signInResponse = await auth.api.signInEmail({
    body: {
      email: DEMO_USER_EMAIL,
      password,
    },
    asResponse: true,
  })

  if (!signInResponse.ok) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  const redirect = NextResponse.redirect(new URL("/dashboard", request.url))

  for (const cookie of signInResponse.headers.getSetCookie()) {
    redirect.headers.append("Set-Cookie", cookie)
  }

  return redirect
}
