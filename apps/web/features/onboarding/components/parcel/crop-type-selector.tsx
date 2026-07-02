"use client"

import { cn } from "@workspace/ui/lib/utils"
import { Check } from "lucide-react"
import {
  CROP_OPTIONS,
  type CropTypeValue,
} from "@workspace/web/features/onboarding/components/parcel/parcel-constants"

interface CropTypeSelectorProps {
  value: CropTypeValue
  onChange: (value: CropTypeValue) => void
}

export function CropTypeSelector({ value, onChange }: CropTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {CROP_OPTIONS.map((crop) => {
          const isSelected = value === crop.value
          return (
            <button
              key={crop.value}
              type="button"
              disabled={!crop.enabled}
              onClick={() => crop.enabled && onChange(crop.value)}
              className={cn(
                "relative inline-flex h-9 items-center justify-center rounded-md border px-4 text-sm font-medium transition-all",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
                crop.enabled
                  ? "hover:bg-accent hover:text-accent-foreground"
                  : "cursor-not-allowed opacity-50",
                isSelected && crop.enabled
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-input bg-card text-muted-foreground"
              )}
            >
              {crop.label}
              {isSelected && crop.enabled && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-2.5 w-2.5" />
                </span>
              )}
            </button>
          )
        })}
      </div>
      <p className="text-sm text-muted-foreground">
        Próximamente se implementarán más tipos de cultivos.
      </p>
    </div>
  )
}
