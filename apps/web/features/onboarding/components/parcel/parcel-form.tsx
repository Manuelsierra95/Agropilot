"use client"

import { Input } from "@workspace/ui/components/input"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { CropTypeSelector } from "./crop-type-selector"
import { IrrigationToggle } from "./irrigation-toggle"
import { ParcelSearch } from "./parcel-search/parcel-search"
import type { ParcelAddress } from "@/lib/cadastre/types"
import type { ParcelSearchResult } from "./parcel-search/types"
import type { SearchParcelFn } from "@/lib/cadastre/types"
import type { ParcelCreateInput } from "@workspace/schemas"
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

export function toParcelCreateInput(data: FieldFormData): ParcelCreateInput {
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
    ...(centroid ? { centroid } : {}),
    ...(polygon ? { polygon } : {}),
  }
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
    <>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Crea tu parcela
        </h1>
        <p className="mt-2 text-muted-foreground">
          Empieza agregando la información básica de tu parcela. Siempre puedes
          editar estos detalles más tarde.
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
    </>
  )
}
