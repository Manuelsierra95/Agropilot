import { DashboardPageContainer } from "@/components/ui/dashboard-page-container"
import { GradientSeparator } from "@/components/ui/gradient-separator"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Card, CardContent } from "@workspace/ui/components/card"

export function DashboardSkeleton() {
  return (
    <Skeleton isLoading>
      <DashboardPageContainer className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[1fr_auto_1fr_auto_1fr]">
        <GradientSeparator
          orientation="vertical"
          className="col-start-4 row-span-6 row-start-1"
        />

        {/* Row 1 — OlivePrice: 3 columnas de KPIs */}
        <Card className="col-span-3 col-start-1 row-start-1 h-fit overflow-hidden bg-background p-0 ring-0">
          <div className="grid grid-cols-3 gap-px">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex">
                {i > 0 && <GradientSeparator orientation="vertical" />}
                <CardContent className="flex flex-1 flex-col gap-2 p-3">
                  <div className="h-4 w-20 rounded" />
                  <div className="flex items-baseline gap-1">
                    <div className="h-7 w-16 rounded" />
                    <div className="h-4 w-10 rounded" />
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-3.5 w-3.5 rounded-full" />
                    <div className="h-3 w-8 rounded" />
                    <div className="h-3 w-28 rounded" />
                  </div>
                </CardContent>
              </div>
            ))}
          </div>
        </Card>

        <GradientSeparator
          orientation="horizontal"
          className="col-span-3 col-start-1 row-start-2"
        />

        {/* ResumeCrop: columna derecha, row-span-3 */}
        <Card className="col-start-5 row-span-3 row-start-1 bg-background ring-0">
          <CardContent className="flex flex-col gap-3 p-4">
            <div className="h-4 w-24 rounded" />
            <div className="h-32 w-full rounded" />
            <div className="h-4 w-full rounded" />
            <div className="h-4 w-3/4 rounded" />
            <div className="h-4 w-1/2 rounded" />
          </CardContent>
        </Card>

        {/* Row 2 — FinanceResume */}
        <Card className="col-start-1 row-start-3 bg-background ring-0">
          <CardContent className="flex flex-col gap-3 p-4">
            <div className="h-4 w-28 rounded" />
            <div className="h-20 w-full rounded" />
            <div className="h-4 w-full rounded" />
            <div className="h-4 w-2/3 rounded" />
          </CardContent>
        </Card>

        <GradientSeparator
          orientation="vertical"
          className="col-start-2 row-start-3"
        />

        {/* CashFlowSummary */}
        <Card className="col-start-3 row-start-3 bg-background ring-0">
          <CardContent className="flex flex-col gap-3 p-4">
            <div className="h-4 w-28 rounded" />
            <div className="h-20 w-full rounded" />
            <div className="h-4 w-full rounded" />
            <div className="h-4 w-2/3 rounded" />
          </CardContent>
        </Card>

        <GradientSeparator
          orientation="horizontal"
          className="col-span-3 col-start-1 row-start-4"
        />

        {/* Row 3 — Recommendations | Map */}
        <div className="col-span-3 col-start-1 row-start-5 flex gap-4">
          <Card className="flex-1 bg-background ring-0">
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="h-4 w-32 rounded" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="h-4 w-4 rounded-full" />
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="h-3 w-full rounded" />
                    <div className="h-3 w-3/4 rounded" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <GradientSeparator orientation="vertical" />
          {/* Map */}
          <div className="flex-[2.5] overflow-hidden rounded-lg">
            <div className="h-full min-h-48 w-full rounded-lg bg-muted" />
          </div>
        </div>

        <GradientSeparator
          orientation="horizontal"
          className="col-start-5 row-start-4"
        />

        {/* RiskRadar */}
        <Card className="col-start-5 row-start-5 bg-background ring-0">
          <CardContent className="flex flex-col items-center gap-3 p-4">
            <div className="h-4 w-24 rounded" />
            <div className="h-40 w-40 rounded-full bg-muted" />
          </CardContent>
        </Card>

        <GradientSeparator
          orientation="horizontal"
          className="col-span-5 col-start-1 row-start-6"
        />

        {/* Row 4 — RecentEvents | RecentTransactions */}
        <div className="col-span-5 col-start-1 row-start-7 flex w-full gap-4">
          {[0, 1].map((i) => (
            <Card key={i} className="flex-1 bg-background ring-0">
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="h-4 w-32 rounded" />
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full" />
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="h-3 w-full rounded" />
                      <div className="h-3 w-1/2 rounded" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <GradientSeparator
          orientation="horizontal"
          className="col-span-5 col-start-1 row-start-8"
        />

        {/* Row 5 — ComparativeAreaChart */}
        <Card className="col-span-5 col-start-1 row-start-9 bg-background ring-0">
          <CardContent className="flex flex-col gap-3 p-4">
            <div className="h-4 w-40 rounded" />
            <div className="h-48 w-full rounded" />
          </CardContent>
        </Card>
      </DashboardPageContainer>
    </Skeleton>
  )
}
