"use client"

import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"
import { Input } from "@workspace/ui/components/input"
import {
  PRESET_CATEGORIES,
  getCategoryLabel,
  type PresetCategory,
} from "@workspace/schemas"

const CATEGORY_ICONS: Record<PresetCategory, string> = {
  irrigation: "💧",
  fertilization: "🌱",
  treatment: "🧪",
  harvest: "🌾",
  inspection: "🔍",
}

const CATEGORY_ACTIVE_CLASSES: Record<PresetCategory, string> = {
  irrigation:
    "border-blue-400 bg-blue-400/10 dark:border-blue-400 dark:bg-blue-400/15",
  fertilization:
    "border-green-500 bg-green-500/10 dark:border-green-400 dark:bg-green-400/15",
  treatment:
    "border-red-400 bg-red-400/10 dark:border-red-400 dark:bg-red-400/15",
  harvest:
    "border-yellow-400 bg-yellow-400/10 dark:border-yellow-300 dark:bg-yellow-300/15",
  inspection:
    "border-purple-400 bg-purple-400/10 dark:border-purple-300 dark:bg-purple-300/15",
}

const OTHER_VALUE = "__other__"

const baseBtn = [
  "transition-all duration-150 cursor-pointer font-[inherit]",
  "border-[1.5px] border-border bg-card text-foreground",
  "hover:bg-accent hover:border-ring",
].join(" ")

interface CategorySelectorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function CategorySelector({
  value,
  onChange,
  placeholder = "Mi categoría…",
}: CategorySelectorProps) {
  const isOther = value && !PRESET_CATEGORIES.includes(value as PresetCategory)
  const [otherValue, setOtherValue] = React.useState(isOther ? value : "")

  React.useEffect(() => {
    if (isOther) {
      setOtherValue(value)
    }
  }, [isOther, value])

  function handlePresetClick(category: PresetCategory) {
    setOtherValue("")
    onChange(category)
  }

  function handleOtherClick() {
    onChange(otherValue || OTHER_VALUE)
  }

  function handleOtherInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value
    setOtherValue(next)
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {PRESET_CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => handlePresetClick(category)}
            className={cn(
              baseBtn,
              "flex flex-col items-center justify-center gap-1 rounded-lg px-1 py-2.5",
              value === category ? CATEGORY_ACTIVE_CLASSES[category] : ""
            )}
          >
            <span className="text-xl leading-none">
              {CATEGORY_ICONS[category]}
            </span>
            <span className="text-center text-[0.6rem] leading-tight font-semibold">
              {getCategoryLabel(category)}
            </span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleOtherClick}
        className={cn(
          baseBtn,
          "flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium",
          isOther ? "border-foreground/20 bg-muted/50" : ""
        )}
      >
        <span className="shrink-0 text-base">✏️</span>
        <span className="flex-1">
          {isOther ? getCategoryLabel(value) : "Otra"}
        </span>
      </button>

      {isOther && (
        <Input
          value={otherValue}
          onChange={handleOtherInputChange}
          placeholder={placeholder}
          className="w-full"
        />
      )}
    </div>
  )
}
