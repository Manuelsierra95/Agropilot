export type IrrigationType = "dryland" | "irrigated"

export const DEFAULT_CROP_TYPE = "olive" as const

export type CropTypeValue =
  | typeof DEFAULT_CROP_TYPE
  | "wheat"
  | "corn"
  | "sunflower"
  | "barley"
  | "soybean"
  | "cotton"
  | "rice"
  | "other"

export const CROP_OPTIONS: {
  value: CropTypeValue
  label: string
  enabled: boolean
}[] = [
  { value: "olive", label: "Olivar", enabled: true },
  { value: "wheat", label: "Trigo", enabled: false },
  { value: "corn", label: "Maíz", enabled: false },
  { value: "sunflower", label: "Girasol", enabled: false },
  { value: "barley", label: "Cebada", enabled: false },
  { value: "soybean", label: "Soja", enabled: false },
  { value: "cotton", label: "Algodón", enabled: false },
  { value: "rice", label: "Arroz", enabled: false },
  { value: "other", label: "Otro", enabled: false },
]

export const CROP_TYPE_LABELS: Record<CropTypeValue, string> = {
  olive: "Olivar",
  wheat: "Trigo",
  corn: "Maíz",
  sunflower: "Girasol",
  barley: "Cebada",
  soybean: "Soja",
  cotton: "Algodón",
  rice: "Arroz",
  other: "Otro",
}

export const IRRIGATION_TYPE_LABELS: Record<IrrigationType, string> = {
  dryland: "Secano",
  irrigated: "Regadío",
}
