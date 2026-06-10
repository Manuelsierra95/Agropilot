"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Progress } from "@workspace/ui/components/progress"
import { Separator } from "@workspace/ui/components/separator"
import { MapPin, Leaf, Activity, MessageCircle, ArrowRight } from "lucide-react"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import { useSidebar } from "@workspace/ui/components/sidebar"
import { cn } from "@workspace/ui/lib/utils"
import { HighlightedText } from "@/lib/highlight-text"
import { useState, useCallback } from "react"
import Link from "next/link"
import { GradientSeparator } from "@/components/ui/gradient-separator"

interface OlivarData {
  name: string
  coordinates: {
    lat: number
    lng: number
  }
  stationId: string
  cropType: string
  area: number
  lastUpdate: Date
  temperature: number
  temperatureChange: number
  phenologicalStage: string
  gdd: number
  gddTarget: number
  kc: number
  waterBalance: number
  estimatedProfitability: number
  participants: number
  pendingTasks: number
  completedTasks: number
  totalTrees: number
  totalYieldKg: number
  aiInsight: string
}

interface ResumeCropProps {
  data: OlivarData
  onAskAI?: (context: OlivarData) => void
  className?: string
}

export function ResumeCrop({ data, onAskAI, className }: ResumeCropProps) {
  const { open, toggleSidebar } = useSidebar()

  const yieldPerTree =
    data.totalTrees > 0 ? data.totalYieldKg / data.totalTrees : 0
  const gddPct = Math.min((data.gdd / data.gddTarget) * 100, 100)
  const gddRemaining = data.gddTarget - data.gdd

  const [isClamped, setIsClamped] = useState(false)

  const insightRef = useCallback(
    (node: HTMLParagraphElement | null) => {
      if (node) setIsClamped(node.scrollHeight > 256)
    },
    [data.aiInsight]
  )

  return (
    <Card
      className={cn(
        "@container/resume-crop w-full min-w-0 bg-background ring-0",
        className
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl">{data.name}</CardTitle>
            <CardDescription className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              <span>
                {data.coordinates.lat.toFixed(4)},{" "}
                {data.coordinates.lng.toFixed(4)}
              </span>
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="text-right">
              <p className="text-2xl font-medium tabular-nums">
                {data.temperature}°C
              </p>
              <p className="mt-0.5 font-mono text-xs text-green-500">
                +{data.temperatureChange}°
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Badge variant="outline" className="font-mono text-xs">
            {data.coordinates.lat.toFixed(2)}, {data.coordinates.lng.toFixed(2)}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Leaf className="h-3 w-3" />
            {data.cropType}
          </Badge>
          <Badge variant="outline">{data.area} ha</Badge>
        </div>
      </CardHeader>

      <div className="grid min-w-0 grid-cols-2 items-start gap-4 @min-[1100px]/main:grid-cols-1">
        <CardContent className="min-w-0 space-y-4">
          <Separator />

          <div className="flex w-full flex-col items-start">
            <div className="flex w-full items-center justify-between">
              <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
                Fase fenológica
              </p>
              <p className="text-lg font-medium">{data.phenologicalStage}</p>
            </div>

            <div className="w-full space-y-2 py-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  GDD acumulado
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {data.gdd} / {data.gddTarget}
                </span>
              </div>
              <Progress value={gddPct} className="h-[3px]" />
              <p className="text-[11px] text-muted-foreground">
                {gddRemaining <= 0
                  ? "✓ Objetivo alcanzado"
                  : `Faltan ${gddRemaining} GDD para fin de fase`}
              </p>
            </div>
            <Separator />
          </div>

          <div className="flex items-center justify-between">
            <div className="pr-4">
              <p className="mb-1 text-[11px] text-muted-foreground">
                Rendimiento
              </p>
              <p className="text-base font-medium tabular-nums">
                {yieldPerTree.toFixed(1)}
                <span className="ml-1 text-[11px] font-normal text-muted-foreground">
                  kg/árbol
                </span>
              </p>
            </div>

            <GradientSeparator orientation="vertical" />

            <div className="px-4">
              <p className="mb-1 text-[11px] text-muted-foreground">Kc</p>
              <p className="text-base font-medium tabular-nums">{data.kc}</p>
            </div>

            <GradientSeparator orientation="vertical" />

            <div className="pl-4">
              <p className="mb-1 text-[11px] text-muted-foreground">
                Balance hídrico
              </p>
              <p className="text-base font-medium tabular-nums">
                {data.waterBalance}%
              </p>
            </div>
          </div>

          <div className="hidden xl:block">
            <Separator />
          </div>
        </CardContent>

        <CardFooter className="min-w-0 border-0 bg-background px-4 pt-0">
          <div className="w-full min-w-0 space-y-4">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Activity className="h-3.5 w-3.5" />
                Análisis IA
              </p>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="-mr-2 h-7 text-xs"
                onClick={() => {
                  if (!open) toggleSidebar()
                  onAskAI?.(data)
                }}
              >
                <MessageCircle className="mr-1 h-3 w-3" />
                Preguntar IA
              </Button>
            </div>

            <div
              className={cn(
                "relative",
                isClamped &&
                  "max-h-[280px] overflow-hidden mask-b-from-50% mask-b-to-100% @min-[1100px]/main:max-h-[350px]"
              )}
            >
              <p
                ref={insightRef}
                className="flex-1 text-xl leading-snug text-pretty text-muted-foreground"
              >
                <HighlightedText text={data.aiInsight} />
              </p>
            </div>

            {isClamped && (
              <div className="flex h-1/5 items-center justify-center bg-background mask-t-from-30%">
                <Link
                  href="/analisis-ia"
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "relative"
                  )}
                >
                  Ver análisis completo
                  <ArrowRight aria-hidden="true" />
                </Link>
              </div>
            )}
          </div>
        </CardFooter>
      </div>
    </Card>
  )
}
