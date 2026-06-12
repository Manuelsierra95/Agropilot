"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { useDashboardScopeParams } from "@/hooks/use-dashboard-scope-params"
import { apiBaseUrl } from "@/lib/env"

type CopilotChatContextValue = {
  input: string
  setInput: (value: string) => void
  handleSubmit: () => void
  selectSuggestion: (text: string) => void
  sendMessage: (text: string) => void
  stop: () => void
  isLoading: boolean
  hasMessages: boolean
  messages: UIMessage[]
  setMessages: ReturnType<typeof useChat<UIMessage>>["setMessages"]
  handleEditSubmit: (correctedText: string) => void
}

const CopilotChatContext = createContext<CopilotChatContextValue | null>(null)

export function CopilotChatProvider({ children }: { children: ReactNode }) {
  const [input, setInput] = useState("")
  const [{ parcelId }] = useDashboardScopeParams()

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `${apiBaseUrl}/api/v1/copilot/chat`,
        credentials: "include",
        body: () => ({
          parcelId: parcelId ?? undefined,
        }),
      }),
    [parcelId]
  )

  const { messages, setMessages, sendMessage, status, stop } = useChat<UIMessage>(
    {
      transport,
    }
  )

  const isLoading = status === "streaming" || status === "submitted"
  const hasMessages = messages.length > 0

  const submitText = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isLoading) return
      void sendMessage({ text: trimmed })
    },
    [isLoading, sendMessage]
  )

  const handleSubmit = useCallback(() => {
    const text = input.trim()
    if (!text || isLoading) return
    setInput("")
    void sendMessage({ text })
  }, [input, isLoading, sendMessage])

  const selectSuggestion = useCallback(
    (text: string) => {
      submitText(text)
    },
    [submitText]
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
      setMessages(messages.slice(0, lastUserIndex))
      void sendMessage({ text: correctedText })
    },
    [messages, isLoading, stop, setMessages, sendMessage]
  )

  const value = useMemo(
    () => ({
      input,
      setInput,
      handleSubmit,
      selectSuggestion,
      sendMessage: submitText,
      stop,
      isLoading,
      hasMessages,
      messages,
      setMessages,
      handleEditSubmit,
    }),
    [
      input,
      handleSubmit,
      selectSuggestion,
      submitText,
      stop,
      isLoading,
      hasMessages,
      messages,
      setMessages,
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
