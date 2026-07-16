import { Suspense } from "react"
import Finance from "@workspace/web/features/finance"

export default function FinancePage() {
  return (
    <Suspense>
      <Finance />
    </Suspense>
  )
}
