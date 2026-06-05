"use client"

import { useCallback, useMemo, useState } from "react"
import {
  MOCK_CATASTRO_MUNICIPALITIES,
  MOCK_CATASTRO_PROVINCES,
  MOCK_CATASTRO_STREETS,
} from "@/features/onboarding/mocks/onboarding-mocks"
import type { AddressQuery } from "./types"

type AddressFormData = Partial<AddressQuery>

type AddressFormErrors = Partial<Record<keyof AddressQuery, string>>

const EMPTY_FORM: AddressFormData = {}

export function useAddressSearchForm() {
  const [formData, setFormData] = useState<AddressFormData>(EMPTY_FORM)
  const [errors, setErrors] = useState<AddressFormErrors>({})
  const [apiError, setApiError] = useState<string | null>(null)

  const provincias = MOCK_CATASTRO_PROVINCES

  const municipios = useMemo(() => {
    if (!formData.provincia) return []
    return MOCK_CATASTRO_MUNICIPALITIES[formData.provincia] ?? []
  }, [formData.provincia])

  const streetsForMunicipality = useMemo(() => {
    if (!formData.provincia || !formData.municipio) return []
    const key = `${formData.provincia}-${formData.municipio}`
    return MOCK_CATASTRO_STREETS[key] ?? []
  }, [formData.provincia, formData.municipio])

  const tiposVia = useMemo(() => {
    const types = new Set(streetsForMunicipality.map((via) => via.TipoVia))
    return [...types].sort()
  }, [streetsForMunicipality])

  const viasFiltradas = useMemo(() => {
    if (!formData.tipoVia) return []
    return streetsForMunicipality.filter((via) => via.TipoVia === formData.tipoVia)
  }, [streetsForMunicipality, formData.tipoVia])

  const prefetchProvincias = useCallback(() => {
    // Provincias are static mocks; no async prefetch needed.
  }, [])

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
      (via) => via.Denominacion === formData.nombreVia
    )

    if (!selectedStreet) {
      setApiError("No se encontró la vía seleccionada.")
      return null
    }

    return {
      provincia: formData.provincia!,
      municipio: formData.municipio!,
      tipoVia: formData.tipoVia!,
      nombreVia: formData.nombreVia!,
      numero: formData.numero!,
      tipoViaSigla: selectedStreet.Sigla,
    }
  }, [formData, viasFiltradas])

  return {
    apiError,
    errors,
    formData,
    loadingMunicipios: false,
    loadingProvincias: false,
    loadingVias: false,
    municipios,
    prefetchProvincias,
    provincias,
    tiposVia,
    updateField,
    validateAndGetData,
    viasFiltradas,
    setApiError,
  }
}
