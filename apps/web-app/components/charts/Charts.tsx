'use client'

import * as React from 'react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@workspace/ui/components/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'

export const description = 'Gráfico interactivo de datos agrícolas'

// Mockup para las graficas
const chartData = [
  {
    date: '2024-04-01',
    precioOliva: 4.2,
    rendimiento: 85,
    lluvias: 12,
    cosechaAnterior: 3200,
  },
  {
    date: '2024-04-02',
    precioOliva: 4.3,
    rendimiento: 86,
    lluvias: 8,
    cosechaAnterior: 3150,
  },
  {
    date: '2024-04-03',
    precioOliva: 4.1,
    rendimiento: 84,
    lluvias: 15,
    cosechaAnterior: 3100,
  },
  {
    date: '2024-04-04',
    precioOliva: 4.4,
    rendimiento: 87,
    lluvias: 5,
    cosechaAnterior: 3250,
  },
  {
    date: '2024-04-05',
    precioOliva: 4.5,
    rendimiento: 88,
    lluvias: 3,
    cosechaAnterior: 3300,
  },
  {
    date: '2024-04-06',
    precioOliva: 4.3,
    rendimiento: 85,
    lluvias: 18,
    cosechaAnterior: 3180,
  },
  {
    date: '2024-04-07',
    precioOliva: 4.2,
    rendimiento: 83,
    lluvias: 22,
    cosechaAnterior: 3050,
  },
  {
    date: '2024-04-08',
    precioOliva: 4.6,
    rendimiento: 89,
    lluvias: 2,
    cosechaAnterior: 3400,
  },
  {
    date: '2024-04-09',
    precioOliva: 4.1,
    rendimiento: 82,
    lluvias: 28,
    cosechaAnterior: 2980,
  },
  {
    date: '2024-04-10',
    precioOliva: 4.4,
    rendimiento: 86,
    lluvias: 10,
    cosechaAnterior: 3200,
  },
  {
    date: '2024-04-11',
    precioOliva: 4.5,
    rendimiento: 88,
    lluvias: 6,
    cosechaAnterior: 3350,
  },
  {
    date: '2024-04-12',
    precioOliva: 4.3,
    rendimiento: 85,
    lluvias: 14,
    cosechaAnterior: 3120,
  },
  {
    date: '2024-04-13',
    precioOliva: 4.6,
    rendimiento: 90,
    lluvias: 4,
    cosechaAnterior: 3450,
  },
  {
    date: '2024-04-14',
    precioOliva: 4.2,
    rendimiento: 84,
    lluvias: 20,
    cosechaAnterior: 3080,
  },
  {
    date: '2024-04-15',
    precioOliva: 4.1,
    rendimiento: 83,
    lluvias: 25,
    cosechaAnterior: 3020,
  },
  {
    date: '2024-04-16',
    precioOliva: 4.3,
    rendimiento: 85,
    lluvias: 11,
    cosechaAnterior: 3150,
  },
  {
    date: '2024-04-17',
    precioOliva: 4.7,
    rendimiento: 91,
    lluvias: 2,
    cosechaAnterior: 3500,
  },
  {
    date: '2024-04-18',
    precioOliva: 4.6,
    rendimiento: 89,
    lluvias: 5,
    cosechaAnterior: 3420,
  },
  {
    date: '2024-04-19',
    precioOliva: 4.4,
    rendimiento: 86,
    lluvias: 9,
    cosechaAnterior: 3250,
  },
  {
    date: '2024-04-20',
    precioOliva: 4.2,
    rendimiento: 83,
    lluvias: 19,
    cosechaAnterior: 3050,
  },
  {
    date: '2024-04-21',
    precioOliva: 4.3,
    rendimiento: 84,
    lluvias: 16,
    cosechaAnterior: 3100,
  },
  {
    date: '2024-04-22',
    precioOliva: 4.4,
    rendimiento: 86,
    lluvias: 12,
    cosechaAnterior: 3200,
  },
  {
    date: '2024-04-23',
    precioOliva: 4.3,
    rendimiento: 85,
    lluvias: 15,
    cosechaAnterior: 3150,
  },
  {
    date: '2024-04-24',
    precioOliva: 4.6,
    rendimiento: 89,
    lluvias: 4,
    cosechaAnterior: 3400,
  },
  {
    date: '2024-04-25',
    precioOliva: 4.4,
    rendimiento: 87,
    lluvias: 8,
    cosechaAnterior: 3280,
  },
  {
    date: '2024-04-26',
    precioOliva: 4.1,
    rendimiento: 82,
    lluvias: 24,
    cosechaAnterior: 2990,
  },
  {
    date: '2024-04-27',
    precioOliva: 4.6,
    rendimiento: 90,
    lluvias: 3,
    cosechaAnterior: 3480,
  },
  {
    date: '2024-04-28',
    precioOliva: 4.3,
    rendimiento: 84,
    lluvias: 17,
    cosechaAnterior: 3080,
  },
  {
    date: '2024-04-29',
    precioOliva: 4.5,
    rendimiento: 88,
    lluvias: 7,
    cosechaAnterior: 3350,
  },
  {
    date: '2024-04-30',
    precioOliva: 4.7,
    rendimiento: 91,
    lluvias: 2,
    cosechaAnterior: 3520,
  },
  {
    date: '2024-05-01',
    precioOliva: 4.3,
    rendimiento: 85,
    lluvias: 13,
    cosechaAnterior: 3180,
  },
  {
    date: '2024-05-02',
    precioOliva: 4.5,
    rendimiento: 87,
    lluvias: 6,
    cosechaAnterior: 3320,
  },
  {
    date: '2024-05-03',
    precioOliva: 4.4,
    rendimiento: 86,
    lluvias: 10,
    cosechaAnterior: 3220,
  },
  {
    date: '2024-05-04',
    precioOliva: 4.6,
    rendimiento: 89,
    lluvias: 4,
    cosechaAnterior: 3420,
  },
  {
    date: '2024-05-05',
    precioOliva: 4.8,
    rendimiento: 92,
    lluvias: 1,
    cosechaAnterior: 3580,
  },
  {
    date: '2024-05-06',
    precioOliva: 4.9,
    rendimiento: 93,
    lluvias: 0,
    cosechaAnterior: 3620,
  },
  {
    date: '2024-05-07',
    precioOliva: 4.6,
    rendimiento: 88,
    lluvias: 5,
    cosechaAnterior: 3380,
  },
  {
    date: '2024-05-08',
    precioOliva: 4.3,
    rendimiento: 84,
    lluvias: 14,
    cosechaAnterior: 3120,
  },
  {
    date: '2024-05-09',
    precioOliva: 4.4,
    rendimiento: 85,
    lluvias: 11,
    cosechaAnterior: 3180,
  },
  {
    date: '2024-05-10',
    precioOliva: 4.5,
    rendimiento: 87,
    lluvias: 7,
    cosechaAnterior: 3300,
  },
  {
    date: '2024-05-11',
    precioOliva: 4.6,
    rendimiento: 88,
    lluvias: 6,
    cosechaAnterior: 3350,
  },
  {
    date: '2024-05-12',
    precioOliva: 4.4,
    rendimiento: 86,
    lluvias: 12,
    cosechaAnterior: 3240,
  },
  {
    date: '2024-05-13',
    precioOliva: 4.4,
    rendimiento: 85,
    lluvias: 13,
    cosechaAnterior: 3200,
  },
  {
    date: '2024-05-14',
    precioOliva: 4.7,
    rendimiento: 90,
    lluvias: 3,
    cosechaAnterior: 3480,
  },
  {
    date: '2024-05-15',
    precioOliva: 4.8,
    rendimiento: 91,
    lluvias: 2,
    cosechaAnterior: 3540,
  },
  {
    date: '2024-05-16',
    precioOliva: 4.6,
    rendimiento: 88,
    lluvias: 8,
    cosechaAnterior: 3400,
  },
  {
    date: '2024-05-17',
    precioOliva: 4.9,
    rendimiento: 93,
    lluvias: 1,
    cosechaAnterior: 3600,
  },
  {
    date: '2024-05-18',
    precioOliva: 4.5,
    rendimiento: 87,
    lluvias: 9,
    cosechaAnterior: 3320,
  },
  {
    date: '2024-05-19',
    precioOliva: 4.4,
    rendimiento: 85,
    lluvias: 11,
    cosechaAnterior: 3180,
  },
  {
    date: '2024-05-20',
    precioOliva: 4.3,
    rendimiento: 84,
    lluvias: 15,
    cosechaAnterior: 3120,
  },
  {
    date: '2024-05-21',
    precioOliva: 4.1,
    rendimiento: 82,
    lluvias: 21,
    cosechaAnterior: 3000,
  },
  {
    date: '2024-05-22',
    precioOliva: 4.1,
    rendimiento: 82,
    lluvias: 23,
    cosechaAnterior: 2980,
  },
  {
    date: '2024-05-23',
    precioOliva: 4.4,
    rendimiento: 86,
    lluvias: 10,
    cosechaAnterior: 3250,
  },
  {
    date: '2024-05-24',
    precioOliva: 4.5,
    rendimiento: 87,
    lluvias: 8,
    cosechaAnterior: 3300,
  },
  {
    date: '2024-05-25',
    precioOliva: 4.4,
    rendimiento: 85,
    lluvias: 12,
    cosechaAnterior: 3220,
  },
  {
    date: '2024-05-26',
    precioOliva: 4.4,
    rendimiento: 84,
    lluvias: 14,
    cosechaAnterior: 3150,
  },
  {
    date: '2024-05-27',
    precioOliva: 4.7,
    rendimiento: 90,
    lluvias: 3,
    cosechaAnterior: 3500,
  },
  {
    date: '2024-05-28',
    precioOliva: 4.4,
    rendimiento: 85,
    lluvias: 11,
    cosechaAnterior: 3200,
  },
  {
    date: '2024-05-29',
    precioOliva: 4.1,
    rendimiento: 82,
    lluvias: 22,
    cosechaAnterior: 3020,
  },
  {
    date: '2024-05-30',
    precioOliva: 4.6,
    rendimiento: 88,
    lluvias: 6,
    cosechaAnterior: 3380,
  },
  {
    date: '2024-05-31',
    precioOliva: 4.3,
    rendimiento: 84,
    lluvias: 15,
    cosechaAnterior: 3150,
  },
  {
    date: '2024-06-01',
    precioOliva: 4.3,
    rendimiento: 84,
    lluvias: 13,
    cosechaAnterior: 3180,
  },
  {
    date: '2024-06-02',
    precioOliva: 4.8,
    rendimiento: 91,
    lluvias: 2,
    cosechaAnterior: 3520,
  },
  {
    date: '2024-06-03',
    precioOliva: 4.2,
    rendimiento: 83,
    lluvias: 18,
    cosechaAnterior: 3080,
  },
  {
    date: '2024-06-04',
    precioOliva: 4.7,
    rendimiento: 90,
    lluvias: 4,
    cosechaAnterior: 3480,
  },
  {
    date: '2024-06-05',
    precioOliva: 4.1,
    rendimiento: 82,
    lluvias: 24,
    cosechaAnterior: 3000,
  },
  {
    date: '2024-06-06',
    precioOliva: 4.5,
    rendimiento: 86,
    lluvias: 9,
    cosechaAnterior: 3280,
  },
  {
    date: '2024-06-07',
    precioOliva: 4.5,
    rendimiento: 88,
    lluvias: 7,
    cosechaAnterior: 3350,
  },
  {
    date: '2024-06-08',
    precioOliva: 4.6,
    rendimiento: 89,
    lluvias: 5,
    cosechaAnterior: 3420,
  },
  {
    date: '2024-06-09',
    precioOliva: 4.7,
    rendimiento: 90,
    lluvias: 3,
    cosechaAnterior: 3500,
  },
  {
    date: '2024-06-10',
    precioOliva: 4.3,
    rendimiento: 84,
    lluvias: 16,
    cosechaAnterior: 3140,
  },
  {
    date: '2024-06-11',
    precioOliva: 4.2,
    rendimiento: 82,
    lluvias: 20,
    cosechaAnterior: 3050,
  },
  {
    date: '2024-06-12',
    precioOliva: 4.9,
    rendimiento: 92,
    lluvias: 1,
    cosechaAnterior: 3580,
  },
  {
    date: '2024-06-13',
    precioOliva: 4.1,
    rendimiento: 82,
    lluvias: 23,
    cosechaAnterior: 3010,
  },
  {
    date: '2024-06-14',
    precioOliva: 4.7,
    rendimiento: 89,
    lluvias: 4,
    cosechaAnterior: 3450,
  },
  {
    date: '2024-06-15',
    precioOliva: 4.5,
    rendimiento: 87,
    lluvias: 8,
    cosechaAnterior: 3320,
  },
  {
    date: '2024-06-16',
    precioOliva: 4.6,
    rendimiento: 88,
    lluvias: 6,
    cosechaAnterior: 3380,
  },
  {
    date: '2024-06-17',
    precioOliva: 4.8,
    rendimiento: 91,
    lluvias: 2,
    cosechaAnterior: 3540,
  },
  {
    date: '2024-06-18',
    precioOliva: 4.2,
    rendimiento: 83,
    lluvias: 19,
    cosechaAnterior: 3100,
  },
  {
    date: '2024-06-19',
    precioOliva: 4.6,
    rendimiento: 88,
    lluvias: 7,
    cosechaAnterior: 3380,
  },
  {
    date: '2024-06-20',
    precioOliva: 4.7,
    rendimiento: 90,
    lluvias: 4,
    cosechaAnterior: 3480,
  },
  {
    date: '2024-06-21',
    precioOliva: 4.3,
    rendimiento: 84,
    lluvias: 14,
    cosechaAnterior: 3160,
  },
  {
    date: '2024-06-22',
    precioOliva: 4.5,
    rendimiento: 87,
    lluvias: 9,
    cosechaAnterior: 3300,
  },
  {
    date: '2024-06-23',
    precioOliva: 4.8,
    rendimiento: 91,
    lluvias: 2,
    cosechaAnterior: 3550,
  },
  {
    date: '2024-06-24',
    precioOliva: 4.3,
    rendimiento: 83,
    lluvias: 17,
    cosechaAnterior: 3120,
  },
  {
    date: '2024-06-25',
    precioOliva: 4.3,
    rendimiento: 84,
    lluvias: 16,
    cosechaAnterior: 3140,
  },
  {
    date: '2024-06-26',
    precioOliva: 4.7,
    rendimiento: 89,
    lluvias: 5,
    cosechaAnterior: 3450,
  },
  {
    date: '2024-06-27',
    precioOliva: 4.7,
    rendimiento: 90,
    lluvias: 3,
    cosechaAnterior: 3500,
  },
  {
    date: '2024-06-28',
    precioOliva: 4.3,
    rendimiento: 84,
    lluvias: 15,
    cosechaAnterior: 3150,
  },
  {
    date: '2024-06-29',
    precioOliva: 4.2,
    rendimiento: 83,
    lluvias: 18,
    cosechaAnterior: 3100,
  },
  {
    date: '2024-06-30',
    precioOliva: 4.7,
    rendimiento: 90,
    lluvias: 4,
    cosechaAnterior: 3480,
  },
]

const chartConfig = {
  precioOliva: {
    label: 'Precio Oliva (€/kg)',
    color: '#22c55e', // Verde
  },
  rendimiento: {
    label: 'Rendimiento (%)',
    color: '#3b82f6', // Azul
  },
  lluvias: {
    label: 'Lluvias (mm)',
    color: '#a855f7', // Púrpura
  },
  cosechaAnterior: {
    label: 'Cosecha Anterior (kg)',
    color: '#f59e0b', // Naranja
  },
} satisfies ChartConfig

type MetricKey = 'precioOliva' | 'rendimiento' | 'lluvias' | 'cosechaAnterior'

const metricOptions: { key: MetricKey; label: string }[] = [
  { key: 'precioOliva', label: 'Precio Oliva' },
  { key: 'rendimiento', label: 'Rendimiento' },
  { key: 'lluvias', label: 'Lluvias' },
  { key: 'cosechaAnterior', label: 'Cosecha Anterior' },
]

export function ChartAreaInteractive() {
  const [timeRange, setTimeRange] = React.useState('1y')
  const [visibleMetrics, setVisibleMetrics] = React.useState<MetricKey[]>([
    'precioOliva',
    'rendimiento',
    'lluvias',
    'cosechaAnterior',
  ])

  const toggleMetric = (metric: MetricKey) => {
    setVisibleMetrics((prev) =>
      prev.includes(metric)
        ? prev.filter((m) => m !== metric)
        : [...prev, metric]
    )
  }

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date('2024-06-30')
    let daysToSubtract = 365 // 1 año por defecto
    if (timeRange === '5y') {
      daysToSubtract = 365 * 5
    } else if (timeRange === '3y') {
      daysToSubtract = 365 * 3
    } else if (timeRange === '1y') {
      daysToSubtract = 365
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="pt-0">
      <CardHeader className="space-y-4 border-b py-5">
        <div className="flex items-center gap-2 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle>Datos Agrícolas - Histórico</CardTitle>
            <CardDescription>
              Métricas de la parcela a lo largo del tiempo
            </CardDescription>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="w-[160px] rounded-lg"
              aria-label="Seleccionar periodo"
            >
              <SelectValue placeholder="Último año" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="5y" className="rounded-lg">
                Últimos 5 años
              </SelectItem>
              <SelectItem value="3y" className="rounded-lg">
                Últimos 3 años
              </SelectItem>
              <SelectItem value="1y" className="rounded-lg">
                Último año
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Selecciona las métricas:
          </span>
          {metricOptions.map((metric) => {
            const isActive = visibleMetrics.includes(metric.key)
            return (
              <button
                key={metric.key}
                onClick={() => toggleMetric(metric.key)}
                className={`
                  inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium
                  transition-all duration-200 ease-in-out
                  hover:scale-[1.02] active:scale-95
                  ${
                    isActive
                      ? 'bg-secondary text-secondary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }
                `}
              >
                <div
                  className="h-2 w-2 rounded-full transition-all"
                  style={{
                    backgroundColor: isActive
                      ? chartConfig[metric.key].color
                      : 'currentColor',
                    opacity: isActive ? 1 : 0.4,
                  }}
                />
                {metric.label}
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[400px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={filteredData}
            margin={{
              top: 24,
              left: 24,
              right: 24,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString('es-ES', {
                  month: 'short',
                  day: 'numeric',
                })
              }}
            />
            <YAxis
              yAxisId="precioOliva"
              orientation="left"
              tickLine={false}
              axisLine={false}
              domain={[3.5, 5.5]}
              hide
            />
            <YAxis
              yAxisId="rendimiento"
              orientation="left"
              tickLine={false}
              axisLine={false}
              domain={[75, 100]}
              hide
            />
            <YAxis
              yAxisId="lluvias"
              orientation="right"
              tickLine={false}
              axisLine={false}
              domain={[0, 30]}
              hide
            />
            <YAxis
              yAxisId="cosechaAnterior"
              orientation="right"
              tickLine={false}
              axisLine={false}
              domain={[2800, 3800]}
              hide
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('es-ES', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  }}
                  indicator="line"
                />
              }
            />
            {visibleMetrics.includes('cosechaAnterior') && (
              <Line
                yAxisId="cosechaAnterior"
                dataKey="cosechaAnterior"
                type="natural"
                stroke="var(--color-cosechaAnterior)"
                strokeWidth={2}
                dot={false}
              />
            )}
            {visibleMetrics.includes('rendimiento') && (
              <Line
                yAxisId="rendimiento"
                dataKey="rendimiento"
                type="natural"
                stroke="var(--color-rendimiento)"
                strokeWidth={2}
                dot={false}
              />
            )}
            {visibleMetrics.includes('lluvias') && (
              <Line
                yAxisId="lluvias"
                dataKey="lluvias"
                type="natural"
                stroke="var(--color-lluvias)"
                strokeWidth={2}
                dot={false}
              />
            )}
            {visibleMetrics.includes('precioOliva') && (
              <Line
                yAxisId="precioOliva"
                dataKey="precioOliva"
                type="natural"
                stroke="var(--color-precioOliva)"
                strokeWidth={2}
                dot={false}
              />
            )}
            <ChartLegend content={<ChartLegendContent />} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
