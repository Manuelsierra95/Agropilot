"use client"

import { useKBar } from "kbar"
import { IconSearch } from "@tabler/icons-react"
import { Button } from "@workspace/ui/components/button"

export default function SearchInput({ className }: { className?: string }) {
  const { query } = useKBar()
  return (
    <div className="w-full space-y-2">
      <Button
        variant="outline"
        className={`relative h-9 w-full justify-start overflow-hidden rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64 ${className || ""}`}
        onClick={query.toggle}
      >
        <IconSearch className="mr-2 h-4 w-4" />
        <span className="truncate">Buscar, comandos...</span>
        <kbd className="pointer-events-none absolute top-[0.3rem] right-[0.3rem] hidden h-6 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 select-none sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
    </div>
  )
}
