"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector, type SectorProps } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  ChartContainer,
  ChartStyle,
  type ChartConfig,
} from "@workspace/ui/components/chart"
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area"
import { Button } from "@workspace/ui/components/button"
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PieChartDataItem {
  category: string
  amount: number
  fill: string
}

export interface DrawerRenderProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: string
  amount: number
  percentage: string
  color: string
}

export interface FinancePieChartProps {
  id: string
  title: string
  description?: string
  data: PieChartDataItem[]
  chartConfig: ChartConfig
  categoryToKey: Record<string, string>
  renderDrawer?: (props: DrawerRenderProps) => React.ReactNode
  legendScrollThreshold?: number
}

// ─── Sort types ───────────────────────────────────────────────────────────────

type SortKey = "category" | "percentage" | "amount"
type SortDir = "asc" | "desc"

interface SortState {
  key: SortKey
  dir: SortDir
}

// ─── SortHeader ───────────────────────────────────────────────────────────────

function SortHeader({
  label,
  sortKey,
  sort,
  onSort,
  className = "",
}: {
  label: string
  sortKey: SortKey
  sort: SortState
  onSort: (key: SortKey) => void
  className?: string
}) {
  const isActive = sort.key === sortKey

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onSort(sortKey)}
      className={`flex items-center gap-0.5 text-[10px] font-medium transition-colors select-none hover:bg-transparent ${
        isActive ? "text-foreground" : "text-muted-foreground"
      } ${className}`}
    >
      {label}
      <span className="text-[9px] leading-none">
        {isActive ? (
          sort.dir === "asc" ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )
        ) : (
          <ArrowUpDown className="h-4 w-4 opacity-30" />
        )}
      </span>
    </Button>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FinancePieChart({
  id,
  title,
  description = "Desglose por categoría",
  data,
  chartConfig,
  categoryToKey,
  renderDrawer,
  legendScrollThreshold = 6,
}: FinancePieChartProps) {
  const total = React.useMemo(
    () => data.reduce((acc, d) => acc + d.amount, 0),
    [data]
  )

  // ── Sort state — default: % ────────────────────────────────────
  const [sort, setSort] = React.useState<SortState>({
    key: "percentage",
    dir: "desc",
  })

  const handleSort = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "desc" }
    )
  }

  // ── Sorted data (original indices preserved for pie sync) ─────────────────
  const sortedEntries = React.useMemo(() => {
    const entries = data.map((item, originalIndex) => ({ item, originalIndex }))

    return entries.sort((a, b) => {
      let cmp = 0
      if (sort.key === "category") {
        cmp = a.item.category.localeCompare(b.item.category, "es")
      } else {
        // "percentage" is proportional to amount → same ordering
        cmp = a.item.amount - b.item.amount
      }
      return sort.dir === "asc" ? cmp : -cmp
    })
  }, [data, sort])

  // ── Active index tracks the *original* data index (stays in sync with pie) ─
  const maxOriginalIndex = React.useMemo(
    () =>
      data.reduce(
        (maxIdx, item, idx, arr) =>
          item.amount > (arr[maxIdx]?.amount ?? 0) ? idx : maxIdx,
        0
      ),
    [data]
  )

  const [activeOriginalIndex, setActiveOriginalIndex] =
    React.useState(maxOriginalIndex)
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [selectedItem, setSelectedItem] =
    React.useState<PieChartDataItem | null>(null)

  // Keep active in sync when data changes (e.g. date filter)
  const prevMax = React.useRef(maxOriginalIndex)
  if (prevMax.current !== maxOriginalIndex) {
    prevMax.current = maxOriginalIndex
    setActiveOriginalIndex(maxOriginalIndex)
  }

  // Sync active pie slice to the first item of the sorted list when sort changes
  const prevSort = React.useRef(sort)
  React.useEffect(() => {
    if (
      prevSort.current.key !== sort.key ||
      prevSort.current.dir !== sort.dir
    ) {
      prevSort.current = sort
      const first = sortedEntries[0]
      if (first !== undefined) {
        setActiveOriginalIndex(first.originalIndex)
      }
    }
  }, [sort, sortedEntries])

  // ── Auto-scroll: keep active legend item visible ───────────────────────────
  const activeItemRef = React.useRef<HTMLLIElement>(null)

  React.useEffect(() => {
    activeItemRef.current?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    })
  }, [activeOriginalIndex, sort])

  // ── Derived ───────────────────────────────────────────────────────────────
  const activeItem = data[activeOriginalIndex]
  const needsScroll = data.length > legendScrollThreshold

  const renderActiveShape = React.useCallback((props: SectorProps) => {
    const { outerRadius = 0, ...rest } = props
    return (
      <g>
        <Sector {...rest} outerRadius={outerRadius + 10} />
      </g>
    )
  }, [])

  const handleSelect = (item: PieChartDataItem, originalIndex: number) => {
    setActiveOriginalIndex(originalIndex)
    setSelectedItem(item)
    setDrawerOpen(true)
  }

  return (
    <Card
      data-chart={id}
      className="col-span-1 flex h-full flex-col bg-background ring-0"
    >
      <ChartStyle id={id} config={chartConfig} />

      <CardHeader className="pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 items-center gap-6">
        {/* ── Pie ── */}
        <ChartContainer
          id={id}
          config={chartConfig}
          className="aspect-square h-fit min-h-60 w-fit shrink-0"
        >
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="category"
              innerRadius={55}
              strokeWidth={4}
              activeIndex={activeOriginalIndex}
              activeShape={renderActiveShape}
              onMouseEnter={(_, index) => setActiveOriginalIndex(index)}
              onClick={(_, index) => handleSelect(data[index]!, index)}
              className="cursor-pointer"
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    const category = activeItem?.category ?? ""
                    const words = category.split(" ")
                    const mid = Math.ceil(words.length / 2)
                    const line1 = words.slice(0, mid).join(" ")
                    const line2 = words.slice(mid).join(" ")
                    const hasTwo = line2.length > 0

                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="cursor-default"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) - (hasTwo ? 10 : 0)}
                          className="fill-foreground text-xl font-bold"
                        >
                          {activeItem?.amount.toLocaleString("es-ES")}
                          {"\u00A0"}€
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) + (hasTwo ? 12 : 20)}
                          className="fill-muted-foreground text-[10px]"
                        >
                          {line1}
                        </tspan>
                        {hasTwo && (
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy ?? 0) + 24}
                            className="fill-muted-foreground text-[10px]"
                          >
                            {line2}
                          </tspan>
                        )}
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>

        {/* ── Legend ── */}
        <div className="flex flex-1 flex-col gap-1 overflow-hidden">
          {/* ── Column headers ── */}
          <div className="flex items-center gap-2 border-b pr-2 pb-1">
            {/* spacer for color dot */}
            <span className="h-2.5 w-2.5 shrink-0" />
            <SortHeader
              label="Nombre"
              sortKey="category"
              sort={sort}
              onSort={handleSort}
              className="flex-1"
            />
            <SortHeader
              label="%"
              sortKey="percentage"
              sort={sort}
              onSort={handleSort}
              className="shrink-0"
            />
            <SortHeader
              label="Importe"
              sortKey="amount"
              sort={sort}
              onSort={handleSort}
              className="w-[60px] shrink-0 justify-end"
            />
          </div>

          {/* ── Rows ── */}
          <ScrollArea className={`${needsScroll ? "h-[220px]" : "h-auto"}`}>
            <ul className="flex flex-col gap-2 pt-0.5">
              {sortedEntries.map(({ item, originalIndex }) => {
                const key = categoryToKey[item.category]
                const pct = ((item.amount / total) * 100).toFixed(1)
                const isActive = originalIndex === activeOriginalIndex

                return (
                  <li
                    key={item.category}
                    ref={isActive ? activeItemRef : undefined}
                    className={`flex cursor-pointer items-start gap-2 rounded-md px-1 py-0.5 transition-colors ${
                      isActive ? "bg-muted" : "hover:bg-muted/50"
                    }`}
                    onMouseEnter={() => setActiveOriginalIndex(originalIndex)}
                    onClick={() => handleSelect(item, originalIndex)}
                  >
                    <span
                      className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-[2px]"
                      style={{ backgroundColor: `var(--color-${key})` }}
                    />
                    <span
                      className={`flex-1 text-xs leading-tight font-semibold wrap-break-word transition-colors ${
                        isActive ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {item.category}
                    </span>
                    <span
                      className={`shrink-0 text-xs font-semibold tabular-nums transition-colors ${
                        isActive ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {pct}
                      {"\u00A0"}%
                    </span>
                    <span
                      className={`w-[60px] shrink-0 pr-2 text-right text-xs font-semibold tabular-nums transition-colors ${
                        isActive ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {item.amount.toLocaleString("es-ES")}
                      {"\u00A0"}€
                    </span>
                  </li>
                )
              })}
            </ul>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </div>
      </CardContent>

      {/* ── Drawer (delegated to the consumer) ── */}
      {renderDrawer &&
        selectedItem &&
        renderDrawer({
          open: drawerOpen,
          onOpenChange: setDrawerOpen,
          category: selectedItem.category,
          amount: selectedItem.amount,
          percentage: ((selectedItem.amount / total) * 100).toFixed(1),
          color: selectedItem.fill,
        })}
    </Card>
  )
}
