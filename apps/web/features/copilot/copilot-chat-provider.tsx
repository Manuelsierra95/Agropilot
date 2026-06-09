"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

import type {
  ActionLocalState,
  AgroCopilotUIMessage,
  CopilotActionPayload,
  CopilotActionType,
} from "@workspace/copilot"

import { apiBaseUrl } from "@/lib/env"
import { useDashboardState } from "@/features/copilot/dashboard-state"

type CopilotChatContextValue = {
  input: string
  setInput: (value: string) => void
  handleSubmit: () => void
  selectSuggestion: (text: string) => void
  stop: () => void
  isLoading: boolean
  hasMessages: boolean
  messages: AgroCopilotUIMessage[]
  setMessages: ReturnType<typeof useChat<AgroCopilotUIMessage>>["setMessages"]
  actionStates: Record<string, ActionLocalState>
  handleActionDataChange: (
    id: string,
    action: CopilotActionType,
    data: CopilotActionPayload,
    status: ActionLocalState["status"]
  ) => void
  handleActionConfirm: (
    id: string,
    action: CopilotActionType,
    data: CopilotActionPayload
  ) => void
  handleActionCancel: (
    id: string,
    action: CopilotActionType,
    data: CopilotActionPayload
  ) => void
  handleEditSubmit: (correctedText: string) => void
}

const CopilotChatContext = createContext<CopilotChatContextValue | null>(null)

export function CopilotChatProvider({ children }: { children: ReactNode }) {
  const [input, setInput] = useState("")
  const [actionStates, setActionStates] = useState<
    Record<string, ActionLocalState>
  >({})
  const { applyDashboardCells, setDashboardLoading, clearDashboardLoading } =
    useDashboardState()
  const dashboardUpdatePendingRef = useRef(false)

  const { messages, setMessages, sendMessage, status, stop } =
    useChat<AgroCopilotUIMessage>({
      transport: new DefaultChatTransport({
        api: `${apiBaseUrl}/api/v1/copilot/chat`,
        credentials: "include",
      }),
      onData: (dataPart) => {
        if (dataPart.type === "data-dashboard-loading") {
          dashboardUpdatePendingRef.current = true
          setDashboardLoading()
        }
        if (dataPart.type === "data-dashboard-cells") {
          dashboardUpdatePendingRef.current = false
          applyDashboardCells(dataPart.data.cells)
        }
      },
      onFinish: () => {
        if (dashboardUpdatePendingRef.current) {
          dashboardUpdatePendingRef.current = false
          clearDashboardLoading()
        }
      },
      onError: () => {
        if (dashboardUpdatePendingRef.current) {
          dashboardUpdatePendingRef.current = false
          clearDashboardLoading()
        }
      },
    })

  const isLoading = status === "streaming" || status === "submitted"
  const hasMessages = messages.length > 0

  const handleActionDataChange = useCallback(
    (
      id: string,
      action: CopilotActionType,
      data: CopilotActionPayload,
      status: ActionLocalState["status"]
    ) => {
      setActionStates((prev) => ({
        ...prev,
        [id]: { action, data, status },
      }))
    },
    []
  )

  const handleActionConfirm = useCallback(
    (id: string, action: CopilotActionType, data: CopilotActionPayload) => {
      setActionStates((prev) => {
        if (
          prev[id]?.status === "confirmed" ||
          prev[id]?.status === "cancelled"
        ) {
          return prev
        }

        console.log("Se enviaron los datos a la API", { action, data })

        return { ...prev, [id]: { action, data, status: "confirmed" } }
      })
    },
    []
  )

  const handleActionCancel = useCallback(
    (id: string, action: CopilotActionType, data: CopilotActionPayload) => {
      setActionStates((prev) => {
        if (
          prev[id]?.status === "confirmed" ||
          prev[id]?.status === "cancelled"
        ) {
          return prev
        }

        return { ...prev, [id]: { action, data, status: "cancelled" } }
      })
    },
    []
  )

  const handleSubmit = useCallback(() => {
    const text = input.trim()
    if (!text || isLoading) return
    setInput("")
    dashboardUpdatePendingRef.current = false
    void sendMessage({ text })
  }, [input, isLoading, sendMessage])

  const selectSuggestion = useCallback(
    (text: string) => {
      dashboardUpdatePendingRef.current = false
      void sendMessage({ text })
    },
    [sendMessage]
  )

  const handleEditSubmit = useCallback(
    (correctedText: string) => {
      let lastUserIndex = -1
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i]?.role === "user") {
          lastUserIndex = i
          break
        }
      }
      if (lastUserIndex === -1) return

      if (isLoading) stop()
      setActionStates({})
      setMessages(messages.slice(0, lastUserIndex))
      clearDashboardLoading()
      dashboardUpdatePendingRef.current = false
      void sendMessage({ text: correctedText })
    },
    [
      messages,
      isLoading,
      stop,
      setMessages,
      clearDashboardLoading,
      sendMessage,
    ]
  )

  const value = useMemo(
    () => ({
      input,
      setInput,
      handleSubmit,
      selectSuggestion,
      stop,
      isLoading,
      hasMessages,
      messages,
      setMessages,
      actionStates,
      handleActionDataChange,
      handleActionConfirm,
      handleActionCancel,
      handleEditSubmit,
    }),
    [
      input,
      handleSubmit,
      selectSuggestion,
      stop,
      isLoading,
      hasMessages,
      messages,
      setMessages,
      actionStates,
      handleActionDataChange,
      handleActionConfirm,
      handleActionCancel,
      handleEditSubmit,
    ]
  )

  return <CopilotChatContext value={value}>{children}</CopilotChatContext>
}

export function useCopilotChat() {
  const context = useContext(CopilotChatContext)
  if (!context) {
    throw new Error("useCopilotChat must be used within CopilotChatProvider")
  }
  return context
}
