import type { Parcel } from "@workspace/web/components/maps/components/types"
import { parseWktPolygon } from "@workspace/web/lib/cadastre/geometry"
import {
  CROP_TYPE_LABELS,
  DEFAULT_CROP_TYPE,
  IRRIGATION_TYPE_LABELS,
  type CropTypeValue,
} from "@workspace/web/features/onboarding/components/parcel/parcel-constants"
import type { FieldFormData } from "@workspace/web/features/onboarding/components/parcel/parcel-form"

const ACTIVE_PARCEL_COLOR = "#16a34a"

export function createParcelDraft(): FieldFormData {
  return {
    id: `parcel-${crypto.randomUUID()}`,
    name: "",
    cropType: DEFAULT_CROP_TYPE,
    irrigationType: undefined,
    polygon: null,
    centroid: null,
  }
}

export function clearParcelDraftData(parcel: FieldFormData): FieldFormData {
  return {
    id: parcel.id,
    serverId: parcel.serverId,
    name: "",
    cropType: DEFAULT_CROP_TYPE,
    irrigationType: undefined,
    areaHa: null,
    polygon: null,
    centroid: null,
    refcat: null,
    address: null,
  }
}

export function parsePolygonCoordinates(
  polygon: string | null | undefined
): number[][][] | null {
  if (!polygon?.trim()) return null

  const trimmed = polygon.trim()
  if (trimmed.toUpperCase().startsWith("POLYGON")) {
    return parseWktPolygon(trimmed)
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown

    if (Array.isArray(parsed)) {
      if (parsed.length === 0) return null
      if (Array.isArray(parsed[0]) && Array.isArray(parsed[0][0])) {
        return parsed as number[][][]
      }
      if (Array.isArray(parsed[0]) && typeof parsed[0][0] === "number") {
        return [parsed as number[][]]
      }
    }

    if (
      parsed &&
      typeof parsed === "object" &&
      "type" in parsed &&
      (parsed as { type: string }).type === "Polygon" &&
      "coordinates" in parsed
    ) {
      return (parsed as { coordinates: number[][][] }).coordinates
    }
  } catch {
    return null
  }

  return null
}

export function fieldFormDraftToMapParcel(
  draft: FieldFormData
): Parcel | undefined {
  const coordinates = parsePolygonCoordinates(draft.polygon)
  if (!coordinates?.length) return undefined

  const cropLabel =
    CROP_TYPE_LABELS[(draft.cropType || DEFAULT_CROP_TYPE) as CropTypeValue] ??
    draft.cropType

  return {
    id: draft.id,
    name: draft.name.trim() || "Parcela sin nombre",
    area: draft.areaHa ?? undefined,
    type: cropLabel,
    irrigationType: draft.irrigationType
      ? IRRIGATION_TYPE_LABELS[draft.irrigationType]
      : undefined,
    color: ACTIVE_PARCEL_COLOR,
    geometryType: "Polygon" as const,
    geometryCoordinates: coordinates,
  }
}
