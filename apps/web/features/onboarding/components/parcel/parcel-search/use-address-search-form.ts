"use client"

import { useCallback, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  searchApi,
  searchQueryKeys,
  searchQueryOptions,
} from "@workspace/web/lib/api/routes/search"
import type { AddressQuery } from "@workspace/web/features/onboarding/components/parcel/parcel-search/types"

type AddressFormData = Partial<AddressQuery>

type AddressFormErrors = Partial<Record<keyof AddressQuery, string>>

const EMPTY_FORM: AddressFormData = {}

export function useAddressSearchForm(isActive: boolean) {
  const [formData, setFormData] = useState<AddressFormData>(EMPTY_FORM)
  const [errors, setErrors] = useState<AddressFormErrors>({})
  const [apiError, setApiError] = useState<string | null>(null)

  const provincesQuery = useQuery({
    queryKey: searchQueryKeys.provinces(),
    queryFn: () => searchApi.getProvinces(),
    enabled: isActive,
    ...searchQueryOptions,
  })

  const provincias = provincesQuery.data ?? []

  const provinceCode = useMemo(
    () =>
      provincias.find((item) => item.Denominacion === formData.provincia)
        ?.Codigo,
    [provincias, formData.provincia]
  )

  const municipalitiesQuery = useQuery({
    queryKey: searchQueryKeys.municipalities(provinceCode ?? 0),
    queryFn: () => searchApi.getMunicipalities(provinceCode!),
    enabled: isActive && provinceCode != null,
    ...searchQueryOptions,
  })

  const municipios = municipalitiesQuery.data ?? []

  const municipalityCode = useMemo(
    () =>
      municipios.find((item) => item.Denominacion === formData.municipio)
        ?.Codigo,
    [municipios, formData.municipio]
  )

  const streetsQuery = useQuery({
    queryKey: searchQueryKeys.streets(provinceCode ?? 0, municipalityCode ?? 0),
    queryFn: () =>
      searchApi.getStreets({
        province: provinceCode!,
        municipality: municipalityCode!,
      }),
    enabled: isActive && provinceCode != null && municipalityCode != null,
    ...searchQueryOptions,
  })

  const streets = streetsQuery.data ?? []

  const tiposVia = useMemo(() => {
    const types = new Set(streets.map((via) => via.TipoVia))
    return [...types].sort()
  }, [streets])

  const viasFiltradas = useMemo(() => {
    if (!formData.tipoVia) return []
    return streets.filter((via) => via.TipoVia === formData.tipoVia)
  }, [streets, formData.tipoVia])

  const queryApiError = useMemo(() => {
    if (provincesQuery.isError) return "No se pudieron cargar las provincias."
    if (municipalitiesQuery.isError)
      return "No se pudieron cargar los municipios."
    if (streetsQuery.isError) return "No se pudieron cargar las vías."
    return null
  }, [
    provincesQuery.isError,
    municipalitiesQuery.isError,
    streetsQuery.isError,
  ])

  const displayApiError = apiError ?? queryApiError

  const loadingProvincias = provincesQuery.isPending
  const loadingMunicipios = municipalitiesQuery.isFetching
  const loadingVias = streetsQuery.isFetching

  const updateField = useCallback(
    <K extends keyof AddressQuery>(field: K, value: AddressQuery[K]) => {
      setFormData((current) => {
        const next = { ...current, [field]: value }

        if (field === "provincia") {
          delete next.municipio
          delete next.tipoVia
          delete next.nombreVia
          delete next.numero
        } else if (field === "municipio") {
          delete next.tipoVia
          delete next.nombreVia
          delete next.numero
        } else if (field === "tipoVia") {
          delete next.nombreVia
          delete next.numero
        } else if (field === "nombreVia") {
          delete next.numero
        }

        return next
      })
      setErrors((current) => {
        const next = { ...current }
        delete next[field]
        return next
      })
      setApiError(null)
    },
    []
  )

  const validateAndGetData = useCallback(():
    | (AddressQuery & { tipoViaSigla: string })
    | null => {
    const nextErrors: AddressFormErrors = {}

    if (!formData.provincia?.trim()) {
      nextErrors.provincia = "Selecciona una provincia."
    }
    if (!formData.municipio?.trim()) {
      nextErrors.municipio = "Selecciona un municipio."
    }
    if (!formData.tipoVia?.trim()) {
      nextErrors.tipoVia = "Selecciona un tipo de vía."
    }
    if (!formData.nombreVia?.trim()) {
      nextErrors.nombreVia = "Selecciona un nombre de vía."
    }
    if (!formData.numero?.trim()) {
      nextErrors.numero = "Introduce el número."
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return null
    }

    const selectedStreet = viasFiltradas.find(
      (via) => String(via.Codigo) === formData.nombreVia
    )

    if (!selectedStreet) {
      setApiError("No se encontró la vía seleccionada.")
      return null
    }

    return {
      provincia: formData.provincia!,
      municipio: formData.municipio!,
      tipoVia: formData.tipoVia!,
      nombreVia: selectedStreet.Denominacion,
      numero: formData.numero!,
      tipoViaSigla: selectedStreet.Sigla,
    }
  }, [formData, viasFiltradas])

  return {
    apiError: displayApiError,
    errors,
    formData,
    loadingMunicipios,
    loadingProvincias,
    loadingVias,
    municipios,
    provincias,
    tiposVia,
    updateField,
    validateAndGetData,
    viasFiltradas,
    setApiError,
  }
}
