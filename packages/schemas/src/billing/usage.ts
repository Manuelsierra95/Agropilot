import type { AuthSubscription } from "./subscription"
import type { AuthModule } from "./plan"

export type BillingMeResponse = {
  subscription: {
    status: AuthSubscription["status"]
    stripePriceId: string | null
    currentPeriodStart: Date | null
    currentPeriodEnd: Date | null
    cancelAtPeriodEnd: boolean
    trialEndsAt: Date | null
  } | null
  limits: {
    maxParcels: number
    maxMembers: number
    maxStorageMb: number
    usedParcels: number
    usedMembers: number
    usedStorageMb: number
  }
  modules: BillingModuleItem[]
}

export type BillingModuleItem = {
  id: string
  slug: AuthModule["slug"]
  name: string
  description: string | null
  status: AuthModule["status"]
  active: boolean
}
