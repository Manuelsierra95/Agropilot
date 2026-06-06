"use client"

import { useCallback, useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@workspace/ui/components/field"
import { Loader2 } from "lucide-react"
interface RefcatSearchProps {
  onSearch: (refcat: string) => void
  isLoading: boolean
  disabled?: boolean
  error?: string | null
}

export function RefcatSearch({
  onSearch,
  isLoading,
  disabled = false,
  error: externalError,
}: RefcatSearchProps) {
  const [refcat, setRefcat] = useState("")
  const [localError, setLocalError] = useState<string | null>(null)

  const error = externalError ?? localError

  const handleSearch = useCallback(() => {
    const value = refcat.trim().toUpperCase()
    if (!value) {
      setLocalError("Introduce una referencia catastral.")
      return
    }
    setLocalError(null)
    onSearch(value)
  }, [onSearch, refcat])

  return (
    <div className="space-y-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="refcat">Referencia catastral</FieldLabel>
          <Input
            id="refcat"
            placeholder="Ej: 0545206VK4704F0001RE"
            value={refcat}
            onChange={(e) => {
              setRefcat(e.target.value.toUpperCase())
              setLocalError(null)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleSearch()
              }
            }}
            disabled={isLoading || disabled}
            className="font-mono uppercase"
          />
          {error ? <FieldError>{error}</FieldError> : null}
        </Field>
      </FieldGroup>

      <Button
        type="button"
        disabled={isLoading || disabled}
        className="w-full bg-primary/10 text-primary hover:bg-primary/20"
        onClick={handleSearch}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Buscando…
          </>
        ) : (
          <>
            <Search className="mr-2 h-4 w-4" />
            Buscar parcela
          </>
        )}
      </Button>
    </div>
  )
}
