import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"

const skeletonBlockClassName = "animate-pulse rounded-lg bg-secondary"

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn(skeletonBlockClassName, className)} aria-hidden />
}

export function WidgetSkeleton({
  className,
  headerWidth = "w-32",
  contentHeight = "h-[120px]",
}: {
  className?: string
  headerWidth?: string
  contentHeight?: string
}) {
  return (
    <Card className={cn("min-w-0 bg-background ring-0", className)}>
      <CardHeader>
        <SkeletonBlock className={cn("h-4", headerWidth)} />
      </CardHeader>
      <CardContent>
        <SkeletonBlock className={cn("w-full", contentHeight)} />
      </CardContent>
    </Card>
  )
}
