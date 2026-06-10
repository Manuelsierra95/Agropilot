import type { LucideIcon } from "lucide-react"
import { CircleIcon, TreePine } from "lucide-react"

export function getParcelIcon(cropType: string): LucideIcon {
  const normalized = cropType.toLowerCase()

  if (normalized.includes("oliv") || normalized.includes("almend")) {
    return TreePine
  }

  return CircleIcon
}
