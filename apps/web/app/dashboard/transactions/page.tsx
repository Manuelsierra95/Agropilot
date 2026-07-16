import { Suspense } from "react"
import Transactions from "@workspace/web/features/transactions"

export default function TransactionsPage() {
  return (
    <Suspense>
      <Transactions />
    </Suspense>
  )
}
