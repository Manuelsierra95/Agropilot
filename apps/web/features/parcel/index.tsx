"use client"

import * as React from "react"

import { DashboardPageContainer } from "@/components/ui/dashboard-page-container"
import { mockParcels } from "@/store/mockParcels"
import {
  parcelWeatherByParcelId,
  type ParcelWeatherResult,
} from "@/store/parcel-weather.mock"
import { useParcelStore } from "@/store/useParcelStore"

import { ParcelAllView } from "./components/parcel-all-view"
import { ParcelHero } from "./components/parcel-hero"
import { ParcelSingleView } from "./components/parcel-single-view"
import type {
  AllModeSummary,
  ParcelApiResponse,
  ParcelComparisonItem,
  ParcelItem,
} from "./components/parcel-types"
import { ParcelIntelligenceWidget } from "./components/parcel-intelligence-widget"

/**
 * TODO: Implementar endpoint real de riesgos
 *
 * GET /api/parcels/:id/risks
 *
 * El backend debe calcular y devolver un objeto con esta estructura
 * (ver ParcelApiRiskDetail en parcel-types.ts):
 *
 * Reglas de negocio:
 *   - recommendation === null/undefined  →  level === "low"
 *   - recommendation presente            →  level === "medium" | "high"
 *   - urgency puede diferir de level:
 *       ej. level=medium + urgency=high si la ventana de actuación es corta
 *   - window solo si hay un plazo concreto (omitir si es "vigilar indefinidamente")
 *   - actions[] mínimo 1 elemento cuando hay recommendation
 *   - payload en cada action → prefill del formulario en el cliente
 *       ej. { suggestedAmountMm: 18, reason: "déficit acumulado 7d" }
 *
 * Cuando esté listo:
 *   1. Eliminar buildParcelApiResponse() de page.tsx
 *   2. Sustituir por fetch(`/api/parcels/${parcelId}/risks`)
 *   3. El tipo ParcelApiResponse ya encaja — no hay cambios en el frontend
 */

function buildParcelApiResponse(
  activeParcel: ParcelItem,
  weather: ParcelWeatherResult
): ParcelApiResponse {
  const dailyData = weather.daily.map((entry) => ({
    date: entry.date,
    icon: entry.precipitation > 0 ? "rainy" : "sunny",
    tempMin: entry.tempMin,
    tempMax: entry.tempMax,
    precipitation: entry.precipitation,
    waterBalance: entry.waterBalance ?? 0,
    hasWaterDeficit: (entry.waterBalance ?? 0) < 0,
  }))

  return {
    request: {
      parcelId: "OLIVAR-DEMO-001",
      coords: {
        lat: 37.7656,
        lng: -3.7743,
      },
      cropType: activeParcel.type.toLowerCase(),
      cropName: activeParcel.type,
      days: 30,
    },
    summary: {
      stationId: "5270B",
      lastUpdate: "2026-04-09T16:50:21.096Z",
    },
    dataRange: {
      start: dailyData[0]?.date ?? "",
      end: dailyData.at(-1)?.date ?? "",
    },
    daily: {
      data: dailyData,
      recent: dailyData.slice(-5),
    },
    metrics: {
      water: {
        deficit7d: -21,
        deficit15d: -37.2,
        deficit30d: -57.6,
        eto7d: 31.1,
        eto30d: 92.5,
      },
      temperature: {
        avg7d: 16.8,
        avg30d: 14.4,
        trend: 4,
        heatStressDays: 0,
        coldStressDays: 0,
      },
      rain: {
        rain7d: 0,
        rain30d: 0.2,
        trend: 0,
        dryDaysConsecutive: 27,
        dryDays7d: 7,
      },
      crop: {
        gdd: 206,
        gdd30d: 120.5,
        kc: 0.55,
        stage: "Brotación activa",
        isCritical: false,
      },
      environment: {
        humidityAvg7d: 34,
        humidityAvg30d: 48.3,
        variabilityIndex: 0.11,
      },
    },
    risks: {
      waterStress: {
        level: "medium",
        score: 0.5,
        reasons: [
          "Deficit hidrico ponderado 7d: -3.20 mm/dia",
          "Kc fenologico aplicado: 0.55",
        ],
        recommendation: {
          title: "Riego de apoyo recomendado",
          description:
            "El déficit acumulado supera el umbral tolerable para la fase de brotación. Sin intervención puede comprometer el cuajado.",
          urgency: "medium",
          window: "48-72h",
          actions: [
            {
              type: "irrigation",
              label: "Programar riego",
              payload: {
                suggestedAmountMm: 18,
                reason: "déficit acumulado 7d",
              },
            },
          ],
        },
      },
      fungalRisk: {
        level: "low",
        score: 0.18,
        reasons: [
          "Temperatura favorable para hongos (16.8 C)",
          "HR media < 55%: techo de riesgo LOW activado",
          "Precipitacion acumulada 30d: 0.2 mm",
        ],
      },
      insectRisk: {
        level: "low",
        score: 0.22,
        reasons: [
          "Sequedad extrema limita actividad de insectos",
          "HR media < 55%: techo de riesgo LOW activado",
          "Sin registros de capturas en las ultimas 2 semanas",
        ],
      },
      thermalStress: {
        level: "low",
        score: 0.12,
        reasons: [
          "Media 7d dentro del rango optimo (16.8 C)",
          "Sin dias de estres termico en la ultima semana",
          "Amplitud termica estable (<= 12 C)",
        ],
      },
    },
    units: {
      daily: {
        tempMin: "C",
        tempMax: "C",
        precipitation: "mm",
        waterBalance: "mm",
      },
      metrics: {
        water: {
          deficit7d: "mm",
          deficit15d: "mm",
          deficit30d: "mm",
          eto7d: "mm",
          eto30d: "mm",
        },
        temperature: {
          avg7d: "C",
          avg30d: "C",
          trend: "C",
          heatStressDays: "days",
          coldStressDays: "days",
        },
        rain: {
          rain7d: "mm",
          rain30d: "mm",
          trend: "mm",
          dryDaysConsecutive: "days",
          dryDays7d: "days",
        },
        crop: {
          gdd: "GDD",
          gdd30d: "GDD",
          kc: "ratio",
        },
        environment: {
          humidityAvg7d: "%",
          humidityAvg30d: "%",
          variabilityIndex: "0-1",
        },
      },
      risks: {
        score: "0-1",
      },
    },
    recommendations: [
      {
        type: "irrigation",
        priority: "medium",
        message: "Preparar riego para proximos dias",
        details: "Monitor deficit: -21.0mm",
      },
    ],
  }
}

// Mock data para el widget de inteligencia de parcela
const mockIntelligenceData = {
  name: "Olivar",
  coordinates: {
    lat: 37.7656,
    lng: -3.7743,
  },
  stationId: "5270B",
  cropType: "Olivar",
  area: 12.5,
  lastUpdate: new Date("2026-04-09T18:50:00"),

  temperature: 22.4,
  temperatureChange: 3.2,
  phenologicalStage: "Brotación",

  gdd: 312,
  kc: 0.85,
  waterBalance: 90,
  estimatedProfitability: 1240,
  participants: 5,
  pendingTasks: 4,
  completedTasks: 1,

  // Rendimiento: 300 olivas producen 300kg = 1 kg/oliva
  totalTrees: 300,
  totalYieldKg: 300,
}

export default function Parcel() {
  const parcelId = useParcelStore((state) => state.parcelId)
  const isAllSelected = parcelId === "all"

  const selectedParcel = React.useMemo<ParcelItem | undefined>(() => {
    if (isAllSelected) return undefined
    return mockParcels.find((parcel) => parcel.id === parcelId)
  }, [isAllSelected, parcelId])

  const activeParcel = selectedParcel ?? mockParcels[0]

  const weather = React.useMemo(() => {
    if (!activeParcel || isAllSelected) return undefined
    return parcelWeatherByParcelId[activeParcel.id]
  }, [activeParcel, isAllSelected])

  const parcelApiResponse = React.useMemo(() => {
    if (isAllSelected || !activeParcel || !weather) return undefined
    return buildParcelApiResponse(activeParcel, weather)
  }, [activeParcel, isAllSelected, weather])

  const parcelComparisonData = React.useMemo<ParcelComparisonItem[]>(() => {
    return mockParcels.map((parcel) => {
      const parcelWeather = parcelWeatherByParcelId[parcel.id]
      return {
        name: parcel.name.replace("Parcela ", "").replace("Olivar ", ""),
        area: parcel.area,
        rain30d: parcelWeather?.metrics.rain30d ?? 0,
        tempAvg: parcelWeather?.metrics.tempAvg ?? 0,
        waterDeficit30d: parcelWeather?.metrics.waterDeficit30d ?? 0,
        dryDaysConsecutive: parcelWeather?.metrics.dryDaysConsecutive ?? 0,
        heatStressDays: parcelWeather?.metrics.heatStressDays ?? 0,
        waterStress: parcelWeather?.risks.waterStress ?? "low",
      }
    })
  }, [])

  const allModeSummary = React.useMemo<AllModeSummary>(() => {
    const totalArea = parcelComparisonData.reduce(
      (acc, item) => acc + item.area,
      0
    )
    const avgRain30d =
      parcelComparisonData.length > 0
        ? parcelComparisonData.reduce((acc, item) => acc + item.rain30d, 0) /
          parcelComparisonData.length
        : 0
    const avgTemp =
      parcelComparisonData.length > 0
        ? parcelComparisonData.reduce((acc, item) => acc + item.tempAvg, 0) /
          parcelComparisonData.length
        : 0
    const highWaterStressCount = parcelComparisonData.filter(
      (item) => item.waterStress === "high"
    ).length

    const maxDry = [...parcelComparisonData].sort(
      (a, b) => b.dryDaysConsecutive - a.dryDaysConsecutive
    )[0]
    const maxDeficit = [...parcelComparisonData].sort(
      (a, b) => b.waterDeficit30d - a.waterDeficit30d
    )[0]

    return {
      totalArea,
      avgRain30d,
      avgTemp,
      highWaterStressCount,
      maxDry,
      maxDeficit,
    }
  }, [parcelComparisonData])

  if (!activeParcel) {
    return (
      <DashboardPageContainer className="border">
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          No hay datos de parcelas disponibles.
        </div>
      </DashboardPageContainer>
    )
  }

  if (!isAllSelected && !weather) {
    return (
      <DashboardPageContainer className="border">
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          No hay datos climáticos para la parcela seleccionada.
        </div>
      </DashboardPageContainer>
    )
  }

  const metrics = weather?.metrics
  const risks = weather?.risks
  const daily = weather?.daily

  return (
    <DashboardPageContainer className="gap-4">
      <ParcelHero
        isAllSelected={isAllSelected}
        activeParcel={activeParcel}
        allModeSummary={allModeSummary}
        risks={risks}
        apiResponse={parcelApiResponse}
        // Mock
        income={1240}
        trend="up"
        employeeCount={5}
        tasksPending={2}
        tasksInProgress={3}
        yieldData={{ trees: 300, totalKg: 300 }}
      />

      {/* <ParcelIntelligenceWidget data={mockIntelligenceData} /> */}

      {!isAllSelected && daily && metrics ? (
        <ParcelSingleView
          activeParcel={activeParcel}
          daily={daily}
          metrics={metrics}
          apiResponse={parcelApiResponse}
        />
      ) : (
        <ParcelAllView
          parcelComparisonData={parcelComparisonData}
          allModeSummary={allModeSummary}
        />
      )}
    </DashboardPageContainer>
  )
}
