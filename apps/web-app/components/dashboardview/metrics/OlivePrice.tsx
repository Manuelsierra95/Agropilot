'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { useMetricStore } from '@/store/useDashboardMetricStore'
import { useParcelStore } from '@/store/useParcelStore'

export function OlivePrice() {
  const { parcelId } = useParcelStore()
  const { getMetrics } = useMetricStore()
  const metrics = parcelId ? getMetrics(parcelId) : {}
  const data = metrics.olive_price || []
  const metric = data.length > 0 ? data[0] : null

  if (!metric) {
    return (
      <Card className="col-span-1 sm:col-span-1 md:col-span-2 lg:col-span-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Precio oliva</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">-- €/kg</div>
        </CardContent>
      </Card>
    )
  }

  const current = metric.value
  const previous = metric.previousValue ?? current
  const change = current - previous
  const changePercentage = previous !== 0 ? (change / previous) * 100 : 0
  const isPositive = change >= 0

  return (
    <Card className="col-span-1 sm:col-span-1 md:col-span-2 lg:col-span-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Precio oliva</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-bold">{current.toFixed(2)} €/kg</div>
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
            <span>{Math.abs(change).toFixed(2)} €</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {isPositive ? '+' : ''}
          {changePercentage.toFixed(1)}% vs ayer
        </p>
      </CardContent>
    </Card>
  )
}
