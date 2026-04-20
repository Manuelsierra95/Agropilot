import type { Metadata } from "next"
import ParcelOnboarding from "@/features/onboarding"

export const metadata: Metadata = {
  title: "Onboarding | Agropilot",
  description: "Onboarding flow for new Agropilot users.",
}

export default function Page() {
  return <ParcelOnboarding />
}
