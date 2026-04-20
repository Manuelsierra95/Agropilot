"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"
import SearchInput from "@/components/search-input"

export function DockToggle({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {isOpen && (
        <div
          className="modal-open fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {isOpen && children}

      {/* Floating Dock */}
      <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
        <div className="flex items-center gap-1 rounded-full border bg-background px-2 py-1.5 shadow-lg">
          <SearchInput className="border-0" />

          <Separator orientation="vertical" className="m-auto h-5" />

          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-full"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>
    </>
  )
}
