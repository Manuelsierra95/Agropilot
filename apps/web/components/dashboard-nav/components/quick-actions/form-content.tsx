"use client"

import { ArrowLeft } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { formMap } from "@workspace/web/components/dashboard-nav/components/quick-actions/forms"
import { quickActionsItems } from "@workspace/web/components/dashboard-nav/components/quick-actions/quick-actions-items"

interface FormContentProps {
  activeForm: string
  onBack: () => void
  onSuccess: () => void
}

export function FormContent({
  activeForm,
  onBack,
  onSuccess,
}: FormContentProps) {
  const ActiveFormComponent = formMap[activeForm]
  const activeItem = quickActionsItems
    .flatMap((g) => g.items)
    .find((item) => item.id === activeForm)

  if (!ActiveFormComponent || !activeItem) return null

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={onBack}
        className="absolute -top-1 -right-1 size-7 rounded-full"
        aria-label="Volver atrás"
      >
        <ArrowLeft className="size-4" />
      </Button>
      <div className="mb-3 flex items-center gap-3 pr-8">
        <div className="flex size-10 items-center justify-center rounded-xl bg-zinc-200/75 text-zinc-600">
          <activeItem.icon className="size-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-zinc-800">
            {activeItem.label}
          </h3>
          <p className="text-xs text-zinc-500">{activeItem.description}</p>
        </div>
      </div>
      <div className="-mx-4 -mb-4 rounded-b-3xl border-t border-zinc-200 bg-zinc-50">
        <ActiveFormComponent onSuccess={onSuccess} />
      </div>
    </div>
  )
}
