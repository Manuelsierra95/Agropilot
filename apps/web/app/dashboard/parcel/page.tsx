import { Suspense } from "react"
import Parcel from "@workspace/web/features/parcel"

export default function ParcelPage() {
  return (
    <Suspense>
      <Parcel />
    </Suspense>
  )
}
