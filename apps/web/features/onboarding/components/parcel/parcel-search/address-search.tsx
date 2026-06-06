"use client"

import { Loader2, Search } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@workspace/ui/components/field"
import type { AddressQuery } from "./types"
import { useAddressSearchForm } from "./use-address-search-form"

interface AddressSearchProps {
  isActive?: boolean
  onSearch: (address: AddressQuery & { tipoViaSigla: string }) => void
  isLoading: boolean
  disabled?: boolean
  error?: string | null
}

export function AddressSearch({
  isActive = false,
  onSearch,
  isLoading,
  disabled = false,
  error: externalError,
}: AddressSearchProps) {
  const {
    apiError,
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
  } = useAddressSearchForm(isActive)

  const handleSearch = () => {
    const data = validateAndGetData()
    if (!data) return
    onSearch(data)
  }

  const displayError = externalError ?? apiError

  return (
    <div className="space-y-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="provincia">Provincia</FieldLabel>
          <Select
            value={formData.provincia || ""}
            onValueChange={(value) => updateField("provincia", value)}
            disabled={isLoading || loadingProvincias || disabled}
          >
            <SelectTrigger id="provincia">
              <SelectValue
                placeholder={
                  loadingProvincias
                    ? "Cargando provincias…"
                    : "Selecciona una provincia"
                }
              />
            </SelectTrigger>
            <SelectContent className="p-2">
              {provincias.map((provincia) => (
                <SelectItem
                  key={provincia.Codigo}
                  value={provincia.Denominacion}
                >
                  {provincia.Denominacion}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.provincia ? (
            <FieldError>{errors.provincia}</FieldError>
          ) : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="municipio">Municipio</FieldLabel>
          <Select
            value={formData.municipio || ""}
            onValueChange={(value) => updateField("municipio", value)}
            disabled={
              isLoading || loadingMunicipios || !formData.provincia || disabled
            }
          >
            <SelectTrigger id="municipio">
              <SelectValue
                placeholder={
                  !formData.provincia
                    ? "Selecciona una provincia primero"
                    : loadingMunicipios
                      ? "Cargando municipios…"
                      : "Selecciona un municipio"
                }
              />
            </SelectTrigger>
            <SelectContent className="p-2">
              {municipios.map((municipio) => (
                <SelectItem
                  key={municipio.Codigo}
                  value={municipio.Denominacion}
                >
                  {municipio.Denominacion}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.municipio ? (
            <FieldError>{errors.municipio}</FieldError>
          ) : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="tipoVia">Tipo de vía</FieldLabel>
          <Select
            value={formData.tipoVia || ""}
            onValueChange={(value) => updateField("tipoVia", value)}
            disabled={
              isLoading || loadingVias || !formData.municipio || disabled
            }
          >
            <SelectTrigger id="tipoVia">
              <SelectValue
                placeholder={
                  !formData.municipio
                    ? "Selecciona un municipio primero"
                    : loadingVias
                      ? "Cargando tipos de vía…"
                      : "Selecciona tipo de vía"
                }
              />
            </SelectTrigger>
            <SelectContent className="p-2">
              {tiposVia.map((tipoVia) => (
                <SelectItem key={tipoVia} value={tipoVia}>
                  {tipoVia}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.tipoVia ? <FieldError>{errors.tipoVia}</FieldError> : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="nombreVia">Nombre de vía</FieldLabel>
          <Select
            value={formData.nombreVia || ""}
            onValueChange={(value) => updateField("nombreVia", value)}
            disabled={isLoading || loadingVias || !formData.tipoVia || disabled}
          >
            <SelectTrigger id="nombreVia">
              <SelectValue
                placeholder={
                  !formData.tipoVia
                    ? "Selecciona un tipo de vía primero"
                    : "Selecciona un nombre de vía"
                }
              />
            </SelectTrigger>
            <SelectContent className="p-2">
              {viasFiltradas.map((via) => (
                <SelectItem key={via.Codigo} value={String(via.Codigo)}>
                  {via.Denominacion}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.nombreVia ? (
            <FieldError>{errors.nombreVia}</FieldError>
          ) : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="numero">Número</FieldLabel>
          <Input
            id="numero"
            placeholder="Número"
            value={formData.numero || ""}
            onChange={(e) => updateField("numero", e.target.value)}
            disabled={isLoading || !formData.nombreVia || disabled}
          />
          {errors.numero ? <FieldError>{errors.numero}</FieldError> : null}
        </Field>

        {displayError ? <FieldError>{displayError}</FieldError> : null}
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
