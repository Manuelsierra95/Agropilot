"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react"

import { useDashboardScopeParams } from "@/hooks/use-dashboard-scope-params"
import { buildDashboardScopeKey } from "@/lib/dashboard/scope-key"

const SCOPE_LOADING_KEY = "__loading__"

type DashboardScopeTransitionContextValue = {
  isScopePending: boolean
  navigateScope: (
    expectedKey: string,
    update: () => void | Promise<void>
  ) => void
  updatePendingScopeKey: (expectedKey: string) => void
}

const DashboardScopeTransitionContext =
  createContext<DashboardScopeTransitionContextValue | null>(null)

export function DashboardScopeTransitionProvider({
  children,
}: {
  children: ReactNode
}) {
  const [scopeParams] = useDashboardScopeParams()
  const [pendingScopeKey, setPendingScopeKey] = useState<string | null>(null)
  const [isTransitionPending, startTransition] = useTransition()
  const currentScopeKey = useMemo(
    () => buildDashboardScopeKey(scopeParams),
    [scopeParams]
  )

  const isScopePending =
    pendingScopeKey !== null &&
    (pendingScopeKey === SCOPE_LOADING_KEY ||
      currentScopeKey !== pendingScopeKey ||
      isTransitionPending)

  useEffect(() => {
    if (pendingScopeKey === null || isTransitionPending) {
      return
    }

    if (pendingScopeKey === SCOPE_LOADING_KEY) {
      return
    }

    if (currentScopeKey === pendingScopeKey) {
      setPendingScopeKey(null)
    }
  }, [currentScopeKey, isTransitionPending, pendingScopeKey])

  const updatePendingScopeKey = useCallback((expectedKey: string) => {
    setPendingScopeKey(expectedKey)
  }, [])

  const navigateScope = useCallback(
    (expectedKey: string, update: () => void | Promise<void>) => {
      setPendingScopeKey(expectedKey)
      startTransition(() => {
        void Promise.resolve(update())
      })
    },
    [startTransition]
  )

  return (
    <DashboardScopeTransitionContext
      value={{ isScopePending, navigateScope, updatePendingScopeKey }}
    >
      {children}
    </DashboardScopeTransitionContext>
  )
}

export function useDashboardScopeTransition() {
  const context = useContext(DashboardScopeTransitionContext)
  if (!context) {
    throw new Error(
      "useDashboardScopeTransition must be used within DashboardScopeTransitionProvider"
    )
  }
  return context
}

export { SCOPE_LOADING_KEY }
