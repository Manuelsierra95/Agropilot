"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Loader2, MapPin, Search } from "lucide-react"

import { zoomForPlaceType } from "@/lib/geocoding/search-places"
import type { PlaceSuggestion } from "@/lib/geocoding/types"
import { useMap } from "@workspace/ui/components/map"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import { cn } from "@workspace/ui/lib/utils"

import { usePlaceSearch } from "./use-place-search"

export function MapPlaceSearch() {
  const { map, isLoaded } = useMap()
  const {
    query,
    setQuery,
    suggestions,
    isSearching,
    error,
    isOpen,
    setIsOpen,
    clear,
    applySelection,
  } = usePlaceSearch()

  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const flyToPlace = useCallback(
    (place: PlaceSuggestion) => {
      if (!map || !isLoaded) return

      map.flyTo({
        center: [place.lng, place.lat],
        zoom: zoomForPlaceType(place.type),
        duration: 1200,
      })

      applySelection(place.label)
      setActiveIndex(-1)
      inputRef.current?.blur()
    },
    [map, isLoaded, applySelection]
  )

  const handleSelect = useCallback(
    (place: PlaceSuggestion) => {
      flyToPlace(place)
    },
    [flyToPlace]
  )

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (event.key === "Escape") {
        setIsOpen(false)
        inputRef.current?.blur()
      }
      return
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault()
        setActiveIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case "ArrowUp":
        event.preventDefault()
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case "Enter":
        event.preventDefault()
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          handleSelect(suggestions[activeIndex])
        }
        break
      case "Escape":
        event.preventDefault()
        setIsOpen(false)
        setActiveIndex(-1)
        break
    }
  }

  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return
    const item = listRef.current.children[activeIndex] as HTMLElement | undefined
    item?.scrollIntoView({ block: "nearest" })
  }, [activeIndex])

  const showSuggestions =
    isOpen && (suggestions.length > 0 || isSearching || Boolean(error))

  return (
    <div className="pointer-events-none absolute top-3 left-3 right-3 z-10 mx-auto max-w-md">
      <div className="pointer-events-auto space-y-1">
        <InputGroup className="h-10 bg-card/95 shadow-md backdrop-blur-sm">
          <InputGroupAddon align="inline-start">
            {isSearching ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Search className="size-4" />
            )}
          </InputGroupAddon>
          <InputGroupInput
            ref={inputRef}
            type="search"
            role="combobox"
            aria-expanded={showSuggestions}
            aria-autocomplete="list"
            aria-controls="map-place-suggestions"
            placeholder="Buscar ciudad, municipio…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActiveIndex(-1)
              if (e.target.value.trim().length >= 2) {
                setIsOpen(true)
              }
            }}
            onFocus={() => {
              if (query.trim().length >= 2 && suggestions.length > 0) {
                setIsOpen(true)
              }
            }}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              window.setTimeout(() => setIsOpen(false), 150)
            }}
          />
          {query ? (
            <InputGroupAddon align="inline-end">
              <button
                type="button"
                className="px-2 text-xs text-muted-foreground hover:text-foreground"
                onMouseDown={(e) => e.preventDefault()}
                onClick={clear}
              >
                Borrar
              </button>
            </InputGroupAddon>
          ) : null}
        </InputGroup>

        {showSuggestions ? (
          <ul
            id="map-place-suggestions"
            ref={listRef}
            role="listbox"
            className="max-h-56 overflow-y-auto rounded-lg border bg-card/95 py-1 shadow-md backdrop-blur-sm"
          >
            {error ? (
              <li className="px-3 py-2 text-sm text-destructive">{error}</li>
            ) : null}

            {!error && isSearching && suggestions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">
                Buscando…
              </li>
            ) : null}

            {!error && !isSearching && suggestions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">
                No se encontraron resultados
              </li>
            ) : null}

            {suggestions.map((place, index) => (
              <li key={place.id} role="option" aria-selected={index === activeIndex}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-accent",
                    index === activeIndex && "bg-accent"
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(place)}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span className="text-pretty">{place.label}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <p className="px-1 text-[10px] text-muted-foreground/80">
          Lugares &copy;{" "}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            OpenStreetMap
          </a>
        </p>
      </div>
    </div>
  )
}
