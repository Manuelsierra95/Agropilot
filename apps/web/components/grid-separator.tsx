import { Card } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"

type GridSeparatorProps = {
  className?: string
}

export function GridSeparator({ className }: GridSeparatorProps) {
  return (
    <Card className={cn("relative bg-background p-0", className)}>
      <div
        aria-hidden="true"
        className="absolute inset-0 my-0.5 text-muted-foreground/25"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)",
        }}
      />
    </Card>
  )
}
