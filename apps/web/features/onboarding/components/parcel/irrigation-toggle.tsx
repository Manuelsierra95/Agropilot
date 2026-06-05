"use client"

import { Droplets, Sun } from "lucide-react"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group"
import type { IrrigationType } from "./parcel-constants"

interface IrrigationToggleProps {
  value: IrrigationType | undefined
  onChange: (value: IrrigationType) => void
  invalid?: boolean
}

export function IrrigationToggle({
  value,
  onChange,
  invalid = false,
}: IrrigationToggleProps) {
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      spacing={2}
      className="w-full"
      value={value}
      aria-invalid={invalid || undefined}
      onValueChange={(next) => {
        if (next) onChange(next as IrrigationType)
      }}
    >
      <ToggleGroupItem value="dryland" className="flex-1">
        <Sun data-icon="inline-start" />
        Secano
      </ToggleGroupItem>
      <ToggleGroupItem value="irrigated" className="flex-1">
        <Droplets data-icon="inline-start" />
        Regadío
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
