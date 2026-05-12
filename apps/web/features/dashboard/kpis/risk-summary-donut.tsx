// "use client"

// import * as React from "react"
// import { Label, Pie, PieChart } from "recharts"
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@workspace/ui/components/card"
// import {
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
//   type ChartConfig,
// } from "@workspace/ui/components/chart"
// import { cn } from "@workspace/ui/lib/utils"

// import type {
//   ParcelApiResponse,
//   WeatherRiskLevel,
// } from "@/features/parcel/components/parcel-types"

// type DashboardRiskDonutProps = {
//   apiResponse?: Pick<ParcelApiResponse, "risks">
//   className?: string
// }

// function getRiskHex(level: WeatherRiskLevel) {
//   if (level === "high") return "#e24b4a"
//   if (level === "medium") return "#ef9f27"
//   return "#639922"
// }

// function getGlobalLevel(score: number): WeatherRiskLevel {
//   if (score >= 60) return "high"
//   if (score >= 35) return "medium"
//   return "low"
// }

// function getGlobalLevelLabel(level: WeatherRiskLevel) {
//   if (level === "high") return "Alto"
//   if (level === "medium") return "Medio"
//   return "Bajo"
// }

// const chartConfig = {
//   score: { label: "Puntuación" },
//   track: { label: "Restante", color: "hsl(var(--muted))" },
// } satisfies ChartConfig

// export function DashboardRiskDonut({
//   apiResponse,
//   className,
// }: DashboardRiskDonutProps) {
//   const scores = apiResponse
//     ? [
//         apiResponse.risks.waterStress.score,
//         apiResponse.risks.fungalRisk.score,
//         apiResponse.risks.insectRisk.score,
//         apiResponse.risks.thermalStress.score,
//       ]
//     : [0, 0, 0, 0]

//   const avgScore = React.useMemo(
//     () =>
//       Math.round(
//         (scores.reduce((sum, s) => sum + Math.max(0, Math.min(s, 1)), 0) /
//           scores.length) *
//           100
//       ),
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     [apiResponse]
//   )

//   const globalLevel = getGlobalLevel(avgScore)
//   const riskHex = getRiskHex(globalLevel)

//   const chartData = [
//     { name: "score", value: avgScore, fill: riskHex },
//     { name: "track", value: 100 - avgScore, fill: "hsl(var(--muted))" },
//   ]

//   return (
//     <Card className={cn("flex flex-col", className)}>
//       <CardHeader className="items-center pb-0">
//         <CardTitle className="text-sm font-medium">Riesgo global</CardTitle>
//         <CardDescription className="text-xs">
//           Puntuación combinada de riesgos climáticos
//         </CardDescription>
//       </CardHeader>

//       <CardContent className="flex-1 pb-0">
//         <ChartContainer
//           config={chartConfig}
//           className="mx-auto aspect-square max-h-[250px]"
//         >
//           <PieChart>
//             <ChartTooltip
//               cursor={false}
//               content={<ChartTooltipContent hideLabel />}
//             />
//             <Pie
//               data={chartData}
//               dataKey="value"
//               nameKey="name"
//               innerRadius={60}
//               strokeWidth={5}
//               startAngle={90}
//               endAngle={-270}
//             >
//               <Label
//                 content={({ viewBox }) => {
//                   if (viewBox && "cx" in viewBox && "cy" in viewBox) {
//                     return (
//                       <text
//                         x={viewBox.cx}
//                         y={viewBox.cy}
//                         textAnchor="middle"
//                         dominantBaseline="middle"
//                       >
//                         <tspan
//                           x={viewBox.cx}
//                           y={viewBox.cy}
//                           className="fill-foreground text-3xl font-bold"
//                         >
//                           {avgScore}
//                         </tspan>
//                         <tspan
//                           x={viewBox.cx}
//                           y={(viewBox.cy || 0) + 24}
//                           className="fill-muted-foreground text-sm"
//                         >
//                           {getGlobalLevelLabel(globalLevel)}
//                         </tspan>
//                       </text>
//                     )
//                   }
//                 }}
//               />
//             </Pie>
//           </PieChart>
//         </ChartContainer>
//       </CardContent>
//     </Card>
//   )
// }

"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@workspace/ui/components/chart"

export const description = "A donut chart with text"

const chartData = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 287, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "other", visitors: 190, fill: "var(--color-other)" },
]

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "var(--chart-1)",
  },
  safari: {
    label: "Safari",
    color: "var(--chart-2)",
  },
  firefox: {
    label: "Firefox",
    color: "var(--chart-3)",
  },
  edge: {
    label: "Edge",
    color: "var(--chart-4)",
  },
  other: {
    label: "Other",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

export function DashboardRiskDonut() {
  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.visitors, 0)
  }, [])

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="items-center pb-4">
        <CardTitle>Pie Chart - Donut with Text</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="visitors"
              nameKey="browser"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalVisitors.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Visitors
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          El riesgo ha subido un 5.2% este mes{" "}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Últimos datos: {new Date().toLocaleDateString()}
        </div>
      </CardFooter>
    </Card>
  )
}
