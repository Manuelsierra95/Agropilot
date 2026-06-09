"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react"

import {
  createEmptyDashboardCells,
  DASHBOARD_SLOT_IDS,
  type DashboardCellsPayload,
} from "@workspace/copilot"

export type DashboardAction =
  | { type: "presentation.applyCells"; cells: DashboardCellsPayload }
  | { type: "presentation.setLoading" }
  | { type: "presentation.clearLoading" }
  | { type: "presentation.setError" }

export type DashboardState = {
  presentation: {
    cells: DashboardCellsPayload
    status: "idle" | "loading" | "ready" | "error"
  }
}

const initialState: DashboardState = {
  presentation: {
    cells: createEmptyDashboardCells(),
    status: "idle",
  },
}

function hasPopulatedCells(cells: DashboardCellsPayload): boolean {
  return DASHBOARD_SLOT_IDS.some((slot) => cells[slot].kind !== "empty")
}

function dashboardReducer(
  state: DashboardState,
  action: DashboardAction
): DashboardState {
  switch (action.type) {
    case "presentation.applyCells":
      return {
        presentation: {
          cells: action.cells,
          status: "ready",
        },
      }
    case "presentation.setLoading":
      return {
        presentation: {
          ...state.presentation,
          status: "loading",
        },
      }
    case "presentation.clearLoading":
      return {
        presentation: {
          ...state.presentation,
          status: hasPopulatedCells(state.presentation.cells)
            ? "ready"
            : "idle",
        },
      }
    case "presentation.setError":
      return {
        presentation: {
          ...state.presentation,
          status: "error",
        },
      }
    default:
      return state
  }
}

type DashboardContextValue = {
  state: DashboardState
  applyDashboardCells: (cells: DashboardCellsPayload) => void
  setDashboardLoading: () => void
  clearDashboardLoading: () => void
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState)

  const applyDashboardCells = useCallback((cells: DashboardCellsPayload) => {
    dispatch({ type: "presentation.applyCells", cells })
  }, [])

  const setDashboardLoading = useCallback(() => {
    dispatch({ type: "presentation.setLoading" })
  }, [])

  const clearDashboardLoading = useCallback(() => {
    dispatch({ type: "presentation.clearLoading" })
  }, [])

  const value = useMemo(
    () => ({
      state,
      applyDashboardCells,
      setDashboardLoading,
      clearDashboardLoading,
    }),
    [state, applyDashboardCells, setDashboardLoading, clearDashboardLoading]
  )

  return <DashboardContext value={value}>{children}</DashboardContext>
}

export function useDashboardState() {
  const ctx = useContext(DashboardContext)
  if (!ctx) {
    throw new Error("useDashboardState must be used within DashboardProvider")
  }
  return ctx
}
