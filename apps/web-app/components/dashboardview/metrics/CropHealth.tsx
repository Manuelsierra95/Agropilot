'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { useMetricStore } from '@/store/useDashboardMetricStore'
import { useParcelStore } from '@/store/useParcelStore'

export function CropHealth() {
  const { parcelId } = useParcelStore()
  const { getMetrics } = useMetricStore()
  const metrics = parcelId ? getMetrics(parcelId) : {}
  const data = metrics.crop_health || []
  const metric = data.length > 0 ? data[0] : null

  if (!metric) {
    return (
      <Card className="col-span-1 md:col-span-1 lg:col-span-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Salud cultivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">--</div>
        </CardContent>
      </Card>
    )
  }

  const current = metric.value
  const previous = metric.previousValue ?? current
  const change = current - previous
  const changePercentage = previous !== 0 ? (change / previous) * 100 : 0
  const isPositive = change >= 0

  const getStatus = (value: number): { label: string; color: string } => {
    if (value >= 85) return { label: 'Excelente', color: 'bg-green-500' }
    if (value >= 70) return { label: 'Bueno', color: 'bg-blue-500' }
    if (value >= 50) return { label: 'Atención', color: 'bg-yellow-500' }
    return { label: 'Crítico', color: 'bg-red-500' }
  }

  const status = getStatus(current)

  return (
    <Card className="col-span-1 md:col-span-1 lg:col-span-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Salud cultivo</CardTitle>
          <Badge
            variant="secondary"
            className={`h-5 px-2 text-xs ${status.color} text-white border-0`}
          >
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-bold">{current} /100</div>
          <div
            className={`flex items-center gap-0.5 text-sm font-medium ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isPositive ? (
              <ArrowUp className="w-3 h-3" />
            ) : (
              <ArrowDown className="w-3 h-3" />
            )}
            <span>{Math.abs(change).toFixed(1)}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {isPositive ? '+' : ''}
          {changePercentage.toFixed(1)}% vs anterior
        </p>
      </CardContent>
    </Card>
  )
}
