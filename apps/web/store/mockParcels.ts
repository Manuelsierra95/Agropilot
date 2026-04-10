type Parcel = {
  id: string
  userId: string
  name: string
  area: number // hectáreas
  type: string // tipo de cultivo
  irrigationType: string // tipo de riego
  geometryType: "Polygon"
  geometryCoordinates: number[][][]
  description: string
  createdAt: Date
  updatedAt: Date
}

export const mockParcels: Parcel[] = [
  {
    id: "1",
    userId: "user-mock-001",
    name: "Olivar La Esperanza",
    area: 12.5,
    type: "Olivar",
    irrigationType: "Goteo",
    geometryType: "Polygon",
    geometryCoordinates: [
      [
        [-4.782, 37.89],
        [-4.779, 37.89],
        [-4.779, 37.888],
        [-4.782, 37.888],
        [-4.782, 37.89],
      ],
    ],
    description: "Olivar de variedad Picual con riego por goteo",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2025-11-20"),
  },
  {
    id: "2",
    userId: "user-mock-001",
    name: "Olivar El Cerro",
    area: 8.3,
    type: "Olivar",
    irrigationType: "Secano",
    geometryType: "Polygon",
    geometryCoordinates: [
      [
        [-4.776, 37.887],
        [-4.773, 37.887],
        [-4.773, 37.8855],
        [-4.776, 37.8855],
        [-4.776, 37.887],
      ],
    ],
    description: "Olivar tradicional de secano, variedad Hojiblanca",
    createdAt: new Date("2024-02-10"),
    updatedAt: new Date("2025-10-05"),
  },
  {
    id: "3",
    userId: "user-mock-001",
    name: "Parcela Los Llanos",
    area: 15.0,
    type: "Olivar",
    irrigationType: "Goteo",
    geometryType: "Polygon",
    geometryCoordinates: [
      [
        [-4.785, 37.892],
        [-4.781, 37.892],
        [-4.781, 37.89],
        [-4.785, 37.89],
        [-4.785, 37.892],
      ],
    ],
    description: "Olivar intensivo de nueva plantación",
    createdAt: new Date("2024-03-20"),
    updatedAt: new Date("2025-12-01"),
  },
  {
    id: "4",
    userId: "user-mock-001",
    name: "Parcela Cazorla",
    area: 10.2,
    type: "Olivar",
    irrigationType: "Goteo",
    geometryType: "Polygon",
    geometryCoordinates: [
      [
        [-3.011428, 37.898586],
        [-3.011474, 37.898681],
        [-3.011253, 37.898751],
        [-3.011124, 37.898733],
        [-3.010976, 37.898707],
        [-3.010778, 37.898716],
        [-3.010699, 37.898744],
        [-3.010697, 37.898744],
        [-3.010548, 37.898763],
        [-3.010224, 37.898768],
        [-3.010244, 37.898689],
        [-3.010347, 37.898535],
        [-3.0104, 37.89841],
        [-3.0104, 37.898295],
        [-3.010331, 37.898152],
        [-3.010277, 37.898066],
        [-3.010253, 37.898034],
        [-3.010223, 37.897915],
        [-3.01022, 37.89781],
        [-3.010172, 37.897778],
        [-3.010094, 37.897644],
        [-3.010044, 37.897549],
        [-3.010034, 37.897503],
        [-3.01021, 37.897574],
        [-3.010373, 37.897644],
        [-3.010481, 37.897722],
        [-3.010579, 37.897811],
        [-3.010615, 37.897935],
        [-3.010653, 37.897972],
        [-3.01072, 37.898017],
        [-3.010821, 37.898122],
        [-3.010895, 37.898172],
        [-3.010938, 37.898218],
        [-3.011014, 37.898268],
        [-3.01103, 37.898279],
        [-3.01111, 37.898315],
        [-3.011227, 37.898366],
        [-3.011301, 37.898424],
        [-3.011387, 37.898537],
        [-3.011428, 37.898586],
      ],
    ],
    description: "Parcela con olivos jóvenes, plantados en 2023",
    createdAt: new Date("2024-04-05"),
    updatedAt: new Date("2025-11-25"),
  },
]

/**
 * Datos mock de métricas del dashboard para desarrollo sin API
 */

type MockMetric = {
  id: number
  userId: string
  parcelId: number | null
  metricType: string
  value: number
  previousValue: number | null
  unit: string
  source: "manual" | "api" | "sensor" | "calculated"
  metadata: Record<string, any> | null
  date: string
  createdAt: string
  updatedAt: string
}

const now = new Date().toISOString()

export const mockDashboardMetrics: Record<string, MockMetric[]> = {
  olive_price: [
    {
      id: 1,
      userId: "user-mock-001",
      parcelId: null,
      metricType: "olive_price",
      value: 3.85,
      previousValue: 3.72,
      unit: "€/kg",
      source: "api",
      metadata: { market: "Córdoba", variety: "Picual" },
      date: now,
      createdAt: now,
      updatedAt: now,
    },
  ],
  crop_health: [
    {
      id: 2,
      userId: "user-mock-001",
      parcelId: 1,
      metricType: "crop_health",
      value: 82,
      previousValue: 78,
      unit: "index",
      source: "sensor",
      metadata: { ndvi: 0.72, lastSatellitePass: "2026-02-28" },
      date: now,
      createdAt: now,
      updatedAt: now,
    },
  ],
  yield_estimate: [
    {
      id: 3,
      userId: "user-mock-001",
      parcelId: 1,
      metricType: "yield_estimate",
      value: 4200,
      previousValue: 3950,
      unit: "kg/ha",
      source: "calculated",
      metadata: { model: "regression_v2", confidence: 0.85 },
      date: now,
      createdAt: now,
      updatedAt: now,
    },
  ],
  rainfall: [
    {
      id: 4,
      userId: "user-mock-001",
      parcelId: 1,
      metricType: "rainfall",
      value: 32.5,
      previousValue: 28.0,
      unit: "mm",
      source: "api",
      metadata: { period: "7d", station: "Córdoba-Aeropuerto" },
      date: now,
      createdAt: now,
      updatedAt: now,
    },
  ],
  current_weather_temperature: [
    {
      id: 5,
      userId: "user-mock-001",
      parcelId: 1,
      metricType: "current_weather_temperature",
      value: 18.5,
      previousValue: 16.2,
      unit: "°C",
      source: "api",
      metadata: { feelsLike: 17.8, condition: "Parcialmente nublado" },
      date: now,
      createdAt: now,
      updatedAt: now,
    },
  ],
  current_weather_humidity: [
    {
      id: 6,
      userId: "user-mock-001",
      parcelId: 1,
      metricType: "current_weather_humidity",
      value: 65,
      previousValue: 58,
      unit: "%",
      source: "api",
      metadata: null,
      date: now,
      createdAt: now,
      updatedAt: now,
    },
  ],
  current_weather_wind: [
    {
      id: 7,
      userId: "user-mock-001",
      parcelId: 1,
      metricType: "current_weather_wind",
      value: 12,
      previousValue: 15,
      unit: "km/h",
      source: "api",
      metadata: { direction: "SW", gusts: 22 },
      date: now,
      createdAt: now,
      updatedAt: now,
    },
  ],
  previous_harvest: [
    {
      id: 8,
      userId: "user-mock-001",
      parcelId: 1,
      metricType: "previous_harvest",
      value: 52500,
      previousValue: 48000,
      unit: "kg",
      source: "manual",
      metadata: {
        season: "2024/2025",
        startDate: "2024-11-15",
        endDate: "2025-01-20",
      },
      date: now,
      createdAt: now,
      updatedAt: now,
    },
  ],
}

/**
 * Obtiene las métricas mock agrupadas con paginación simulada
 */
export function getMockGroupedMetrics(metricTypes: string[]) {
  const result: Record<string, MockMetric[]> = {}

  for (const type of metricTypes) {
    if (mockDashboardMetrics[type]) {
      result[type] = mockDashboardMetrics[type]
    }
  }

  return {
    ...result,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: metricTypes.length,
      itemsPerPage: 10,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  }
}
