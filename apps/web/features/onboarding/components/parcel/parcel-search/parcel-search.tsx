"use client"

import { Badge } from "@workspace/ui/components/badge"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { mockSearchParcel } from "@/lib/cadastre/search-parcel"
import type { ParcelSearchResult, SearchParcelFn } from "./types"
import { useParcelSearch } from "./use-parcel-search"
import { CoordinatesSearch } from "./coordinates-search"
import { RefcatSearch } from "./refcat-search"
import { AddressSearch } from "./address-search"

interface ParcelSearchProps {
  onFound: (result: ParcelSearchResult) => void
  searchParcel?: SearchParcelFn
  disabled?: boolean
  hasGeometry?: boolean
  geometryError?: string
}

export function ParcelSearch({
  onFound,
  searchParcel = mockSearchParcel,
  disabled = false,
  hasGeometry = false,
  geometryError,
}: ParcelSearchProps) {
  const { isLoading, error, search, clearError } = useParcelSearch(searchParcel)

  const handleFound = async (
    input: Parameters<SearchParcelFn>[0]
  ) => {
    const result = await search(input)
    if (result) {
      onFound(result)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-medium text-foreground">
            Ubicación de la parcela
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Localiza el polígono con coordenadas, referencia catastral o
            dirección.
          </p>
        </div>
        {hasGeometry ? (
          <Badge variant="secondary" className="shrink-0">
            Parcela localizada
          </Badge>
        ) : null}
      </div>

      {geometryError ? (
        <p className="text-sm text-destructive">{geometryError}</p>
      ) : null}

      <Tabs
        defaultValue="coords"
        className="w-full"
        onValueChange={() => clearError()}
      >
        <TabsList className="w-full">
          <TabsTrigger value="coords" className="flex-1">
            Coordenadas
          </TabsTrigger>
          <TabsTrigger value="refcat" className="flex-1">
            Ref. catastral
          </TabsTrigger>
          <TabsTrigger value="address" className="flex-1">
            Dirección
          </TabsTrigger>
        </TabsList>

        <TabsContent value="coords" className="mt-4">
          <CoordinatesSearch
            isLoading={isLoading}
            disabled={disabled}
            onSearch={(lat, lng) => {
              void handleFound({ type: "coords", lat, lng })
            }}
          />
        </TabsContent>

        <TabsContent value="refcat" className="mt-4">
          <RefcatSearch
            isLoading={isLoading}
            disabled={disabled}
            error={error}
            onSearch={(refcat) => {
              void handleFound({ type: "refcat", refcat })
            }}
          />
        </TabsContent>

        <TabsContent value="address" className="mt-4">
          <AddressSearch
            isLoading={isLoading}
            disabled={disabled}
            error={error}
            onSearch={(address) => {
              void handleFound({ type: "address", ...address })
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
