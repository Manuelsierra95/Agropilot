"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Badge } from "@workspace/ui/components/badge"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { searchParcel } from "@workspace/web/lib/cadastre/search-parcel"
import {
  searchApi,
  searchQueryKeys,
  searchQueryOptions,
} from "@workspace/web/lib/api/routes/search"
import type { ParcelSearchResult, SearchParcelFn } from "@workspace/web/features/onboarding/components/parcel/parcel-search/types"
import { useParcelSearch } from "@workspace/web/features/onboarding/components/parcel/parcel-search/use-parcel-search"
import { CoordinatesSearch } from "@workspace/web/features/onboarding/components/parcel/parcel-search/coordinates-search"
import { RefcatSearch } from "@workspace/web/features/onboarding/components/parcel/parcel-search/refcat-search"
import { AddressSearch } from "@workspace/web/features/onboarding/components/parcel/parcel-search/address-search"

interface ParcelSearchProps {
  onFound: (result: ParcelSearchResult) => void
  searchParcel?: SearchParcelFn
  disabled?: boolean
  hasGeometry?: boolean
  geometryError?: string
}

export function ParcelSearch({
  onFound,
  searchParcel: searchParcelProp = searchParcel,
  disabled = false,
  hasGeometry = false,
  geometryError,
}: ParcelSearchProps) {
  const { isLoading, error, search, clearError } =
    useParcelSearch(searchParcelProp)
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<"coords" | "refcat" | "address">(
    "coords"
  )

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
        value={activeTab}
        className="w-full"
        onValueChange={(value) => {
          clearError()
          if (value === "address") {
            void queryClient.prefetchQuery({
              queryKey: searchQueryKeys.provinces(),
              queryFn: () => searchApi.getProvinces(),
              ...searchQueryOptions,
            })
          }
          setActiveTab(value as "coords" | "refcat" | "address")
        }}
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
            isActive={activeTab === "address"}
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
