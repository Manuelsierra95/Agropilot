"use client"

import { Input } from "@workspace/ui/components/input"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { CropTypeSelector } from "./crop-type-selector"
import { IrrigationToggle } from "./irrigation-toggle"
import { ParcelSearch } from "./parcel-search/parcel-search"
import type { ParcelAddress } from "@/lib/cadastre/types"
import type { ParcelSearchResult } from "./parcel-search/types"
import type { SearchParcelFn } from "@/lib/cadastre/types"
import type { ParcelCreateInput, ParcelUpdateInput } from "@workspace/schemas"
import { hectaresToSquareMeters } from "@/lib/area"
import { parsePolygonCoordinates } from "./parcel-draft-utils"
import {
  draftCentroidFromCoordinates,
  toWktPolygon,
} from "@/lib/cadastre/geometry"
import { DEFAULT_CROP_TYPE, type IrrigationType } from "./parcel-constants"

export interface FieldFormData {
  id: string
  serverId?: string | null
  name: string
  cropType: string
  irrigationType?: IrrigationType
  areaHa?: number | null
  polygon?: string | null
  centroid?: string | null
  refcat?: string | null
  address?: ParcelAddress | null
}

export type ParcelFormErrors = {
  name?: string
  irrigationType?: string
  geometry?: string
}

export type ParcelSaveStatus = "idle" | "saving" | "saved" | "error"

export function hasParcelGeometry(data: FieldFormData): boolean {
  const coordinates = parsePolygonCoordinates(data.polygon)
  return Boolean(coordinates?.length && data.centroid?.trim())
}

export const PARCEL_ONBOARDING_FORM_ID = "parcel-onboarding-form"

export const DUPLICATE_PARCEL_NAME_ERROR =
  "Ya existe otra parcela con este nombre."

function normalizeParcelName(name: string) {
  return name.trim().toLowerCase()
}

export function applyDuplicateNameErrors(
  drafts: FieldFormData[],
  errorsByParcelId: Record<string, ParcelFormErrors>
): Record<string, ParcelFormErrors> {
  const next: Record<string, ParcelFormErrors> = {}

  for (const [id, errors] of Object.entries(errorsByParcelId)) {
    if (errors.name === DUPLICATE_PARCEL_NAME_ERROR) {
      const { name: _name, ...rest } = errors
      if (Object.keys(rest).length > 0) next[id] = rest
    } else {
      next[id] = errors
    }
  }

  const nameGroups = new Map<string, string[]>()

  for (const draft of drafts) {
    const key = normalizeParcelName(draft.name)
    if (!key) continue
    nameGroups.set(key, [...(nameGroups.get(key) ?? []), draft.id])
  }

  for (const ids of nameGroups.values()) {
    if (ids.length < 2) continue
    for (const id of ids) {
      next[id] = {
        ...(next[id] ?? {}),
        name: DUPLICATE_PARCEL_NAME_ERROR,
      }
    }
  }

  return next
}

export type ParcelDraftsValidationResult = {
  errorsByParcelId: Record<string, ParcelFormErrors>
  invalidParcelIds: string[]
  firstInvalidParcelId: string | null
}

export function validateAllParcelDrafts(
  drafts: FieldFormData[]
): ParcelDraftsValidationResult {
  const errorsByParcelId: Record<string, ParcelFormErrors> = {}

  for (const draft of drafts) {
    const errors = validateParcelForm(draft)
    if (Object.keys(errors).length > 0) {
      errorsByParcelId[draft.id] = errors
    }
  }

  const withDuplicates = applyDuplicateNameErrors(drafts, errorsByParcelId)
  const invalidParcelIds = Object.keys(withDuplicates)
  const firstInvalidParcelId =
    drafts.find((draft) => withDuplicates[draft.id])?.id ?? null

  return {
    errorsByParcelId: withDuplicates,
    invalidParcelIds,
    firstInvalidParcelId,
  }
}

export function validateParcelForm(data: FieldFormData): ParcelFormErrors {
  const errors: ParcelFormErrors = {}

  if (!data.name.trim()) {
    errors.name = "Introduce un nombre para la parcela."
  }

  if (!data.irrigationType) {
    errors.irrigationType = "Selecciona un régimen hídrico."
  }

  if (!hasParcelGeometry(data)) {
    errors.geometry = "Localiza la parcela con el buscador antes de continuar."
  }

  return errors
}

function toParcelLocationFields(data: FieldFormData) {
  const address = data.address

  return {
    refcat: data.refcat ?? null,
    province: address?.province ?? null,
    municipality: address?.municipality ?? null,
    streetType: address?.streetType ?? null,
    streetName: address?.streetName ?? null,
    streetNumber: address?.streetNumber ?? null,
    postalCode: address?.postalCode ?? null,
  }
}

function toParcelCoreFields(data: FieldFormData) {
  const coordinates = parsePolygonCoordinates(data.polygon)
  const polygon =
    coordinates && coordinates.length > 0
      ? toWktPolygon(coordinates)
      : undefined
  const centroid =
    data.centroid?.trim() ||
    (coordinates ? draftCentroidFromCoordinates(coordinates) : undefined)

  return {
    name: data.name.trim(),
    cropType: data.cropType || DEFAULT_CROP_TYPE,
    irrigationType: data.irrigationType,
    ...(data.areaHa != null
      ? { areaHa: data.areaHa, areaM2: hectaresToSquareMeters(data.areaHa) }
      : {}),
    ...(centroid ? { centroid } : {}),
    ...(polygon ? { polygon } : {}),
  }
}

export function toParcelCreateInput(data: FieldFormData): ParcelCreateInput {
  return {
    ...toParcelCoreFields(data),
    ...toParcelLocationFields(data),
  }
}

export function toParcelUpdateInput(data: FieldFormData): ParcelUpdateInput {
  return {
    ...toParcelCoreFields(data),
    ...toParcelLocationFields(data),
  }
}

export function hasUnsavedParcelData(data: FieldFormData): boolean {
  if (data.serverId) return false

  return Boolean(
    data.name.trim() || data.irrigationType || hasParcelGeometry(data)
  )
}

interface ParcelFormProps {
  value: FieldFormData
  onChange: (data: FieldFormData) => void
  errors?: ParcelFormErrors
  onGeometryFound: (result: ParcelSearchResult) => void
  searchParcel?: SearchParcelFn
  searchDisabled?: boolean
}

export function ParcelForm({
  value,
  onChange,
  errors = {},
  onGeometryFound,
  searchParcel,
  searchDisabled = false,
}: ParcelFormProps) {
  const { name, cropType, irrigationType } = value
  const located = hasParcelGeometry(value)

  return (
    <ScrollArea className="h-full min-h-0 w-full flex-1">
      <div className="pb-4 pr-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Crea tu parcela
          </h1>
          <p className="mt-2 text-muted-foreground">
            Empieza agregando la información básica de tu parcela. Siempre
            puedes editar estos detalles más tarde.
          </p>
        </div>

        <FieldGroup className="mt-2">
          <Field data-invalid={Boolean(errors.name) || undefined}>
            <FieldLabel htmlFor="parcel-name">
              Nombre de la parcela
              <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="parcel-name"
              name="name"
              placeholder="Parcela olivos"
              value={name}
              aria-invalid={Boolean(errors.name) || undefined}
              onChange={(e) => onChange({ ...value, name: e.target.value })}
            />
            {errors.name ? (
              <FieldDescription className="text-destructive">
                {errors.name}
              </FieldDescription>
            ) : null}
          </Field>

          <ParcelSearch
            hasGeometry={located}
            geometryError={errors.geometry}
            disabled={searchDisabled}
            searchParcel={searchParcel}
            onFound={onGeometryFound}
          />

          <Field>
            <FieldLabel htmlFor="parcel-area-ha">Superficie (ha)</FieldLabel>
            <Input
              id="parcel-area-ha"
              name="areaHa"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.0001"
              placeholder="Ej: 2,45"
              value={value.areaHa ?? ""}
              onChange={(e) => {
                const raw = e.target.value.trim()
                onChange({
                  ...value,
                  areaHa: raw === "" ? null : Number(raw),
                })
              }}
            />
            <FieldDescription>
              Opcional. Introduce las hectáreas de la parcela.
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel>Tipo de cultivo</FieldLabel>
            <CropTypeSelector
              value={cropType || DEFAULT_CROP_TYPE}
              onChange={(nextCropType) =>
                onChange({ ...value, cropType: nextCropType })
              }
            />
          </Field>

          <Field data-invalid={Boolean(errors.irrigationType) || undefined}>
            <FieldLabel htmlFor="parcel-irrigation">
              Régimen hídrico
              <span className="text-destructive">*</span>
            </FieldLabel>
            <IrrigationToggle
              value={irrigationType}
              invalid={Boolean(errors.irrigationType)}
              onChange={(nextIrrigation) =>
                onChange({ ...value, irrigationType: nextIrrigation })
              }
            />
            {errors.irrigationType ? (
              <FieldDescription className="text-destructive">
                {errors.irrigationType}
              </FieldDescription>
            ) : null}
          </Field>
        </FieldGroup>
      </div>
    </ScrollArea>
  )
}
