import { cn } from "@workspace/ui/lib/utils"

/**
 * Parses **text** and converts it into highlighted <span>.
 * Usage: <HighlightedText text="Production **+3.5%** vs previous." />
 */
export function HighlightedText({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const parts = text.split(/(\*\*[^*]+\*\*)/)

  return (
    <span className={cn(className)}>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <span key={i} className="font-medium text-foreground">
              {part.slice(2, -2)}
            </span>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </span>
  )
}
