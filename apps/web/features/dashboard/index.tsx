import { DashboardPageContainer } from "@/components/ui/dashboard-page-container"
import { GradientSeparator } from "@/components/ui/gradient-separator"

import { OlivePrice } from "@/features/dashboard/olive-price"
import { ResumeCrop } from "@/features/dashboard/resume-crop"
import { FinanceResume } from "@/features/dashboard/finance-resume"
import { CampaignAccumulatedMargin } from "@/features/dashboard/campaign-accumulated-margin"
import { Recommendations } from "@/features/dashboard/recommendations"
import { DashboardMap } from "@/features/dashboard/map"
import { RiskRadar } from "@/features/dashboard/risk-radar"
import { RecentEvents } from "@/features/dashboard/recent-events"
import { RecentTransactions } from "@/features/dashboard/recent-transactions"
import { SellingWindow } from "@/features/dashboard/selling-window"

import { ComparativeAreaChart } from "@/components/charts/comparative-area-chart"
import { mockTransactions } from "@/store/mockTransactions"
import { ParcelApiResponse } from "../parcel/components/parcel-types"
import { calendarMockData } from "@/lib/calendar-mock"
import { CampaignPredictionsCard } from "@/components/cards/campaign-predictions-card"
import { ProductionValue } from "@/features/dashboard/production-value"

export const dashboardTransactions = mockTransactions.map(
  ({ type, category, amount, paymentMethod, invoiceNumber, date }) => ({
    type,
    category,
    amount,
    paymentMethod,
    invoiceNumber,
    date,
  })
)

export const dashboardRiskSummary = {
  risks: {
    waterStress: {
      level: "medium",
      score: 0.55,
      reasons: [
        "Deficit hidrico ponderado 7d: -3.2 mm/dia",
        "Kc fenologico aplicado: 0.55",
      ],
    },
    fungalRisk: {
      level: "low",
      score: 0.2,
      reasons: ["Temperatura media estable: 18.2 C", "Humedad relativa < 55%"],
    },
    insectRisk: {
      level: "low",
      score: 0.12,
      reasons: [
        "Dias secos consecutivos: 5",
        "Baja actividad de plagas reportada",
      ],
    },
    thermalStress: {
      level: "medium",
      score: 0.44,
      reasons: ["Picos > 30 C en 48h", "Amplitud termica alta"],
    },
  },
} satisfies Pick<ParcelApiResponse, "risks">

export const dashboardPriceKpis = [
  {
    name: "Virgen Extra",
    price: 5.42,
    priceMin: 4.8,
    priceMax: 6.1,
    unit: "€/kg",
    updatedAt: "2026-04-09",
    history: [
      { date: "2026-04-11", price: 4.98 },
      { date: "2026-04-13", price: 5.05 },
      { date: "2026-04-15", price: 4.92 },
      { date: "2026-04-17", price: 5.1 },
      { date: "2026-04-19", price: 5.18 },
      { date: "2026-04-21", price: 5.08 },
      { date: "2026-04-23", price: 5.22 },
      { date: "2026-04-25", price: 5.3 },
      { date: "2026-04-27", price: 5.25 },
      { date: "2026-04-29", price: 5.35 },
      { date: "2026-05-01", price: 5.28 },
      { date: "2026-05-03", price: 5.38 },
      { date: "2026-05-05", price: 5.31 },
      { date: "2026-05-07", price: 5.4 },
      { date: "2026-05-09", price: 5.42 },
    ],
  },
  {
    name: "Virgen",
    price: 4.85,
    priceMin: 4.1,
    priceMax: 5.5,
    unit: "€/kg",
    updatedAt: "2026-04-09",
    history: [
      { date: "2026-04-11", price: 4.4 },
      { date: "2026-04-13", price: 4.35 },
      { date: "2026-04-15", price: 4.48 },
      { date: "2026-04-17", price: 4.52 },
      { date: "2026-04-19", price: 4.44 },
      { date: "2026-04-21", price: 4.58 },
      { date: "2026-04-23", price: 4.62 },
      { date: "2026-04-25", price: 4.55 },
      { date: "2026-04-27", price: 4.68 },
      { date: "2026-04-29", price: 4.72 },
      { date: "2026-05-01", price: 4.65 },
      { date: "2026-05-03", price: 4.75 },
      { date: "2026-05-05", price: 4.7 },
      { date: "2026-05-07", price: 4.8 },
      { date: "2026-05-09", price: 4.85 },
    ],
  },
  {
    name: "Lampante",
    price: 0.78,
    priceMin: 0.55,
    priceMax: 0.95,
    unit: "€/kg",
    updatedAt: "2026-04-09",
    history: [
      { date: "2026-04-11", price: 0.58 },
      { date: "2026-04-13", price: 0.61 },
      { date: "2026-04-15", price: 0.59 },
      { date: "2026-04-17", price: 0.63 },
      { date: "2026-04-19", price: 0.66 },
      { date: "2026-04-21", price: 0.64 },
      { date: "2026-04-23", price: 0.68 },
      { date: "2026-04-25", price: 0.65 },
      { date: "2026-04-27", price: 0.7 },
      { date: "2026-04-29", price: 0.72 },
      { date: "2026-05-01", price: 0.69 },
      { date: "2026-05-03", price: 0.74 },
      { date: "2026-05-05", price: 0.71 },
      { date: "2026-05-07", price: 0.76 },
      { date: "2026-05-09", price: 0.78 },
    ],
  },
]

const olivarData = {
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
  gddTarget: 380,
  kc: 0.85,
  waterBalance: 90,
  estimatedProfitability: 1240,
  participants: 5,
  pendingTasks: 4,
  completedTasks: 1,

  totalTrees: 300,
  totalYieldKg: 300,

  aiInsight:
    "Producción estimada **+3.5%** frente a campaña anterior. Déficit hídrico acumulado en zona norte — **riego de apoyo recomendado**.",
}

const risksRecomendations = {
  recommendations: [
    {
      type: "irrigation",
      priority: "high",
      message: "Riego de apoyo recomendado",
      details: "Deficit acumulado 7d > 25 mm en Olivar La Loma.",
    },
    {
      type: "inspection",
      priority: "medium",
      message: "Inspeccion preventiva de plagas",
      details: "Capturas elevadas en trampas durante las ultimas 48h.",
    },
    {
      type: "treatment",
      priority: "low",
      message: "Aplicar cobre preventivo",
      details: "Condiciones favorables para repilo la proxima semana.",
    },
  ],
} satisfies Pick<ParcelApiResponse, "recommendations">

// ---------------------------------------------------------------------------
// Mock data — campaña 2024/25, olivar andaluz, 420 olivos
// Rango Oct → Sep (12 meses)
// ---------------------------------------------------------------------------

export const productionValue = {
  lonjaPrice: 0.68,
  numOlivos: 420,
  campaignStartYear: 2024,
  // Distribución realista de cosecha en olivar andaluz
  // Pico en Nov-Dic, cola larga hasta Mar, meses secos Abr-Sep
  monthlyProductionKg: [
    1_200, // Oct
    14_800, // Nov
    31_500, // Dic
    19_200, // Ene
    8_400, // Feb
    2_900, // Mar
    0, // Abr
    0, // May
    0, // Jun
    0, // Jul
    0, // Ago
    0, // Sep
  ],
  prevMonthlyProductionKg: [
    900, // Oct
    12_100, // Nov
    26_800, // Dic
    16_400, // Ene
    6_900, // Feb
    2_200, // Mar
    0, // Abr
    0, // May
    0, // Jun
    0, // Jul
    0, // Ago
    0, // Sep
  ],
}

export default function DashboardOverview() {
  return (
    <DashboardPageContainer className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[1fr_auto_1fr_auto_1fr]">
      <GradientSeparator
        orientation="vertical"
        className="col-start-4 row-span-6 row-start-1"
      />

      {/* Row 1 */}
      <div className="col-span-3 col-start-1 row-start-1 flex gap-4">
        <OlivePrice className="flex-2" items={dashboardPriceKpis} />
        <GradientSeparator orientation="vertical" />
        <SellingWindow
          className="flex-1"
          lonjaPrice={5.42}
          costPerKg={3.8}
          lastSalePrice={5.1}
          estimatedKg={18500}
          campaignTarget={5.5}
        />
      </div>

      <GradientSeparator
        orientation="horizontal"
        className="col-span-3 col-start-1 row-start-2"
      />

      <ResumeCrop
        className="col-start-5 row-span-3 row-start-1"
        data={olivarData}
      />

      {/* Row 2 */}
      <FinanceResume
        className="col-start-1 row-start-3"
        transactions={dashboardTransactions}
        oils={dashboardPriceKpis}
        previousCampaign={{
          totalIncome: 8500,
          totalExpenses: 6200,
        }}
      />

      <GradientSeparator
        orientation="vertical"
        className="col-start-2 row-start-3"
      />

      <CampaignAccumulatedMargin className="col-start-3 row-start-3" />

      {/* Separador horizontal */}
      <GradientSeparator
        orientation="horizontal"
        className="col-span-3 col-start-1 row-start-4"
      />

      {/* Row 3 - EventsList | DashboardMap | RiskRadar */}
      <div className="col-span-3 col-start-1 row-start-5 flex gap-4">
        <Recommendations className="flex-1" data={risksRecomendations} />
        <GradientSeparator orientation="vertical" />
        <DashboardMap className="flex-[2.5]" />
      </div>

      <GradientSeparator
        orientation="horizontal"
        className="col-start-5 row-start-4"
      />

      <RiskRadar
        className="col-start-5 row-start-5"
        apiResponse={dashboardRiskSummary}
      />

      <GradientSeparator
        orientation="horizontal"
        className="col-span-5 col-start-1 row-start-6"
      />

      {/* Row 4 */}
      <div className="col-span-5 col-start-1 row-start-7 flex w-full gap-4">
        <RecentEvents className="flex-1" data={calendarMockData} />
        <GradientSeparator orientation="vertical" />
        <RecentTransactions className="flex-1" data={dashboardTransactions} />
      </div>

      <GradientSeparator
        orientation="horizontal"
        className="col-span-5 col-start-1 row-start-8"
      />

      {/* Row 5 */}
      {/* <ComparativeAreaChart className="col-span-5 col-start-1 row-start-9" /> */}

      {/* <CampaignPredictionsCard className="col-span-5 col-start-1 row-start-9" /> */}

      <ProductionValue
        {...productionValue}
        className="col-span-5 col-start-1 row-start-9"
      />
    </DashboardPageContainer>
  )
}
