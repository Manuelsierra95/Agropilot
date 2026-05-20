import { ArrowUp, ArrowDown } from "lucide-react"
import { Card, CardContent } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import { GradientSeparator } from "@/components/gradient-separator"

export interface Item {
  name: string
  price: number
  priceMin: number
  priceMax: number
  unit: string
  updatedAt: string
}

interface OlivePriceCardProps {
  items: Item[]
}

export function OlivePriceCard({ items }: OlivePriceCardProps) {
  return (
    <Card className="h-fit overflow-hidden bg-background p-0 ring-0">
      <div
        className="grid w-full grid-cols-1 gap-px md:grid-cols-[repeat(var(--cols),minmax(0,1fr))]"
        style={{ "--cols": items.length } as React.CSSProperties}
      >
        {items.map((item, index) => {
          const isUp = item.price >= (item.priceMin + item.priceMax) / 2
          return (
            <div key={item.name} className="flex">
              {index > 0 && <GradientSeparator orientation="vertical" />}
              <div className="flex flex-1 flex-col gap-2">
                <CardContent className="flex flex-col gap-2 p-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      {item.name}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-semibold tracking-tight text-foreground">
                      {item.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {item.unit}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-1 text-xs font-medium"
                    )}
                  >
                    <div className="relative h-3.5 w-3.5">
                      <div
                        className={cn(
                          "absolute inset-0 rounded-full",
                          isUp
                            ? "bg-(--primary-income)"
                            : "bg-(--primary-expense)"
                        )}
                      />
                      {isUp ? (
                        <ArrowUp className="absolute inset-0 m-auto h-2 w-2 text-black" />
                      ) : (
                        <ArrowDown className="absolute inset-0 m-auto h-2 w-2 text-black" />
                      )}
                    </div>

                    <span
                      className={cn(
                        "font-semibold",
                        isUp
                          ? "text-(--primary-income)"
                          : "text-(--primary-expense)"
                      )}
                    >
                      {/* {percentage}% */}
                      10%
                    </span>
                    <span className="font-normal text-muted-foreground">
                      vs últimos 10 días
                    </span>
                  </div>
                </CardContent>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
