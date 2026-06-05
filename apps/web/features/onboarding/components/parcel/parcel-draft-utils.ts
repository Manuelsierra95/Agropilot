import type { Parcel } from "@/components/maps/components/types"
import { parseWktPolygon } from "@/lib/cadastre/geometry"
import { CROP_TYPE_LABELS, DEFAULT_CROP_TYPE, type CropTypeValue } from "./parcel-constants"
import type { FieldFormData } from "./parcel-form"

const PARCEL_MAP_COLORS = [
  "#3b6d11",
  "#ca8a04",
  "#2563eb",
  "#c2410c",
  "#7c3aed",
  "#0d9488",
] as const

const ACTIVE_PARCEL_COLOR = "#16a34a"
const INACTIVE_PARCEL_COLOR = "#86efac"

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

export function fieldFormDraftsToMapParcels(
  drafts: FieldFormData[],
  activeParcelId: string | null
): Parcel[] {
  return drafts.flatMap((draft, index) => {
    const coordinates = parsePolygonCoordinates(draft.polygon)
    if (!coordinates?.length) return []

    const isActive = draft.id === activeParcelId
    const cropLabel =
      CROP_TYPE_LABELS[(draft.cropType || DEFAULT_CROP_TYPE) as CropTypeValue] ??
      draft.cropType

    return [
      {
        id: draft.id,
        name: draft.name.trim() || "Parcela sin nombre",
        area: 0,
        type: cropLabel,
        color: isActive
          ? ACTIVE_PARCEL_COLOR
          : (PARCEL_MAP_COLORS[index % PARCEL_MAP_COLORS.length] ??
            INACTIVE_PARCEL_COLOR),
        geometryType: "Polygon" as const,
        geometryCoordinates: coordinates,
      },
    ]
  })
}
