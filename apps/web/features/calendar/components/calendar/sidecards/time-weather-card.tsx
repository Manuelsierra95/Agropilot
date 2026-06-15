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

export interface WeatherData {
  condition: "sunny" | "cloudy" | "partly-cloudy" | "rainy" | "snowy"
  temperature: number
  humidity: number
  windSpeed: number
  location: string
}

export interface ForecastDay {
  date: string
  day: string
  condition: "sunny" | "cloudy" | "partly-cloudy" | "rainy" | "snowy"
  tempMax: number
  tempMin: number
  humidity: number
}

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

interface TimeWeatherCardProps {
  weather: WeatherData | null
  forecast: ForecastDay[]
}

export function TimeWeatherCard({
  weather,
  forecast,
}: TimeWeatherCardProps) {
  if (!weather) {
    return (
      <Card className="w-full overflow-hidden border-border/60 bg-linear-to-br from-background via-background to-muted/30 shadow-sm">
        <CardContent className="flex h-32 items-center justify-center p-4">
          <p className="text-xs text-muted-foreground">
            Sin datos meteorológicos
          </p>
        </CardContent>
      </Card>
    )
  }

  const WeatherIcon = weatherIcons[weather.condition]

  return (
    <Card className="w-full overflow-hidden border-border/60 bg-linear-to-br from-background via-background to-muted/30 shadow-sm">
      <CardContent className="space-y-5 p-4 sm:p-5">
        <section className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-[11px] font-medium tracking-[0.22em] text-muted-foreground uppercase">
                {weather.location}
              </p>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-light tracking-tight text-foreground sm:text-5xl">
                  {weather.temperature}
                </span>
                <span className="pb-1 text-lg text-muted-foreground sm:text-xl">
                  °C
                </span>
              </div>
              <p className="max-w-xs text-sm text-muted-foreground">
                {weatherLabels[weather.condition]}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex items-center justify-between rounded-xl border border-border/60 bg-secondary/40 px-4 py-3 sm:flex-col sm:items-center sm:justify-center sm:gap-1.5 sm:px-3">
                <Thermometer
                  className="h-4 w-4 text-muted-foreground"
                  strokeWidth={1.5}
                />
                <span className="text-xs text-muted-foreground">Sensación</span>
                <span className="text-sm font-medium text-foreground">
                  {weather.temperature + 2}°
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/60 bg-secondary/40 px-4 py-3 sm:flex-col sm:items-center sm:justify-center sm:gap-1.5 sm:px-3">
                <Droplets
                  className="h-4 w-4 text-muted-foreground"
                  strokeWidth={1.5}
                />
                <span className="text-xs text-muted-foreground">Humedad</span>
                <span className="text-sm font-medium text-foreground">
                  {weather.humidity}%
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/60 bg-secondary/40 px-4 py-3 sm:flex-col sm:items-center sm:justify-center sm:gap-1.5 sm:px-3">
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

          <div className="flex items-center justify-start sm:justify-end">
            <div className="flex size-14 items-center justify-center rounded-2xl border border-border/60 bg-background/80 shadow-sm sm:size-16">
              <WeatherIcon
                className="h-8 w-8 text-foreground sm:h-9 sm:w-9"
                strokeWidth={1.5}
              />
            </div>
          </div>
        </section>

        <section>
          <Separator className="my-0" />
          <div className="space-y-3 pt-4">
            <p className="text-[11px] font-medium tracking-[0.22em] text-muted-foreground uppercase">
              Próximos 5 días
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {forecast.map((day) => {
                const DayIcon = weatherIcons[day.condition]
                return (
                  <div
                    key={day.date}
                    className="flex min-h-28 flex-col items-center gap-2 rounded-xl border border-border/50 bg-secondary/30 px-3 py-3 text-center"
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
        </section>
      </CardContent>
    </Card>
  )
}
