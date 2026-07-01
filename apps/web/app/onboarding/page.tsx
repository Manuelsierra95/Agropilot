import type { Metadata } from "next"
import { redirect } from "next/navigation"
import ParcelOnboarding from "@workspace/web/features/onboarding"
import { userApi } from "@workspace/web/lib/api/routes/user"

export const metadata: Metadata = {
  title: "Onboarding | Agropilot",
  description: "Onboarding flow for new Agropilot users.",
}

const TOTAL_STEPS = 4

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>
}) {
  const params = await searchParams
  const user = await userApi.getMe()

  if (user.onboardingStatus === "completed") {
    redirect("/dashboard")
  }

  const dbStep = user.onboardingStep ?? 1
  const urlStep = Number(params.step)
  const hasValidUrlStep =
    !Number.isNaN(urlStep) && urlStep >= 1 && urlStep <= TOTAL_STEPS

  const initialStep = hasValidUrlStep ? urlStep : dbStep

  return <ParcelOnboarding initialStep={initialStep} />
}
