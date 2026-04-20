import { Droplets, Sun, type LucideIcon } from "lucide-react"

export const cropTypes = [
  "Trigo",
  "Cebada",
  "Maíz",
  "Girasol",
  "Olivo",
  "Viña",
  "Almendro",
  "Patata",
  "Remolacha",
  "Colza",
  "Avena",
  "Centeno",
]

export type IrrigationType = {
  id: "secano" | "riego"
  label: string
  icon: LucideIcon
  description: string
}

export const irrigationTypes: IrrigationType[] = [
  {
    id: "secano",
    label: "Secano",
    icon: Sun,
    description: "Sin sistema de riego",
  },
  {
    id: "riego",
    label: "Riego",
    icon: Droplets,
    description: "Con sistema de riego",
  },
]

export const irrigationSystems = [
  "Goteo",
  "Aspersión",
  "Pivote",
  "Inundación",
  "Microaspersión",
]

export const soilTypes = [
  "Arcilloso",
  "Arenoso",
  "Franco",
  "Limoso",
  "Calcáreo",
  "Pedregoso",
]

export const transitionProps = {
  type: "spring" as const,
  stiffness: 500,
  damping: 30,
  mass: 0.5,
}
