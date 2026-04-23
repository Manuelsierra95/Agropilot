import { TrendingUp, TrendingDown } from "lucide-react"

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
    <section className="overflow-hidden border-b">
      <div
        className="grid w-full grid-cols-1 gap-px bg-border md:grid-cols-[repeat(var(--cols),minmax(0,1fr))]"
        style={{ "--cols": items.length } as React.CSSProperties}
      >
        {items.map((item) => {
          const isUp = item.price >= (item.priceMin + item.priceMax) / 2
          return (
            <div
              key={item.name}
              className="flex flex-col gap-6 border-border bg-background p-6 pb-0"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {item.name}
                </span>
                <div
                  className={`flex items-center gap-1 text-xs font-medium ${
                    isUp
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {isUp ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5" />
                  )}
                </div>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-semibold tracking-tight text-foreground">
                  {item.price.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground">
                  /{item.unit}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-[10px] font-medium tracking-wider text-muted-foreground/60 uppercase">
                    Min
                  </span>
                  <span className="font-mono">{item.priceMin.toFixed(2)}</span>
                </div>
                <div className="relative h-1.5 flex-1 rounded-full bg-muted">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full ${
                      isUp
                        ? "bg-emerald-500 dark:bg-emerald-400"
                        : "bg-red-500 dark:bg-red-400"
                    }`}
                    style={{
                      width: `${((item.price - item.priceMin) / (item.priceMax - item.priceMin)) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-[10px] font-medium tracking-wider text-muted-foreground/60 uppercase">
                    Max
                  </span>
                  <span className="font-mono">{item.priceMax.toFixed(2)}</span>
                </div>
              </div>

              <div className="-mx-6 flex items-center justify-start gap-1.5 border-t border-border px-6 py-3">
                <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_5px_theme(colors.emerald.500)]" />
                <span className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                  Act. {item.updatedAt}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
