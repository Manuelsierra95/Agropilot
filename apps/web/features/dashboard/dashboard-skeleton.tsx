import {
  DashboardPageContainer,
  DashboardSlot,
  DASHBOARD_SLOT_IDS,
} from "@/components/ui/dashboard-page-container"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"

const SLOT_HEARTBEAT_DELAYS = ["0ms", "120ms", "240ms", "360ms", "480ms", "600ms"] as const

function SlotSkeleton({ tall = false }: { tall?: boolean }) {
  return (
    <Card className="bg-background ring-0">
      <CardHeader>
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className={tall ? "h-[280px] w-full" : "h-[120px] w-full"} />
      </CardContent>
    </Card>
  )
}

export function DashboardSkeleton() {
  return (
    <Skeleton isLoading>
      <DashboardPageContainer>
        {DASHBOARD_SLOT_IDS.map((slot, index) => (
          <DashboardSlot key={slot} slot={slot}>
            <div
              className={cn(
                "animate-[dashboard-heartbeat_1.5s_ease-in-out_infinite]"
              )}
              style={{ animationDelay: SLOT_HEARTBEAT_DELAYS[index] }}
            >
              <SlotSkeleton
                tall={slot === "main" || slot === "secondary" || slot === "detail"}
              />
            </div>
          </DashboardSlot>
        ))}
      </DashboardPageContainer>
    </Skeleton>
  )
}
