import { Suspense } from "react"
import Tasks from "@workspace/web/features/tasks"

export default function FinancePage() {
  return (
    <Suspense>
      <Tasks />
    </Suspense>
  )
}
