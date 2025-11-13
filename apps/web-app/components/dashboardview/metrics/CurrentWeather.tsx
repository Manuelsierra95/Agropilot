'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { Separator } from '@workspace/ui/components/separator'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { useMetricStore } from '@/store/useDashboardMetricStore'
import { useParcelStore } from '@/store/useParcelStore'

export function CurrentWeather() {
  const { parcelId } = useParcelStore()
  const { getMetrics } = useMetricStore()
  const metrics = parcelId ? getMetrics(parcelId) : {}

  const temperatureData = metrics.current_weather_temperature || []
  const humidityData = metrics.current_weather_humidity || []
  const windData = metrics.current_weather_wind || []

  const temperatureMetric =
    temperatureData.length > 0 ? temperatureData[0] : null
  const humidityMetric = humidityData.length > 0 ? humidityData[0] : null
  const windSpeedMetric = windData.length > 0 ? windData[0] : null

  if (!temperatureMetric || !humidityMetric || !windSpeedMetric) {
    return (
      <Card className="col-span-1 sm:col-span-1 md:col-span-2 lg:col-span-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Clima actual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-2xl font-bold">--</div>
        </CardContent>
      </Card>
    )
  }

  const temperature = temperatureMetric.value
  const temperaturePrevious = temperatureMetric.previousValue ?? temperature
  const tempChange = temperature - temperaturePrevious

  const humidity = humidityMetric.value
  const humidityPrevious = humidityMetric.previousValue ?? humidity
  const humidityChange = humidity - humidityPrevious

  const windSpeed = windSpeedMetric.value
  const windSpeedPrevious = windSpeedMetric.previousValue ?? windSpeed
  const windChange = windSpeed - windSpeedPrevious

  return (
    <Card className="col-span-1 sm:col-span-1 md:col-span-2 lg:col-span-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Clima actual</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Temperatura</span>
          <div className="flex items-center gap-1.5">
            <span className="font-medium">{temperature} °C</span>
            <span
              className={`flex items-center text-xs ${
                tempChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {tempChange >= 0 ? (
                <ArrowUp className="w-2.5 h-2.5" />
              ) : (
                <ArrowDown className="w-2.5 h-2.5" />
              )}
              {Math.abs(tempChange).toFixed(1)}
            </span>
          </div>
        </div>
        <Separator />
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Humedad</span>
          <div className="flex items-center gap-1.5">
            <span className="font-medium">{humidity} %</span>
            <span
              className={`flex items-center text-xs ${
                humidityChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {humidityChange >= 0 ? (
                <ArrowUp className="w-2.5 h-2.5" />
              ) : (
                <ArrowDown className="w-2.5 h-2.5" />
              )}
              {Math.abs(humidityChange).toFixed(1)}
            </span>
          </div>
        </div>
        <Separator />
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Viento</span>
          <div className="flex items-center gap-1.5">
            <span className="font-medium">{windSpeed} km/h</span>
            <span
              className={`flex items-center text-xs ${
                windChange >= 0 ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {windChange >= 0 ? (
                <ArrowUp className="w-2.5 h-2.5" />
              ) : (
                <ArrowDown className="w-2.5 h-2.5" />
              )}
              {Math.abs(windChange).toFixed(1)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
