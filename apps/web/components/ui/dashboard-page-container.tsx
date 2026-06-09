import { cn } from "@workspace/ui/lib/utils"

import type { DashboardSlotId } from "@workspace/copilot"

export const DASHBOARD_SLOT_IDS = [
  "top_a",
  "top_b",
  "top_c",
  "main",
  "secondary",
  "detail",
] as const satisfies readonly DashboardSlotId[]

export type { DashboardSlotId }

const SLOT_LAYOUT_CLASSES: Record<DashboardSlotId, string> = {
  top_a: "col-start-1 row-start-1 md:col-start-1 md:row-start-1",
  top_b: "col-start-1 row-start-2 md:col-start-2 md:row-start-1",
  top_c: "col-start-1 row-start-3 md:col-start-3 md:row-start-1",
  main: "col-start-1 row-start-4 md:col-span-3 md:col-start-1 md:row-start-2",
  secondary:
    "col-start-1 row-start-5 md:col-span-3 md:col-start-1 md:row-start-3",
  detail: "col-start-1 row-start-6 md:col-span-3 md:col-start-1 md:row-start-4",
}

export const DashboardPageContainer = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <main
      className={cn(
        "@container/main grid flex-1 grid-cols-1 gap-4 p-4 md:grid-cols-3",
        className
      )}
    >
      {children}
    </main>
  )
}

export const DashboardSlot = ({
  slot,
  children,
  className,
  empty,
}: {
  slot: DashboardSlotId
  children?: React.ReactNode
  className?: string
  empty?: boolean
}) => {
  if (empty) {
    return (
      <div
        data-slot={slot}
        className={cn(
          "min-h-[120px] rounded-xl border border-dashed border-border/60 bg-muted/10",
          SLOT_LAYOUT_CLASSES[slot],
          className
        )}
        aria-hidden
      />
    )
  }

  return (
    <div
      data-slot={slot}
      className={cn("min-h-[120px]", SLOT_LAYOUT_CLASSES[slot], className)}
    >
      {children}
    </div>
  )
}
