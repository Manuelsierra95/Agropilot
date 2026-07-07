"use client"

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
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { CropTypeSelector } from "@workspace/web/features/onboarding/components/parcel/crop-type-selector"
import { ParcelSearch } from "@workspace/web/features/onboarding/components/parcel/parcel-search/parcel-search"
import type { ParcelSearchResult } from "@workspace/web/features/onboarding/components/parcel/parcel-search/types"
import type { SearchParcelFn } from "@workspace/web/lib/cadastre/types"
import type { ParcelCropData } from "@workspace/schemas"
import {
  hasParcelGeometry,
  type FieldFormData,
  type ParcelFormErrors,
} from "@workspace/web/features/onboarding/components/parcel/parcel-form"
import {
  DEFAULT_CROP_TYPE,
  type IrrigationType,
} from "@workspace/web/features/onboarding/components/parcel/parcel-constants"

interface ParcelDashboardFormProps {
  value: FieldFormData
  onChange: (data: FieldFormData) => void
  errors?: ParcelFormErrors
  onGeometryFound: (result: ParcelSearchResult) => void
  searchParcel?: SearchParcelFn
  searchDisabled?: boolean
}

export function ParcelDashboardForm({
  value,
  onChange,
  errors = {},
  onGeometryFound,
  searchParcel,
  searchDisabled = false,
}: ParcelDashboardFormProps) {
  const { name, cropType } = value
  const located = hasParcelGeometry(value)

  return (
    <ScrollArea className="h-full min-h-0 w-full">
      <div className="pr-3 pb-4">
        <FieldGroup>
          <Field data-invalid={Boolean(errors.name) || undefined}>
            <FieldLabel htmlFor="dashboard-parcel-name">
              Nombre de la parcela
              <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="dashboard-parcel-name"
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

          <Field>
            <FieldLabel htmlFor="dashboard-parcel-irrigation">
              Tipo de riego
            </FieldLabel>
            <Select
              value={value.irrigationType ?? ""}
              onValueChange={(next) =>
                onChange({
                  ...value,
                  irrigationType: next ? (next as IrrigationType) : undefined,
                })
              }
            >
              <SelectTrigger id="dashboard-parcel-irrigation">
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dryland">Secano</SelectItem>
                <SelectItem value="irrigated">Regadío</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor="dashboard-parcel-area">
              Superficie (m²)
            </FieldLabel>
            <Input
              id="dashboard-parcel-area"
              type="number"
              placeholder="Ej: 50000"
              value={value.areaM2 ?? ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  areaM2: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="dashboard-parcel-variety">Variedad</FieldLabel>
            <Input
              id="dashboard-parcel-variety"
              placeholder="Ej: Picual"
              value={value.variety ?? ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  variety: e.target.value || null,
                })
              }
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="dashboard-parcel-soil">Tipo de suelo</FieldLabel>
            <Input
              id="dashboard-parcel-soil"
              placeholder="Ej: Arcilloso"
              value={value.soilType ?? ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  soilType: e.target.value || null,
                })
              }
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="dashboard-parcel-planting-date">
              Fecha de plantación
            </FieldLabel>
            <Input
              id="dashboard-parcel-planting-date"
              type="date"
              value={
                value.plantingDate
                  ? new Date(value.plantingDate).toISOString().slice(0, 10)
                  : ""
              }
              onChange={(e) =>
                onChange({
                  ...value,
                  plantingDate: e.target.value
                    ? new Date(e.target.value).toISOString()
                    : null,
                })
              }
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="dashboard-parcel-plant-count">
              Número de plantas
            </FieldLabel>
            <Input
              id="dashboard-parcel-plant-count"
              type="number"
              placeholder="Ej: 500"
              value={value.plantCount ?? ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  plantCount: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
          </Field>

          {cropType === "olive" ? (
            <Field>
              <FieldLabel htmlFor="dashboard-parcel-olive-crop-type">
                Tipo de cultivo de olivo
              </FieldLabel>
              <Select
                value={value.data?.oliveCropType ?? ""}
                onValueChange={(next) =>
                  onChange({
                    ...value,
                    data: next
                      ? {
                          oliveCropType: next as NonNullable<
                            ParcelCropData["oliveCropType"]
                          >,
                        }
                      : null,
                  })
                }
              >
                <SelectTrigger id="dashboard-parcel-olive-crop-type">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intensive">Intensivo</SelectItem>
                  <SelectItem value="superintensive">Superintensivo</SelectItem>
                  <SelectItem value="traditional">Tradicional</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          ) : null}
        </FieldGroup>
      </div>
    </ScrollArea>
  )
}
