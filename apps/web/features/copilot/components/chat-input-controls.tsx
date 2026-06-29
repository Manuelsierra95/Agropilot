"use client"

import { useRef, useState } from "react"
import {
  ArrowUp,
  Image,
  Paperclip,
  Plus,
  Square,
  Telescope,
  Globe,
  XIcon,
} from "lucide-react"

import { Textarea } from "@workspace/ui/components/textarea"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@workspace/ui/components/input-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@workspace/ui/components/attachment"
import { Spinner } from "@workspace/ui/components/spinner"

import { useCopilotChat } from "@workspace/web/features/copilot/copilot-chat-provider"

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const units = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`
}

function getFileIcon(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase()
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext ?? "")) {
    return "image"
  }
  return "file"
}

export function ChatInputControls({
  placeholder = "Pregunta lo que quieras",
}: {
  placeholder?: string
}) {
  const { input, setInput, handleSubmit, stop, isLoading } = useCopilotChat()
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      if (!isLoading && input.trim()) handleSubmit()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    setFiles((prev) => [...prev, ...selectedFiles])
    // TODO: Implementar subida de archivos cuando el endpoint esté disponible
    console.log("Archivos seleccionados:", selectedFiles)
    e.target.value = ""
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSend = () => {
    if (files.length > 0) {
      // TODO: Enviar archivos cuando el endpoint de upload esté disponible
      console.log("Archivos a enviar:", files)
    }
    handleSubmit()
    setFiles([])
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return
        handleSend()
      }}
      className="w-full"
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
        className="hidden"
        onChange={handleFileSelect}
      />

      {files.length > 0 && (
        <div className="flex w-full gap-2 overflow-x-auto px-2 pb-2">
          {files.map((file, i) => {
            const iconType = getFileIcon(file.name)
            return (
              <Attachment
                key={`${file.name}-${i}`}
                size="sm"
                className="w-full"
              >
                <AttachmentMedia
                  variant={iconType === "image" ? "image" : "icon"}
                >
                  <Paperclip className="size-4" />
                </AttachmentMedia>
                <AttachmentContent>
                  <AttachmentTitle>{file.name}</AttachmentTitle>
                  <AttachmentDescription>
                    {formatFileSize(file.size)}
                  </AttachmentDescription>
                </AttachmentContent>
                <AttachmentActions>
                  <AttachmentAction
                    aria-label={`Eliminar ${file.name}`}
                    onClick={() => removeFile(i)}
                  >
                    <XIcon />
                  </AttachmentAction>
                </AttachmentActions>
              </Attachment>
            )
          })}
        </div>
      )}

      <InputGroup>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={2}
          className="min-h-[44px] resize-none border-0 bg-transparent text-sm focus:ring-0 focus-visible:ring-0"
          disabled={isLoading}
        />
        <InputGroupAddon align="block-end" className="pt-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <InputGroupButton
                aria-label="Add files"
                type="button"
                size="icon-sm"
                variant="outline"
              >
                <Plus className="size-4" />
              </InputGroupButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="w-44">
              <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                <Paperclip className="size-4" />
                Adjuntar archivos
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <Image className="size-4" />
                Crear imagen
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Telescope className="size-4" />
                Deep Research
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Globe className="size-4" />
                Web Search
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isLoading ? (
            <InputGroupButton
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={stop}
              aria-label="Detener"
              className="ml-auto"
            >
              <Square className="size-4" />
            </InputGroupButton>
          ) : (
            <InputGroupButton
              type="submit"
              variant="default"
              size="icon-sm"
              disabled={!input.trim()}
              className="ml-auto"
            >
              <ArrowUp className="size-4" />
              <span className="sr-only">Enviar</span>
            </InputGroupButton>
          )}
        </InputGroupAddon>
      </InputGroup>

      {isLoading && (
        <div className="flex justify-center pt-2">
          <Spinner className="size-4 text-muted-foreground" />
        </div>
      )}
    </form>
  )
}
