"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import { Card, CardContent } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"

import {
  Cloud,
  CloudRain,
  CloudSnow,
  Sun,
  CloudSun,
  Wind,
  Droplets,
  Thermometer,
} from "lucide-react"

interface WeatherData {
  condition: "sunny" | "cloudy" | "partly-cloudy" | "rainy" | "snowy"
  temperature: number
  humidity: number
  windSpeed: number
  location: string
}

interface ForecastDay {
  day: string
  condition: "sunny" | "cloudy" | "partly-cloudy" | "rainy" | "snowy"
  tempMax: number
  tempMin: number
  humidity: number
}

const mockWeatherData: WeatherData = {
  condition: "partly-cloudy",
  temperature: 22,
  humidity: 65,
  windSpeed: 12,
  location: "Parcela Principal",
}

const mockForecast: ForecastDay[] = [
  { day: "Lun", condition: "sunny", tempMax: 24, tempMin: 14, humidity: 55 },
  {
    day: "Mar",
    condition: "partly-cloudy",
    tempMax: 22,
    tempMin: 13,
    humidity: 60,
  },
  { day: "Mié", condition: "cloudy", tempMax: 19, tempMin: 12, humidity: 70 },
  { day: "Jue", condition: "rainy", tempMax: 17, tempMin: 11, humidity: 85 },
  {
    day: "Vie",
    condition: "partly-cloudy",
    tempMax: 20,
    tempMin: 12,
    humidity: 65,
  },
]

const weatherIcons = {
  sunny: Sun,
  cloudy: Cloud,
  "partly-cloudy": CloudSun,
  rainy: CloudRain,
  snowy: CloudSnow,
}

const weatherLabels = {
  sunny: "Soleado",
  cloudy: "Nublado",
  "partly-cloudy": "Parcialmente nublado",
  rainy: "Lluvia",
  snowy: "Nieve",
}

export function TimeWeatherCard() {
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const [weather] = useState<WeatherData>(mockWeatherData)
  const [forecast] = useState<ForecastDay[]>(mockForecast)

  useEffect(() => {
    const updateTime = () => setCurrentTime(new Date())

    updateTime()

    const now = new Date()
    const delay = (60 - now.getSeconds()) * 1000

    let interval: NodeJS.Timeout

    const timeout = setTimeout(() => {
      updateTime()
      interval = setInterval(updateTime, 60000)
    }, delay)

    return () => {
      clearTimeout(timeout)
      if (interval) clearInterval(interval)
    }
  }, [])

  const formatTime = (date: Date) => {
    return format(date, "HH:mm", { locale: es })
  }

  const formatDate = (date: Date) => {
    return format(date, "EEEE, d 'de' MMMM", { locale: es })
  }

  const WeatherIcon = weatherIcons[weather.condition]

  return (
    <Card className="w-full border-border/50">
      <CardContent className="pt-6">
        {/* Desktop */}
        <div className="hidden xl:flex xl:items-start xl:justify-between xl:gap-8">
          {/* Hora */}
          <div className="space-y-1">
            <p className="text-xs tracking-widest text-muted-foreground uppercase">
              Hora local
            </p>
            <p className="text-4xl font-light tracking-tight text-foreground tabular-nums">
              {formatTime(currentTime)}
            </p>
            <p className="text-sm text-muted-foreground capitalize">
              {formatDate(currentTime)}
            </p>
          </div>

          <Separator orientation="vertical" className="h-24" />

          {/* Clima */}
          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs tracking-widest text-muted-foreground uppercase">
                  {weather.location}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-light tracking-tight text-foreground">
                    {weather.temperature}
                  </span>
                  <span className="text-xl text-muted-foreground">°C</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {weatherLabels[weather.condition]}
                </p>
              </div>
              <div className="rounded-lg bg-secondary p-3">
                <WeatherIcon
                  className="h-8 w-8 text-foreground"
                  strokeWidth={1.5}
                />
              </div>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-1 rounded-lg bg-secondary/50 p-3">
                <Thermometer
                  className="h-4 w-4 text-muted-foreground"
                  strokeWidth={1.5}
                />
                <span className="text-xs text-muted-foreground">Sensación</span>
                <span className="text-sm font-medium text-foreground">
                  {weather.temperature + 2}°
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg bg-secondary/50 p-3">
                <Droplets
                  className="h-4 w-4 text-muted-foreground"
                  strokeWidth={1.5}
                />
                <span className="text-xs text-muted-foreground">Humedad</span>
                <span className="text-sm font-medium text-foreground">
                  {weather.humidity}%
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg bg-secondary/50 p-3">
                <Wind
                  className="h-4 w-4 text-muted-foreground"
                  strokeWidth={1.5}
                />
                <span className="text-xs text-muted-foreground">Viento</span>
                <span className="text-sm font-medium text-foreground">
                  {weather.windSpeed} km/h
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Forecast Desktop */}
        <div className="hidden xl:block">
          <Separator className="my-5" />
          <div className="space-y-3">
            <p className="text-xs tracking-widest text-muted-foreground uppercase">
              Próximos 5 días
            </p>
            <div className="grid grid-cols-5 gap-2">
              {forecast.map((day) => {
                const DayIcon = weatherIcons[day.condition]
                return (
                  <div
                    key={day.day}
                    className="flex flex-col items-center gap-2 rounded-lg bg-secondary/30 p-3"
                  >
                    <span className="text-xs font-medium text-foreground">
                      {day.day}
                    </span>
                    <DayIcon
                      className="h-5 w-5 text-muted-foreground"
                      strokeWidth={1.5}
                    />
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-medium text-foreground">
                        {day.tempMax}°
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {day.tempMin}°
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Droplets
                        className="h-3 w-3 text-muted-foreground"
                        strokeWidth={1.5}
                      />
                      <span className="text-xs text-muted-foreground">
                        {day.humidity}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div className="xl:hidden">
          <div className="space-y-1">
            <p className="text-xs tracking-widest text-muted-foreground uppercase">
              Hora local
            </p>
            <p className="text-4xl font-light tracking-tight text-foreground tabular-nums">
              {formatTime(currentTime)}
            </p>
            <p className="text-sm text-muted-foreground capitalize">
              {formatDate(currentTime)}
            </p>
          </div>

          <Separator className="my-5" />

          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs tracking-widest text-muted-foreground uppercase">
                  {weather.location}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-light tracking-tight text-foreground">
                    {weather.temperature}
                  </span>
                  <span className="text-xl text-muted-foreground">°C</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {weatherLabels[weather.condition]}
                </p>
              </div>
              <div className="rounded-lg bg-secondary p-3">
                <WeatherIcon
                  className="h-8 w-8 text-foreground"
                  strokeWidth={1.5}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">{/* mismos bloques */}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
