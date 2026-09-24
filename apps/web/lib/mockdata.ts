import {
  type DashboardOverview,
  type DashboardOverviewAll,
  type DashboardOverviewSingle,
  type DashboardOlivar,
  type DashboardOlivePriceItem,
  type DashboardSellingWindow,
  type DashboardParcelsSellingWindows,
  type DashboardParcelSellingWindowItem,
  type DashboardFinanceResume,
  type DashboardCampaignMargin,
  type DashboardProductionValue,
  type DashboardTransactionSnapshot,
  type DashboardFinanceTransaction,
  type DashboardParcelsFinanceComparison,
  type DashboardParcelFinanceComparisonItem,
  type DashboardRecommendation,
  type DashboardRisks,
  type DashboardMapParcel,
  type DashboardParcelCropOverviewItem,
  type DashboardParcelAgroclimate,
  type DashboardParcelComparisonItem,
  type DashboardParcelsWeatherComparison,
  type DashboardCalendarEvent,
  type CampaignListItem,
  type ParcelSelectWithCrop,
  type ParcelSelect,
  type TransactionSelect,
  type TransactionCreateInput,
  type TransactionUpdateInput,
  type RecommendationSelect,
  type TaskCreateInput,
  type TaskUpdateInput,
  type TaskSelect,
  type ActiveOrganizationData,
  type OrganizationMember,
  type OrganizationMeResponse,
  type InvitationSelect,
  type InvitationCreateInput,
  type InvitationBulkCreateInput,
  type InvitationBulkCreateResult,
  type HarvestDeliveryListItem,
  type HarvestDeliveryCreateInput,
  type HarvestSaleCreateInput,
  type UpdateCampaignSaleTargetInput,
  type UserMeResponse,
  type BillingMeResponse,
  type DashboardScopeQuery,
} from "@workspace/schemas"
import type { DashboardScopeParams } from "@workspace/web/lib/dashboard/scope-key"

const DEMO_USER_ID = "00000000-0000-4000-8000-000000000001"
const DEMO_ORG_ID = "00000000-0000-4000-8000-000000000002"

export const DEMO_IDS = {
  userId: DEMO_USER_ID,
  organizationId: DEMO_ORG_ID,
}

const PARCEL_IDS = {
  p1: "11111111-1111-4111-8111-111111111111",
  p2: "22222222-2222-4222-8222-222222222222",
  p3: "33333333-3333-4333-8333-333333333333",
}

export const DEMO_PARCEL_IDS = PARCEL_IDS

const CAMPAIGN_IDS = {
  active: "aaaaaaaa-0000-4000-8000-000000000001",
  previous: "bbbbbbbb-0000-4000-8000-000000000002",
}

export const DEMO_CAMPAIGN_IDS = CAMPAIGN_IDS

const isoDate = (d: Date): string => d.toISOString().slice(0, 10)
const isoDateTime = (d: Date): string => d.toISOString()
const today = (): Date => new Date()
const addDays = (d: Date, days: number): Date => {
  const next = new Date(d)
  next.setDate(next.getDate() + days)
  return next
}

function generateDate(daysAgo: number): string {
  return isoDate(addDays(today(), -daysAgo))
}

function generateDateTime(daysOffset: number, hour = 9, minute = 0): string {
  const d = addDays(today(), daysOffset)
  d.setHours(hour, minute, 0, 0)
  return isoDateTime(d)
}

function generatePriceHistory(days: number, basePrice: number, volatility: number): Array<{ date: string; price: number }> {
  const history: Array<{ date: string; price: number }> = []
  const now = today()
  for (let i = days; i >= 0; i--) {
    const date = addDays(now, -i)
    const noise = (Math.sin(i * 0.7) + Math.cos(i * 0.3)) * volatility
    const price = +(basePrice + noise).toFixed(2)
    history.push({ date: isoDate(date), price })
  }
  return history
}

export const DEMO_USER: UserMeResponse = {
  id: DEMO_USER_ID,
  name: "Demo Agropilot",
  email: "demo@agropilot.dev",
  image: null,
  createdAt: new Date("2024-01-15T08:00:00Z"),
  role: "admin",
  organizationId: DEMO_ORG_ID,
  provider: "google",
  onboardingStatus: "completed",
  onboardingStep: 4,
} as unknown as UserMeResponse

export const DEMO_ORGANIZATIONS = [
  { id: DEMO_ORG_ID, name: "Olivares Sierra Mágina", logo: null, plan: "Pro" },
  {
    id: "99999999-0000-4000-8000-000000000099",
    name: "Finca La Esperanza",
    logo: null,
    plan: "Standard",
  },
] as Array<{ id: string; name: string; logo: string | null; plan: string }>

export const DEMO_ORG_DETAIL: ActiveOrganizationData = {
  organization: {
    id: DEMO_ORG_ID,
    name: "Olivares Sierra Mágina",
    slug: "olivares-sierra-magina",
    logo: null,
    createdAt: new Date("2024-01-15T08:00:00Z"),
    metadata: '{"plan":"pro"}',
    plan: "pro",
    status: "active",
  } as unknown as ActiveOrganizationData["organization"],
  member: {
    id: "member-demo-0001",
    organizationId: DEMO_ORG_ID,
    userId: DEMO_USER_ID,
    role: "owner",
    createdAt: new Date("2024-01-15T08:00:00Z"),
  },
}

const DEMO_ORG_MEMBERS: OrganizationMember[] = [
  {
    id: "member-demo-0001",
    role: "owner",
    createdAt: new Date("2024-01-15T08:00:00Z"),
    user: {
      id: DEMO_USER_ID,
      name: "Demo Agropilot",
      email: "demo@agropilot.dev",
      image: null,
    },
  },
  {
    id: "member-demo-0002",
    role: "admin",
    createdAt: new Date("2024-03-20T08:00:00Z"),
    user: {
      id: "user-demo-0002",
      name: "María Sánchez",
      email: "maria@agropilot.dev",
      image: null,
    },
  },
  {
    id: "member-demo-0003",
    role: "member",
    createdAt: new Date("2024-06-10T08:00:00Z"),
    user: {
      id: "user-demo-0003",
      name: "Juan Ortega",
      email: "juan@agropilot.dev",
      image: null,
    },
  },
  {
    id: "member-demo-0004",
    role: "viewer",
    createdAt: new Date("2024-09-01T08:00:00Z"),
    user: {
      id: "user-demo-0004",
      name: "Lucía Ramírez",
      email: "lucia@agropilot.dev",
      image: null,
    },
  },
]

export const DEMO_ORG_ME_RESPONSE: OrganizationMeResponse = {
  id: DEMO_ORG_ID,
  name: "Olivares Sierra Mágina",
  logo: null,
  plan: "pro",
  status: "active",
  createdAt: new Date("2024-01-15T08:00:00Z"),
  viewerRole: "owner",
  viewerUserId: DEMO_USER_ID,
  members: DEMO_ORG_MEMBERS.map((m) => ({
    id: m.id,
    userId: m.user.id,
    name: m.user.name,
    email: m.user.email,
    image: m.user.image,
    role: m.role,
    joinedAt: m.createdAt,
  })),
}

const basePolygonAround = (lat: number, lng: number, sizeDeg = 0.005): number[][][] => {
  const half = sizeDeg / 2
  return [
    [
      [lng - half, lat - half],
      [lng + half, lat - half],
      [lng + half, lat + half],
      [lng - half, lat + half],
      [lng - half, lat - half],
    ],
  ]
}

export const DEMO_PARCELS: ParcelSelectWithCrop[] = [
  {
    id: PARCEL_IDS.p1,
    organizationId: DEMO_ORG_ID,
    name: "Olivar El Cerrillo",
    cropType: "olive",
    irrigationType: "dryland",
    areaM2: 28000,
    centroid: "37.7320,-3.6210",
    polygon: JSON.stringify({
      type: "Feature",
      geometry: { type: "Polygon", coordinates: basePolygonAround(37.732, -3.621, 0.008) },
    }),
    province: "Jaén",
    municipality: "Cambil",
    streetType: null,
    streetName: null,
    streetNumber: null,
    postalCode: "23193",
    createdAt: new Date("2024-02-10T10:00:00Z"),
    updatedAt: new Date("2025-03-12T09:00:00Z"),
    crop: {
      id: "crop-demo-001",
      parcelId: PARCEL_IDS.p1,
      variety: "Picual",
      soilType: "Franco-arcilloso",
      plantingDate: new Date("2008-03-15T00:00:00Z"),
      plantCount: 1680,
      data: { oliveCropType: "traditional" },
      createdAt: new Date("2024-02-10T10:00:00Z"),
      updatedAt: new Date("2025-03-12T09:00:00Z"),
    },
  },
  {
    id: PARCEL_IDS.p2,
    organizationId: DEMO_ORG_ID,
    name: "Olivar La Vega",
    cropType: "olive",
    irrigationType: "irrigated",
    areaM2: 42500,
    centroid: "37.7445,-3.6080",
    polygon: JSON.stringify({
      type: "Feature",
      geometry: { type: "Polygon", coordinates: basePolygonAround(37.7445, -3.608, 0.012) },
    }),
    province: "Jaén",
    municipality: "Cambil",
    streetType: null,
    streetName: null,
    streetNumber: null,
    postalCode: "23193",
    createdAt: new Date("2024-04-22T10:00:00Z"),
    updatedAt: new Date("2025-03-12T09:00:00Z"),
    crop: {
      id: "crop-demo-002",
      parcelId: PARCEL_IDS.p2,
      variety: "Arbequina",
      soilType: "Franco-arenoso",
      plantingDate: new Date("2015-11-20T00:00:00Z"),
      plantCount: 3200,
      data: { oliveCropType: "intensive" },
      createdAt: new Date("2024-04-22T10:00:00Z"),
      updatedAt: new Date("2025-03-12T09:00:00Z"),
    },
  },
  {
    id: PARCEL_IDS.p3,
    organizationId: DEMO_ORG_ID,
    name: "Olivar Solana Alta",
    cropType: "olive",
    irrigationType: "dryland",
    areaM2: 18500,
    centroid: "37.7198,-3.6385",
    polygon: JSON.stringify({
      type: "Feature",
      geometry: { type: "Polygon", coordinates: basePolygonAround(37.7198, -3.6385, 0.006) },
    }),
    province: "Jaén",
    municipality: "Cambil",
    streetType: null,
    streetName: null,
    streetNumber: null,
    postalCode: "23193",
    createdAt: new Date("2024-08-05T10:00:00Z"),
    updatedAt: new Date("2025-03-12T09:00:00Z"),
    crop: {
      id: "crop-demo-003",
      parcelId: PARCEL_IDS.p3,
      variety: "Hojiblanca",
      soilType: "Calizo",
      plantingDate: new Date("1995-04-10T00:00:00Z"),
      plantCount: 920,
      data: { oliveCropType: "traditional" },
      createdAt: new Date("2024-08-05T10:00:00Z"),
      updatedAt: new Date("2025-03-12T09:00:00Z"),
    },
  },
] as unknown as ParcelSelectWithCrop[]

const buildParcelPolygons = (): DashboardMapParcel[] =>
  DEMO_PARCELS.map((p, idx) => {
    const polygon = JSON.parse(p.polygon ?? "null") as {
      geometry: { coordinates: number[][][] }
    } | null
    const coords = polygon?.geometry?.coordinates ?? [
      basePolygonAround(37.732, -3.621)[0]!,
    ]
    return {
      id: p.id,
      name: p.name,
      area: (p.areaM2 ?? 0) / 10000,
      type: "olivar",
      color: ["#0a0a0a", "#404040", "#6b6b6b"][idx] ?? "#0a0a0a",
      geometryType: "Polygon" as const,
      geometryCoordinates: coords as unknown as number[][][],
    }
  }) as unknown as DashboardMapParcel[]

export const DEMO_PARCELS_MAP: DashboardMapParcel[] = buildParcelPolygons()

export const DEMO_CAMPAIGNS_ACTIVE: CampaignListItem[] = [
  {
    id: CAMPAIGN_IDS.active,
    name: "Campaña 2024/25",
    startDate: "2024-10-01",
    endDate: "2025-09-30",
    status: "active",
    balance: 8230,
  },
]

export const DEMO_CAMPAIGNS_PREVIOUS: CampaignListItem[] = [
  {
    id: CAMPAIGN_IDS.previous,
    name: "Campaña 2023/24",
    startDate: "2023-10-01",
    endDate: "2024-09-30",
    status: "closed",
    balance: 14820,
  },
]

export const DEMO_CAMPAIGNS_BY_PARCEL: Record<string, CampaignListItem[]> = {
  [PARCEL_IDS.p1]: DEMO_CAMPAIGNS_ACTIVE,
  [PARCEL_IDS.p2]: DEMO_CAMPAIGNS_ACTIVE,
  [PARCEL_IDS.p3]: DEMO_CAMPAIGNS_ACTIVE,
  __org__: DEMO_CAMPAIGNS_ACTIVE,
}

export const DEMO_OLIVE_PRICES: DashboardOlivePriceItem[] = [
  {
    name: "Aceite Virgen Extra",
    price: 7.85,
    priceMin: 7.2,
    priceMax: 8.4,
    unit: "€/kg",
    updatedAt: generateDate(0),
    history: generatePriceHistory(30, 7.85, 0.25),
  },
  {
    name: "Aceite Virgen",
    price: 6.3,
    priceMin: 5.9,
    priceMax: 6.8,
    unit: "€/kg",
    updatedAt: generateDate(0),
    history: generatePriceHistory(30, 6.3, 0.18),
  },
  {
    name: "Aceite Lampante",
    price: 4.75,
    priceMin: 4.2,
    priceMax: 5.1,
    unit: "€/kg",
    updatedAt: generateDate(0),
    history: generatePriceHistory(30, 4.75, 0.15),
  },
]

const baseSellingWindow: DashboardSellingWindow = {
  lonjaPrice: 7.85,
  costPerKg: 4.2,
  lastSalePrice: 7.6,
  estimatedKg: 18500,
  campaignTarget: 22000,
}

export const getDemoSellingWindow = (_scope: DashboardScopeParams): DashboardSellingWindow => ({
  ...baseSellingWindow,
  estimatedKg: 18500 + Math.floor(Math.random() * 2000),
})

export const getDemoParcelsSellingWindows = (
  _scope: DashboardScopeParams
): DashboardParcelsSellingWindows => ({
  parcels: DEMO_PARCELS.map<DashboardParcelSellingWindowItem>((p) => ({
    parcelId: p.id,
    name: p.name,
    lonjaPrice: 7.85,
    costPerKg: 4.2,
    lastSalePrice: 7.6,
    estimatedKg: 10000 + Math.floor(Math.random() * 12000),
    campaignTarget: 18000 + Math.floor(Math.random() * 6000),
  })),
})

const buildDemoOlivar = (parcel: ParcelSelectWithCrop): DashboardOlivar => ({
  name: parcel.name,
  coordinates: {
    lat: parseFloat((parcel.centroid ?? "37.7,-3.6").split(",")[0] ?? "37.7"),
    lng: parseFloat((parcel.centroid ?? "37.7,-3.6").split(",")[1] ?? "-3.6"),
  },
  stationId: "ESMGA23001",
  cropType: "olivar",
  area: (parcel.areaM2 ?? 0) / 10000,
  lastUpdate: new Date().toISOString(),
  temperature: 18.4,
  temperatureChange: 1.2,
  phenologicalStage: "Cuajado",
  gdd: 1280,
  gddTarget: 1600,
  kc: 0.65,
  waterBalance: -12.5,
  estimatedProfitability: 12500,
  participants: 4,
  pendingTasks: 3,
  completedTasks: 12,
  totalTrees: parcel.crop?.plantCount ?? 1000,
  totalYieldKg: 28400,
  aiInsight:
    "Déficit hídrico moderado. Considerar riego de apoyo en los próximos 5 días para mantener el cuajado.",
})

export const getDemoParcelCropOverview = (
  parcelId: string
): DashboardOlivar => {
  const parcel =
    DEMO_PARCELS.find((p) => p.id === parcelId) ?? DEMO_PARCELS[0]!
  return buildDemoOlivar(parcel)
}

export const DEMO_CROP_OVERVIEWS: DashboardParcelCropOverviewItem[] =
  DEMO_PARCELS.map((p) => ({
    parcelId: p.id,
    ...buildDemoOlivar(p),
  }))

const DEMO_RECOMMENDATIONS_BY_PARCEL: Record<string, DashboardRecommendation[]> = {
  [PARCEL_IDS.p1]: [
    {
      id: "reco-001",
      type: "irrigation",
      priority: "high",
      message:
        "Aplicar riego de apoyo de 18 mm en las próximas 48h. Déficit hídrico del 22% en horizonte de 30 días.",
      details:
        "El balance hídrico está por debajo del umbral crítico (-15 mm). Mantener el Kc 0.65 hasta final de cuajado.",
    },
    {
      id: "reco-002",
      type: "treatment",
      priority: "medium",
      message:
        "Ventana óptima de tratamiento contra repilo los días 4-6 de abril. Aplicar cobre antes de lluvia prevista.",
      details:
        "Riesgo fúngico medio (0.48). Lluvia esperada de 12 mm el día 5. Aplicar 1.5 kg/ha de sulfato de cobre.",
    },
  ],
  [PARCEL_IDS.p2]: [
    {
      id: "reco-003",
      type: "harvest",
      priority: "medium",
      message:
        "Revisar índice de maduración antes del 15 de octubre para planificar cosecha en punto óptimo.",
      details:
        "Variedad Arbequina en envero. Precio lonja actual: 7.85 €/kg. Vender tras 4 cosechas para máximo rendimiento.",
    },
  ],
  [PARCEL_IDS.p3]: [
    {
      id: "reco-004",
      type: "inspection",
      priority: "high",
      message:
        "Inspección ocular recomendada por detección previa de prays. Evaluar nivel de daño y umbral de tratamiento.",
      details:
        "Riesgo insecto elevado (0.62). Capturas en trampa: 12 adultos/semana, por encima del umbral (8).",
    },
    {
      id: "reco-005",
      type: "fertilization",
      priority: "low",
      message:
        "Abonado de fondo NPK sugerido para el inicio de la próxima campaña.",
      details:
        "Aplicar 0.6 kg/olivo de NPK 8-24-8 a finales de febrero según análisis foliar.",
    },
  ],
}

export const getDemoParcelRecommendations = (
  parcelId: string
): DashboardRecommendation[] => {
  const found = DEMO_RECOMMENDATIONS_BY_PARCEL[parcelId]
  if (found) return found
  const firstKey = Object.keys(DEMO_RECOMMENDATIONS_BY_PARCEL)[0]!
  return DEMO_RECOMMENDATIONS_BY_PARCEL[firstKey] ?? []
}

export const DEMO_RECOMMENDATIONS_ALL = DEMO_PARCELS.flatMap((p) =>
  DEMO_RECOMMENDATIONS_BY_PARCEL[p.id]?.map((r) => ({
    ...r,
    parcelId: p.id,
    parcelName: p.name,
  })) ?? []
)

const baseRisks = (
  parcelId: string
): DashboardRisks => ({
  waterStress: {
    level: parcelId === PARCEL_IDS.p1 ? "high" : "medium",
    score: parcelId === PARCEL_IDS.p1 ? 0.72 : 0.45,
    reasons: [
      "Déficit hídrico acumulado 30d: -22 mm",
      "Sin lluvia prevista en próximos 7 días",
    ],
    recommendation: {
      title: "Activar riego de apoyo",
      description: "Aplicar 18 mm esta semana para mantener cuajado.",
      urgency: parcelId === PARCEL_IDS.p1 ? "high" : "medium",
      window: "Próximas 48h",
      actions: [
        { type: "irrigation", label: "Programar riego 18mm" },
      ],
    },
  },
  fungalRisk: {
    level: "medium",
    score: 0.48,
    reasons: ["Humedad relativa media > 75%", "Lluvia prevista 12mm"],
    recommendation: {
      title: "Tratamiento preventivo con cobre",
      description: "Aplicar sulfato de cobre antes de la lluvia prevista.",
      urgency: "medium",
      actions: [{ type: "treatment", label: "Aplicar cobre" }],
    },
  },
  insectRisk: {
    level: parcelId === PARCEL_IDS.p3 ? "high" : "low",
    score: parcelId === PARCEL_IDS.p3 ? 0.62 : 0.18,
    reasons: ["Capturas de prays elevadas"],
    recommendation: {
      title: "Inspección y posible tratamiento",
      description: "Verificar capturas y umbral de tratamiento.",
      urgency: parcelId === PARCEL_IDS.p3 ? "high" : "low",
      actions: [{ type: "inspection", label: "Inspeccionar olivar" }],
    },
  },
  thermalStress: {
    level: "low",
    score: 0.12,
    reasons: ["Temperaturas en rango óptimo"],
  },
})

export const getDemoParcelRisks = (parcelId: string): DashboardRisks =>
  baseRisks(parcelId)

export const DEMO_RISKS_ALL = DEMO_PARCELS.map((p) => ({
  parcelId: p.id,
  name: p.name,
  risks: baseRisks(p.id),
}))

const baseAgroclimate = (parcelId: string): DashboardParcelAgroclimate => {
  const days = 14
  const daily: DashboardParcelAgroclimate["daily"] = {
    data: [],
    recent: [],
  }
  for (let i = 0; i < days; i++) {
    const date = addDays(today(), -days + 1 + i)
    const tempMin = +(12 + Math.sin(i * 0.6) * 4).toFixed(1)
    const tempMax = +(24 + Math.cos(i * 0.4) * 5).toFixed(1)
    const precipitation = i % 4 === 0 ? 2.5 + (i % 3) : 0
    const wb = -((i - 7) * 1.5)
    daily.data.push({
      date: isoDate(date),
      icon: precipitation > 0 ? "cloud-rain" : "sun",
      tempMin,
      tempMax,
      precipitation,
      waterBalance: +wb.toFixed(1),
      hasWaterDeficit: wb < -5,
    })
  }
  daily.recent = daily.data.slice(-7)
  const parcel = DEMO_PARCELS.find((p) => p.id === parcelId) ?? DEMO_PARCELS[0]!

  return {
    request: {
      parcelId,
      coords: {
        lat: parseFloat((parcel.centroid ?? "37.7,-3.6").split(",")[0] ?? "37.7"),
        lng: parseFloat((parcel.centroid ?? "37.7,-3.6").split(",")[1] ?? "-3.6"),
      },
      cropType: "olive",
      cropName: parcel.crop?.variety ?? "Picual",
      days,
    },
    summary: {
      stationId: "ESMGA23001",
      lastUpdate: isoDateTime(today()),
    },
    dataRange: {
      start: isoDate(addDays(today(), -days + 1)),
      end: isoDate(today()),
    },
    daily,
    metrics: {
      water: {
        deficit7d: -10.5,
        deficit15d: -14.2,
        deficit30d: -22.0,
        eto7d: 24.3,
        eto30d: 102.5,
      },
      temperature: {
        avg7d: 18.4,
        avg30d: 17.8,
        trend: 0.6,
        heatStressDays: 1,
        coldStressDays: 0,
      },
      rain: {
        rain7d: 4.2,
        rain30d: 18.6,
        trend: -3.1,
        dryDaysConsecutive: 6,
        dryDays7d: 5,
      },
      crop: {
        gdd: 1280,
        gdd30d: 240,
        kc: 0.65,
        stage: "Cuajado",
        isCritical: false,
      },
      environment: {
        humidityAvg7d: 68,
        humidityAvg30d: 72,
        variabilityIndex: 0.18,
      },
    },
    risks: baseRisks(parcelId),
    units: {
      daily: {
        tempMin: "°C",
        tempMax: "°C",
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
          avg7d: "°C",
          avg30d: "°C",
          trend: "°C",
          heatStressDays: "días",
          coldStressDays: "días",
        },
        rain: {
          rain7d: "mm",
          rain30d: "mm",
          trend: "mm",
          dryDaysConsecutive: "días",
          dryDays7d: "días",
        },
        crop: {
          gdd: "°C día",
          gdd30d: "°C día",
          kc: "-",
        },
        environment: {
          humidityAvg7d: "%",
          humidityAvg30d: "%",
          variabilityIndex: "-",
        },
      },
      risks: { score: "0-1" },
    },
    recommendations: getDemoParcelRecommendations(parcelId),
  }
}

export const getDemoParcelAgroclimate = (
  parcelId: string
): DashboardParcelAgroclimate => baseAgroclimate(parcelId)

export const DEMO_PARCELS_WEATHER_COMPARISON: DashboardParcelsWeatherComparison = {
  parcels: DEMO_PARCELS.map<DashboardParcelComparisonItem>((p, i) => ({
    name: p.name,
    area: (p.areaM2 ?? 0) / 10000,
    rain30d: 12 + i * 4,
    tempAvg: 17 + i * 0.5,
    waterDeficit30d: -15 - i * 3,
    dryDaysConsecutive: 4 + i,
    heatStressDays: i,
    waterStress: (["medium", "low", "high"] as const)[i] ?? "low",
  })),
  summary: {
    totalArea: DEMO_PARCELS.reduce((acc, p) => acc + (p.areaM2 ?? 0), 0) / 10000,
    avgRain30d: 18.6,
    avgTemp: 17.9,
    highWaterStressCount: 1,
  } as never,
} as unknown as DashboardParcelsWeatherComparison

const buildDemoTransactions = (): DashboardTransactionSnapshot[] => {
  const items: DashboardTransactionSnapshot[] = []
  const tx = [
    { d: 2, desc: "Venta aceite virgen extra – Coop. Jaén", cat: "Venta de cosecha", amount: +12480, type: "ingreso" as const, method: "transferencia" as const, parcel: PARCEL_IDS.p2 },
    { d: 5, desc: "Reparación cosechadora", cat: "Maquinaria", amount: -1850, type: "gasto" as const, method: "transferencia" as const, parcel: PARCEL_IDS.p2 },
    { d: 7, desc: "Fitosanitarios – tratamiento marzo", cat: "Tratamiento", amount: -640, type: "gasto" as const, method: "tarjeta" as const, parcel: PARCEL_IDS.p1 },
    { d: 12, desc: "Subvención PAC Q1", cat: "Subvenciones", amount: +3200, type: "ingreso" as const, method: "transferencia" as const },
    { d: 18, desc: "Venta aceite virgen – mercado local", cat: "Venta de cosecha", amount: +4320, type: "ingreso" as const, method: "efectivo" as const, parcel: PARCEL_IDS.p1 },
    { d: 25, desc: "Fertilizantes abono de fondo", cat: "Fertilización", amount: -980, type: "gasto" as const, method: "transferencia" as const, parcel: PARCEL_IDS.p3 },
    { d: 32, desc: "Poda olivos – mano de obra", cat: "Mano de obra", amount: -2100, type: "gasto" as const, method: "transferencia" as const },
    { d: 40, desc: "Seguro agrario anual", cat: "Otros", amount: -720, type: "gasto" as const, method: "transferencia" as const },
    { d: 48, desc: "Venta lampante – industria", cat: "Venta de cosecha", amount: +2180, type: "ingreso" as const, method: "transferencia" as const, parcel: PARCEL_IDS.p3 },
    { d: 55, desc: "Riego por goteo – energía", cat: "Riego", amount: -385, type: "gasto" as const, method: "transferencia" as const, parcel: PARCEL_IDS.p2 },
  ]
  tx.forEach((t, idx) => {
    const parcel = t.parcel ? DEMO_PARCELS.find((p) => p.id === t.parcel) : undefined
    items.push({
      type: t.type,
      category: t.cat,
      amount: t.amount,
      paymentMethod: t.method,
      invoiceNumber: `F2025-${(1000 + idx).toString()}`,
      date: generateDate(t.d),
      parcelName: parcel?.name,
    })
  })
  return items
}

export const DEMO_TRANSACTION_SNAPSHOTS: DashboardTransactionSnapshot[] = buildDemoTransactions()

export const DEMO_FINANCE_RESUME: DashboardFinanceResume = {
  transactions: DEMO_TRANSACTION_SNAPSHOTS.slice(0, 8),
  previousCampaign: {
    totalIncome: 21680,
    totalExpenses: 8740,
  },
}

export const DEMO_CAMPAIGN_MARGIN: DashboardCampaignMargin = {
  campaignStart: "2024-10-01",
  points: Array.from({ length: 12 }).map((_, i) => {
    const date = addDays(new Date("2024-10-01"), i * 30)
    return {
      date: isoDate(date),
      cost: 1800 + i * 220,
      value: 1200 + i * 380,
    }
  }),
}

export const DEMO_PRODUCTION_VALUE: DashboardProductionValue = {
  monthlyProductionKg: [
    0, 0, 0, 0, 0, 0, 8420, 12840, 9420, 5240, 1820, 0,
  ],
  prevMonthlyProductionKg: [
    0, 0, 0, 0, 0, 0, 7820, 11420, 8740, 4920, 1640, 0,
  ],
  lonjaPrice: 7.85,
  numOlivos: 5800,
  campaignStartYear: 2024,
}

export const DEMO_FINANCE_COMPARISON: DashboardParcelsFinanceComparison = {
  parcels: DEMO_PARCELS.map<DashboardParcelFinanceComparisonItem>((p, i) => ({
    parcelId: p.id,
    name: p.name,
    income: 8200 + i * 1640,
    expense: 3450 + i * 420,
    profit: 4750 + i * 1220,
    totalKg: 8400 + i * 2200,
  })),
}

export const DEMO_FINANCE_TRANSACTIONS: DashboardFinanceTransaction[] = DEMO_TRANSACTION_SNAPSHOTS.map(
  (t, idx) => ({
    id: `tx-${idx + 1}`,
    userId: DEMO_USER_ID,
    concept: t.category,
    description: null,
    type: t.type,
    category: t.category,
    amount: t.amount,
    paymentMethod: t.paymentMethod,
    invoiceNumber: t.invoiceNumber ?? null,
    date: t.date,
    parcelId: null,
    parcelName: t.parcelName,
    createdAt: isoDateTime(today()),
    updatedAt: isoDateTime(today()),
  })
)

export const DEMO_TRANSACTIONS_SELECT: TransactionSelect[] =
  DEMO_FINANCE_TRANSACTIONS.map(
    (t, i) =>
      ({
        id: t.id,
        userId: t.userId ?? DEMO_USER_ID,
        organizationId: DEMO_ORG_ID,
        concept: t.concept,
        description: t.description,
        flow: t.type === "ingreso" ? "income" : "expense",
        date: new Date(t.date),
        category: t.category as TransactionSelect["category"],
        amount: t.amount.toString(),
        paymentMethod: t.paymentMethod,
        invoiceNumber: t.invoiceNumber,
        parcelId: null,
        campaignId: CAMPAIGN_IDS.active,
        meta: null,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt),
      }) as unknown as TransactionSelect
  )

const eventTypes = {
  riego: { type: "irrigation", color: "#3b82f6" },
  poda: { type: "pruning", color: "#22c55e" },
  tratamiento: { type: "treatment", color: "#f59e0b" },
  cosecha: { type: "harvest", color: "#a855f7" },
  inspeccion: { type: "inspection", color: "#64748b" },
  fertilizacion: { type: "fertilization", color: "#10b981" },
} as const

const buildDemoCalendarEvents = (): DashboardCalendarEvent[] => {
  const events: DashboardCalendarEvent[] = []
  let id = 1
  DEMO_PARCELS.forEach((parcel) => {
    for (let dayOffset = -5; dayOffset <= 21; dayOffset++) {
      const weekday = addDays(today(), dayOffset).getDay()
      if (weekday === 0) continue
      const dayKey = (dayOffset + 100) % 11
      if (dayKey < 6) {
        const type =
          dayKey === 0
            ? eventTypes.riego
            : dayKey === 1
              ? eventTypes.tratamiento
              : dayKey === 2
                ? eventTypes.inspeccion
                : dayKey === 3
                  ? eventTypes.fertilizacion
                  : dayKey === 4
                    ? eventTypes.poda
                    : eventTypes.cosecha
        const start = generateDateTime(dayOffset, 7 + (dayKey % 3), 0)
        const end = generateDateTime(dayOffset, 9 + (dayKey % 3), 0)
        events.push({
          id: `event-${id++}`,
          title: `${type.type === "irrigation" ? "Riego" : type.type === "treatment" ? "Tratamiento" : type.type === "inspection" ? "Inspección" : type.type === "fertilization" ? "Fertilización" : type.type === "pruning" ? "Poda" : "Cosecha"} - ${parcel.name}`,
          type: type.type,
          parcelId: parcel.id,
          parcelName: parcel.name,
          color: type.color,
          status: dayOffset < 0 ? "completed" : dayOffset === 0 ? "in_progress" : "pending",
          start,
          end,
          meta:
            type.type === "irrigation"
              ? { waterAmount: 18 }
              : type.type === "treatment"
                ? { product: "Cobre 50%", dose: "1.5 kg/ha" }
                : type.type === "fertilization"
                  ? { product: "NPK 8-24-8", dose: "0.6 kg/olivo" }
                  : undefined,
        })
      }
    }
  })
  return events
}

export const DEMO_CALENDAR_EVENTS: DashboardCalendarEvent[] = buildDemoCalendarEvents()

export const DEMO_UPCOMING_WEEK: DashboardCalendarEvent[] =
  DEMO_CALENDAR_EVENTS.filter((e) => {
    const start = new Date(e.start).getTime()
    return start >= today().getTime() && start <= addDays(today(), 7).getTime()
  }).slice(0, 12)

const pickDemoParcel = (scope: DashboardScopeParams): ParcelSelectWithCrop | null => {
  if (scope.parcelId) {
    return DEMO_PARCELS.find((p) => p.id === scope.parcelId) ?? null
  }
  return null
}

const filterByScope = <T extends { parcelId?: string | null; parcelName?: string }>(
  items: T[],
  scope: DashboardScopeParams
): T[] => {
  if (!scope.parcelId) return items
  return items.filter((i) => i.parcelId === scope.parcelId)
}

export const getDemoDashboardOverview = (
  scope: DashboardScopeParams
): DashboardOverview => {
  const isAll = !scope.parcelId
  const single = pickDemoParcel(scope)
  if (!isAll && single) {
    const transactions = filterByScope(
      DEMO_TRANSACTION_SNAPSHOTS,
      scope
    )
    return {
      market: {
        olivePrices: DEMO_OLIVE_PRICES,
        sellingWindow: getDemoSellingWindow(scope),
      },
      crop: {
        overview: getDemoParcelCropOverview(single.id),
        productionValue: DEMO_PRODUCTION_VALUE,
      },
      finance: {
        resume: {
          ...DEMO_FINANCE_RESUME,
          transactions: filterByScope(DEMO_FINANCE_RESUME.transactions, scope),
        },
        campaignMargin: DEMO_CAMPAIGN_MARGIN,
        recentTransactions: transactions.slice(0, 6),
      },
      intelligence: {
        recommendations: getDemoParcelRecommendations(single.id),
        risks: getDemoParcelRisks(single.id),
      },
      operations: {
        upcomingWeek: filterByScope(DEMO_CALENDAR_EVENTS, scope).slice(0, 12),
        parcelsMap: DEMO_PARCELS_MAP,
      },
    } satisfies DashboardOverviewSingle
  }
  return {
    market: {
      olivePrices: DEMO_OLIVE_PRICES,
      allSellingWindows: getDemoParcelsSellingWindows(scope).parcels,
    },
    crop: {
      allOverviews: DEMO_CROP_OVERVIEWS,
      productionValue: DEMO_PRODUCTION_VALUE,
    },
    finance: {
      comparison: { parcels: DEMO_FINANCE_COMPARISON.parcels },
      recentTransactions: DEMO_TRANSACTION_SNAPSHOTS.slice(0, 8),
    },
    intelligence: {
      allRecommendations: DEMO_RECOMMENDATIONS_ALL,
      allRisks: DEMO_RISKS_ALL,
    },
    operations: {
      upcomingWeek: DEMO_UPCOMING_WEEK,
      parcelsMap: DEMO_PARCELS_MAP,
    },
  } satisfies DashboardOverviewAll
}

export const getDemoCampaignList = (
  parcelId?: string
): CampaignListItem[] => {
  if (parcelId) {
    return DEMO_CAMPAIGNS_BY_PARCEL[parcelId] ?? DEMO_CAMPAIGNS_ACTIVE
  }
  return DEMO_CAMPAIGNS_ACTIVE
}

export const getDemoCropOverviewList = (): DashboardParcelCropOverviewItem[] =>
  DEMO_CROP_OVERVIEWS

export const getDemoParcelsFinanceComparisonFn =
  (): DashboardParcelsFinanceComparison => DEMO_FINANCE_COMPARISON

export const getDemoDashboardListParcels = (): ParcelSelectWithCrop[] => DEMO_PARCELS

export const getDemoParcelById = (id: string): ParcelSelectWithCrop | null =>
  DEMO_PARCELS.find((p) => p.id === id) ?? null

export const getDemoScope = (searchParams?: DashboardScopeQuery): DashboardScopeParams => {
  if (!searchParams) return {}
  const scope: DashboardScopeParams = {}
  if (searchParams.parcelId) scope.parcelId = searchParams.parcelId
  if (searchParams.campaignId) scope.campaignId = searchParams.campaignId
  if (searchParams.from) scope.from = searchParams.from
  if (searchParams.to) scope.to = searchParams.to
  return scope
}

export const getDemoOrganizationsList = () => DEMO_ORGANIZATIONS

export const getDemoUserMe = (): UserMeResponse => DEMO_USER

export const getDemoBillingMe = (): BillingMeResponse =>
  ({
    subscription: {
      status: "active",
      stripePriceId: "price_demo_pro",
      currentPeriodStart: new Date(addDays(today(), -8)),
      currentPeriodEnd: new Date(addDays(today(), 22)),
      cancelAtPeriodEnd: false,
      trialEndsAt: null,
    },
    limits: {
      maxParcels: 50,
      maxMembers: 25,
      maxStorageMb: 10240,
      usedParcels: 3,
      usedMembers: 4,
      usedStorageMb: 1280,
    },
    modules: [
      {
        id: "mod-ai-analysis",
        slug: "ai-analysis",
        name: "Copiloto IA",
        description: "Asistente de decisiones agrícolas con IA",
        status: "available",
        active: true,
      },
      {
        id: "mod-field-notebook",
        slug: "field-notebook",
        name: "Cuaderno de campo",
        description: "Registro manual de operaciones",
        status: "available",
        active: true,
      },
    ],
  }) as unknown as BillingMeResponse

export const DEMO_INVITATIONS: InvitationSelect[] = [
  {
    id: "inv-demo-001",
    organizationId: DEMO_ORG_ID,
    email: "carlos@agropilot.dev",
    role: "member",
    status: "pending",
    expiresAt: new Date(addDays(today(), 14)),
    inviterId: DEMO_USER_ID,
    createdAt: new Date(),
  } as InvitationSelect,
]

const DEMO_TASK_LIST: TaskSelect[] = DEMO_CALENDAR_EVENTS.slice(0, 10).map(
  (e, i) =>
    ({
      id: e.id,
      parcelId: e.parcelId,
      title: e.title,
      description: null,
      category: e.type,
      status:
        e.status === "completed"
          ? "done"
          : e.status === "in_progress"
            ? "in_progress"
            : "pending",
      priority: i % 4 === 0 ? 3 : i % 3 === 0 ? 2 : 1,
      startDate: new Date(e.start),
      endDate: new Date(e.end),
      recommendationId: null,
      taskType: "manual",
      source: "manual",
      sourceId: null,
      meta: null,
      organizationId: DEMO_ORG_ID,
      createdAt: new Date(addDays(today(), -30)),
      updatedAt: new Date(),
    }) as unknown as TaskSelect
)

export const getDemoTasksList = (): TaskSelect[] => DEMO_TASK_LIST

export const getDemoTaskById = (id: string): TaskSelect | null =>
  DEMO_TASK_LIST.find((t) => t.id === id) ?? null

export const getDemoCalendarEvents = (
  scope: DashboardScopeParams
): DashboardCalendarEvent[] => filterByScope(DEMO_CALENDAR_EVENTS, scope)

export const getDemoUpcomingWeek = (
  scope: DashboardScopeParams
): DashboardCalendarEvent[] => {
  const events = filterByScope(DEMO_CALENDAR_EVENTS, scope)
  return events
    .filter((e) => {
      const start = new Date(e.start).getTime()
      return start >= today().getTime() && start <= addDays(today(), 7).getTime()
    })
    .slice(0, 12)
}

export const getDemoHarvestDeliveries = (
  _query: { parcelId: string; status?: string }
): HarvestDeliveryListItem[] => {
  const id = _query.parcelId ?? PARCEL_IDS.p1
  const parcel = DEMO_PARCELS.find((p) => p.id === id) ?? DEMO_PARCELS[0]!
  return [
    {
      id: "delivery-001",
      parcelId: parcel.id,
      parcelName: parcel.name,
      campaignId: CAMPAIGN_IDS.active,
      deliveryDate: generateDate(14),
      destinationName: "Almazara San Roque",
      rawQuantity: 8400,
      rawUnit: "kg",
      conversionRate: 18.5,
      processedQuantity: 1554,
      processedUnit: "l",
      grade: "virgen_extra",
      quantityRemaining: 1100,
      status: "partial",
      targetSalePricePerUnit: 7.85,
      notes: "Calidad óptima, esperando mejor precio de lonja.",
    },
    {
      id: "delivery-002",
      parcelId: parcel.id,
      parcelName: parcel.name,
      campaignId: CAMPAIGN_IDS.active,
      deliveryDate: generateDate(34),
      destinationName: "Cooperativa Jaén",
      rawQuantity: 6200,
      rawUnit: "kg",
      conversionRate: 17.8,
      processedQuantity: 1103,
      processedUnit: "l",
      grade: "virgen",
      quantityRemaining: 0,
      status: "sold",
      targetSalePricePerUnit: 6.3,
      notes: null,
    },
  ]
}

export const getDemoRecommendationsList = (
  params?: { parcelId?: string }
): Array<DashboardRecommendation & { parcelId: string | null; parcelName: string | null }> => {
  if (params?.parcelId) {
    const parcel = DEMO_PARCELS.find((p) => p.id === params.parcelId)
    return getDemoParcelRecommendations(params.parcelId).map((r) => ({
      ...r,
      parcelId: params.parcelId!,
      parcelName: parcel?.name ?? null,
    }))
  }
  return DEMO_RECOMMENDATIONS_ALL.map((r) => ({
    ...r,
    parcelId: r.parcelId ?? null,
    parcelName: r.parcelName ?? null,
  }))
}

export const getDemoRecommendationById = (
  id: string
): (DashboardRecommendation & { parcelId: string | null; parcelName: string | null }) | null =>
  getDemoRecommendationsList().find((r) => r.id === id) ?? null

export const getDemoOrganizationMembers = (): OrganizationMember[] => DEMO_ORG_MEMBERS

export const getDemoActiveOrganization = (): ActiveOrganizationData => DEMO_ORG_DETAIL

export const getDemoOrganizationMe = (): OrganizationMeResponse => DEMO_ORG_ME_RESPONSE

export const listDemoInvitations = (): InvitationSelect[] => DEMO_INVITATIONS

export const createDemoInvitation = (
  data: InvitationCreateInput
): InvitationSelect => {
  const newInv: InvitationSelect = {
    id: `inv-${Date.now()}`,
    organizationId: DEMO_ORG_ID,
    email: data.email,
    role: data.role,
    status: "pending",
    expiresAt: addDays(today(), 7),
    inviterId: DEMO_USER_ID,
    createdAt: new Date(),
  }
  DEMO_INVITATIONS.push(newInv)
  return newInv
}

export const bulkCreateDemoInvitations = (
  data: InvitationBulkCreateInput
): InvitationBulkCreateResult => {
  const invitations = data.invitations.map((i) => createDemoInvitation(i))
  return { invitations, failed: [], count: invitations.length }
}

export const cancelDemoInvitation = (id: string): string => {
  const idx = DEMO_INVITATIONS.findIndex((i) => i.id === id)
  if (idx >= 0) DEMO_INVITATIONS.splice(idx, 1)
  return id
}

export const getDemoOrganizationsForSelect = () => DEMO_ORGANIZATIONS

export const getDemoTransactions = (
  scope: DashboardScopeParams
): DashboardFinanceTransaction[] => {
  const list = filterByScope(DEMO_FINANCE_TRANSACTIONS, scope)
  return list
}

export const getDemoRecentTransactions = (
  scope: DashboardScopeParams
): DashboardTransactionSnapshot[] => {
  const list = filterByScope(DEMO_TRANSACTION_SNAPSHOTS, scope)
  return list.slice(0, 8)
}

export const getDemoScopedTransactions = (
  scope: DashboardScopeParams
): DashboardFinanceTransaction[] => getDemoTransactions(scope)

export const getDemoCopilotSuggestions = (): string[] => [
  "¿Cuándo debería vender la cosecha para maximizar el margen?",
  "¿Qué parcela tiene mayor riesgo de estrés hídrico esta semana?",
  "Resume los movimientos financieros del mes",
  "¿Hay recomendaciones pendientes sin aceptar?",
  "Compara el rendimiento de las parcelas este año",
]

export const updateDemoOnboarding = (step: number): UserMeResponse => ({
  ...DEMO_USER,
  onboardingStep: step,
})

export const createDemoTransaction = (
  data: TransactionCreateInput
): TransactionSelect => {
  const newTx: TransactionSelect = {
    id: `tx-${Date.now()}`,
    userId: DEMO_USER_ID,
    organizationId: DEMO_ORG_ID,
    concept: data.concept,
    description: data.description ?? null,
    flow: data.flow,
    date: new Date(data.date),
    category: data.category,
    amount: data.amount.toString(),
    paymentMethod: data.paymentMethod ?? null,
    invoiceNumber: data.invoiceNumber ?? null,
    parcelId: data.parcelId ?? null,
    campaignId: data.campaignId ?? CAMPAIGN_IDS.active,
    meta: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as TransactionSelect
  DEMO_TRANSACTIONS_SELECT.unshift(newTx)
  return newTx
}

export const updateDemoTransaction = (
  id: string,
  data: TransactionUpdateInput
): TransactionSelect | null => {
  const tx = DEMO_TRANSACTIONS_SELECT.find((t) => t.id === id)
  if (!tx) return null
  if (data.concept !== undefined) tx.concept = data.concept
  if (data.amount !== undefined) tx.amount = data.amount.toString()
  if (data.category !== undefined) tx.category = data.category as TransactionSelect["category"]
  if (data.flow !== undefined) tx.flow = data.flow
  if (data.paymentMethod !== undefined) tx.paymentMethod = data.paymentMethod ?? null
  if (data.invoiceNumber !== undefined) tx.invoiceNumber = data.invoiceNumber ?? null
  if (data.parcelId !== undefined) tx.parcelId = data.parcelId ?? null
  if (data.date !== undefined) {
    tx.date = data.date as unknown as TransactionSelect["date"]
  }
  return tx
}

export const deleteDemoTransaction = (id: string): string => {
  const idx = DEMO_TRANSACTIONS_SELECT.findIndex((t) => t.id === id)
  if (idx >= 0) DEMO_TRANSACTIONS_SELECT.splice(idx, 1)
  return id
}

export const createDemoTask = (data: TaskCreateInput): TaskSelect =>
  ({
    id: `task-${Date.now()}`,
    parcelId: data.parcelId ?? null,
    title: data.title,
    description: data.description ?? null,
    category: data.category,
    status: "pending",
    priority: data.priority ?? 2,
    startDate: new Date(data.startDate as string),
    endDate: null,
    recommendationId: data.recommendationId ?? null,
    taskType: "manual",
    source: "manual",
    sourceId: null,
    meta: null,
    organizationId: DEMO_ORG_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
  }) as unknown as TaskSelect

export const updateDemoTask = (
  taskId: string,
  data: TaskUpdateInput
): TaskSelect | null => {
  const task = DEMO_TASK_LIST.find((t) => t.id === taskId)
  if (!task) return null
  if (data.title !== undefined) task.title = data.title
  if (data.category !== undefined) task.category = data.category
  if (data.startDate !== undefined)
    task.startDate = new Date(data.startDate as string)
  if (data.endDate !== undefined) {
    task.endDate = data.endDate ? new Date(data.endDate as string) : null
  }
  if (data.description !== undefined) task.description = data.description
  if (data.priority !== undefined) task.priority = data.priority
  if (data.status !== undefined) task.status = data.status
  if (data.parcelId !== undefined) task.parcelId = data.parcelId
  return task
}

export const deleteDemoTask = (taskId: string): void => {
  const idx = DEMO_TASK_LIST.findIndex((t) => t.id === taskId)
  if (idx >= 0) DEMO_TASK_LIST.splice(idx, 1)
}

export const acceptDemoRecommendation = (
  recommendationId: string,
  input?: Record<string, unknown>
): { task: TaskSelect; recommendation: RecommendationSelect } => {
  const r = getDemoRecommendationById(recommendationId)
  if (!r) {
    throw new Error("Recommendation not found")
  }
  const task = createDemoTask({
    title: r.message,
    category: r.type,
    startDate: generateDate(0),
    parcelId: r.parcelId ?? undefined,
    priority: r.priority === "high" ? 3 : r.priority === "medium" ? 2 : 1,
    recommendationId,
  })
  const rec: RecommendationSelect = {
    id: r.id,
    parcelId: r.parcelId,
    title: r.message,
    type: r.type,
    priority: r.priority,
    details: r.details,
    status: "accepted",
    payload: input ?? {},
    organizationId: DEMO_ORG_ID,
    createdAt: isoDateTime(today()),
    updatedAt: isoDateTime(today()),
  } as unknown as RecommendationSelect
  return { task, recommendation: rec }
}

export const dismissDemoRecommendation = (
  recommendationId: string
): RecommendationSelect => {
  const r = getDemoRecommendationById(recommendationId)
  if (!r) throw new Error("Recommendation not found")
  return {
    id: r.id,
    parcelId: r.parcelId,
    title: r.message,
    type: r.type,
    priority: r.priority,
    details: r.details,
    status: "dismissed",
    payload: {},
    organizationId: DEMO_ORG_ID,
    createdAt: isoDateTime(today()),
    updatedAt: isoDateTime(today()),
  } as unknown as RecommendationSelect
}

export const createDemoHarvestDelivery = (
  data: HarvestDeliveryCreateInput
): { id: string } => ({ id: `delivery-${Date.now()}` })

export const createDemoHarvestSale = (
  data: HarvestSaleCreateInput
): { transaction: { id: string }; sales: { id: string }[] } => ({
  transaction: { id: `tx-${Date.now()}` },
  sales: data.deliveries.map((_, i) => ({ id: `sale-${Date.now()}-${i}` })),
})

export const updateDemoCampaignSaleTarget = (
  data: UpdateCampaignSaleTargetInput
): { campaignTarget: number } => ({
  campaignTarget: data.campaignTarget,
})

export const getDemoSellingWindowFn = (
  scope: DashboardScopeParams
): DashboardSellingWindow => getDemoSellingWindow(scope)

export const getDemoParcelsSellingWindowsFn = (
  scope: DashboardScopeParams
): DashboardParcelsSellingWindows => getDemoParcelsSellingWindows(scope)

export const getDemoFinanceResume = (
  scope: DashboardScopeParams
): DashboardFinanceResume => {
  const transactions = filterByScope(DEMO_TRANSACTION_SNAPSHOTS, scope)
  return {
    transactions,
    previousCampaign: DEMO_FINANCE_RESUME.previousCampaign,
  }
}

export const getDemoCampaignMargin = (
  scope: DashboardScopeParams
): DashboardCampaignMargin => DEMO_CAMPAIGN_MARGIN

export const getDemoProductionValue = (
  scope: DashboardScopeParams
): DashboardProductionValue => DEMO_PRODUCTION_VALUE

export const getDemoParcelsRecommendations = () => ({
  parcels: DEMO_PARCELS.map((p) => ({
    parcelId: p.id,
    name: p.name,
    recommendations: getDemoParcelRecommendations(p.id),
  })),
})

export const getDemoParcelsRisks = () => ({
  parcels: DEMO_RISKS_ALL.map((r) => ({
    parcelId: r.parcelId,
    name: r.name,
    risks: r.risks,
  })),
})

export const getDemoParcelsCropOverviews = () => ({
  parcels: DEMO_CROP_OVERVIEWS,
})

export const getDemoWeatherComparison = (
  _scope: DashboardScopeParams
): DashboardParcelsWeatherComparison => DEMO_PARCELS_WEATHER_COMPARISON

export const getDemoOlivePrices = (): DashboardOlivePriceItem[] => DEMO_OLIVE_PRICES

export const getDemoCurrentUser = () => DEMO_USER

export const getDemoScopeKey = (scope: DashboardScopeParams): string => {
  const parts: string[] = []
  if (scope.parcelId) parts.push(`parcel=${scope.parcelId}`)
  if (scope.campaignId) parts.push(`campaign=${scope.campaignId}`)
  if (scope.from) parts.push(`from=${scope.from}`)
  if (scope.to) parts.push(`to=${scope.to}`)
  return parts.join("&") || "all"
}

const DEMO_AGGREGATE: Record<string, number> = {
  "1": 14,
  "4": 32,
  "11": 7,
  "14": 4,
  "18": 27,
  "21": 33,
  "23": 19,
  "29": 9,
  "41": 8,
  "46": 31,
}
export const getDemoParcelsRecommendationsList = () => DEMO_AGGREGATE

export const DEMO_PROVINCES = [
  { Codigo: 23, Denominacion: "JAEN" },
  { Codigo: 18, Denominacion: "GRANADA" },
  { Codigo: 14, Denominacion: "CORDOBA" },
  { Codigo: 41, Denominacion: "SEVILLA" },
]
export const DEMO_MUNICIPALITIES = [
  { Codigo: 23_018, Denominacion: "CAMBIL" },
  { Codigo: 23_041, Denominacion: "HUELMA" },
  { Codigo: 23_023, Denominacion: "BELMEZ DE LA MORALEDA" },
]
export const DEMO_STREETS = [
  {
    Codigo: 1,
    Sigla: "CL",
    TipoVia: "Calle",
    Denominacion: "OLIVAR",
    CodigoMunicipioAgregado: null,
    DenominacionMunicipioAgregado: "CAMBIL",
    DenominacionCompleta: "CL OLIVAR",
  },
  {
    Codigo: 2,
    Sigla: "CM",
    TipoVia: "Camino",
    Denominacion: "DEL CERRO",
    CodigoMunicipioAgregado: null,
    DenominacionMunicipioAgregado: "CAMBIL",
    DenominacionCompleta: "CM DEL CERRO",
  },
]

export const getDemoProvinces = () => DEMO_PROVINCES
export const getDemoMunicipalities = (_province: number) => DEMO_MUNICIPALITIES
export const getDemoStreets = (_: {
  province: number
  municipality: number
}) => DEMO_STREETS

export const getDemoAddress = () => ({
  address: "Camino del Cerro s/n",
  refcat: "23005A023000090000JT",
  province: "Jaén",
  municipality: "Cambil",
  postalCode: "23193",
})

export const getDemoCoordsSearch = () => ({
  address: "Camino del Cerro s/n",
  refcat: "23005A023000090000JT",
  coords: { lat: 37.732, lng: -3.621 },
})

export const getDemoRefcatSearch = () => ({
  address: "Camino del Cerro s/n",
  refcat: "23005A023000090000JT",
})

export const buildDemoScopeKeyFromQuery = (q: DashboardScopeQuery): string =>
  getDemoScopeKey(q)
