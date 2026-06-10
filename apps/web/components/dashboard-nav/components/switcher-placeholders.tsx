import { cn } from "@workspace/ui/lib/utils"

const pulseBlock = "animate-pulse rounded-md bg-secondary"

export function OrgSwitcherPlaceholder() {
  return (
    <div
      className="group/menu-item relative w-full"
      aria-busy="true"
      aria-label="Cargando organización"
    >
      <div className="flex h-7 w-full items-center gap-2 rounded-md p-2">
        <div className={cn(pulseBlock, "size-6 shrink-0")} />
        <div className={cn(pulseBlock, "h-3.5 min-w-0 flex-1 max-w-[8rem]")} />
        <div className={cn(pulseBlock, "ml-auto size-4 shrink-0")} />
      </div>
    </div>
  )
}

export interface ParcelSwitcherPlaceholderProps {
  variant?: "sidebar" | "dock"
}

export function ParcelSwitcherPlaceholder({
  variant = "sidebar",
}: ParcelSwitcherPlaceholderProps) {
  const isDock = variant === "dock"

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        isDock ? "rounded-lg p-1.5" : "h-8 px-0"
      )}
      aria-busy="true"
      aria-label="Cargando parcela"
    >
      <div className={cn(pulseBlock, "size-6 shrink-0 rounded-md")} />
      <div
        className={cn(
          pulseBlock,
          "h-3.5 w-28 max-w-36 shrink-0",
          isDock ? "" : "flex-1"
        )}
      />
      <div
        className={cn(
          pulseBlock,
          "shrink-0",
          isDock ? "size-3.5" : "ml-auto size-4"
        )}
      />
    </div>
  )
}

export function CampaignSwitcherPlaceholder() {
  return (
    <div
      className="flex h-8 items-center gap-2 rounded-md p-2"
      aria-busy="true"
      aria-label="Cargando campaña"
    >
      <div className={cn(pulseBlock, "size-2 shrink-0 rounded-full")} />
      <div className={cn(pulseBlock, "h-3.5 w-28 max-w-36")} />
      <div className={cn(pulseBlock, "size-3.5 shrink-0")} />
    </div>
  )
}
