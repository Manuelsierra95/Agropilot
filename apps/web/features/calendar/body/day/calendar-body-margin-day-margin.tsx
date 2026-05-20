import { format } from "date-fns"
import { cn } from "@workspace/ui/lib/utils"

export const hours = Array.from({ length: 24 }, (_, i) => i)

export default function CalendarBodyMarginDayMargin({
  className,
}: {
  className?: string
}) {
  return (
    <div
      className={cn(
        "sticky left-0 z-10 flex w-12 flex-col bg-background",
        className
      )}
    >
      <div className="sticky top-0 left-0 z-20 h-[33px] border-b border-border/30 bg-background" />
      <div className="sticky left-0 z-10 flex w-12 flex-col bg-background">
        {hours.map((hour) => (
          <div key={hour} className="relative h-32 first:mt-0">
            {hour !== 0 && (
              <span className="absolute -top-2.5 left-2 text-xs text-muted-foreground">
                {format(new Date().setHours(hour, 0, 0, 0), "h a")}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
