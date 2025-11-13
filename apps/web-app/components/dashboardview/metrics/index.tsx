'use client'

import { useGetDashboardMetrics } from '@/hooks/useGetMetrics'
import { DASHBOARD_METRIC_TYPES } from '@/utils/constants'
import { DataLoader } from '@/components/loaders/DataLoader'
import { OlivePrice } from '@/components/dashboardview/metrics/OlivePrice'
import { YieldEstimate } from '@/components/dashboardview/metrics/YieldEstimate'
import { Rainfall } from '@/components/dashboardview/metrics/Rainfall'
import { CurrentWeather } from '@/components/dashboardview/metrics/CurrentWeather'
import { CropHealth } from '@/components/dashboardview/metrics/CropHealth'
import { PreviousHarvest } from '@/components/dashboardview/metrics/PreviousHarvest'

/**
 * Componente principal que gestiona el fetch de métricas
 * y renderiza todos los componentes de métricas
 */
export function Metrics() {
  const { isLoading } = useGetDashboardMetrics({
    metricTypes: DASHBOARD_METRIC_TYPES,
  })

  if (isLoading) return <DataLoader message="Cargando métricas..." size="lg" />

  return (
    <>
      <OlivePrice />
      <YieldEstimate />
      <Rainfall />
      <CurrentWeather />
      <PreviousHarvest />
      <CropHealth />
    </>
  )
}
