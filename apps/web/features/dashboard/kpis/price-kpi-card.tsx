import { TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardFooter } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"

export interface KpiItem {
  name: string
  price: number
  priceMin: number
  priceMax: number
  unit: string
  updatedAt: string
}

interface KpiCardProps {
  items: KpiItem[]
}

export function KpiCard({ items }: KpiCardProps) {
  return (
    <Card className="h-fit overflow-hidden p-0">
      <div
        className="grid w-full grid-cols-1 gap-px bg-border md:grid-cols-[repeat(var(--cols),minmax(0,1fr))]"
        style={{ "--cols": items.length } as React.CSSProperties}
      >
        {items.map((item) => {
          const isUp = item.price >= (item.priceMin + item.priceMax) / 2
          return (
            <div key={item.name} className="flex flex-col gap-2 bg-card">
              <CardContent className="flex flex-col gap-2 p-3 pb-0">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    {item.name}
                  </span>
                  <div
                    className={cn(
                      "flex items-center gap-1 text-xs font-medium",
                      isUp
                        ? "text-(--primary-income)"
                        : "text-(--primary-expense)"
                    )}
                  >
                    {isUp ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-semibold tracking-tight text-foreground">
                    {item.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    /{item.unit}
                  </span>
                </div>

                {/* Range bar */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono">{item.priceMin.toFixed(2)}</span>
                  <div className="relative h-1.5 flex-1 rounded-full bg-muted">
                    <div
                      className={cn(
                        "absolute inset-y-0 left-0 rounded-full",
                        isUp
                          ? "bg-(--primary-income)"
                          : "bg-(--primary-expense)"
                      )}
                      style={{
                        width: `${((item.price - item.priceMin) / (item.priceMax - item.priceMin)) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="font-mono">{item.priceMax.toFixed(2)}</span>
                </div>
              </CardContent>

              {/* Footer */}
              <CardFooter className="flex items-center justify-start gap-1.5 border-t border-border bg-card px-3 py-2">
                <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_5px_theme(colors.emerald.500)]" />
                <span className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                  Act. {item.updatedAt}
                </span>
              </CardFooter>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
