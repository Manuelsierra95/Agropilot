export type WeatherDaily = {
  date: string
  tempMax: number
  tempMin: number
  precipitation: number
  waterBalance?: number
  heatStress?: boolean
  coldStress?: boolean
  dryDay?: boolean
  tempChange?: number
  precipChange?: number
}

export type WeatherMetrics = {
  waterDeficit7d: number
  waterDeficit15d: number
  waterDeficit30d: number
  dryDaysConsecutive: number
  tempTrend: number
  rainTrend: number
  heatStressDays: number
  coldStressDays: number
  rain7d: number
  rain30d: number
  tempAvg: number
  variabilityIndex: number
}

export type WeatherRisks = {
  waterStress: "low" | "medium" | "high"
  pestRisk: "low" | "medium" | "high"
}

export type ParcelWeatherResult = {
  daily: WeatherDaily[]
  metrics: WeatherMetrics
  risks: WeatherRisks
  status?: "ok" | "no-data"
}

export const parcelWeatherByParcelId: Record<string, ParcelWeatherResult> = {
  "1": {
    status: "ok",
    daily: [
      {
        date: "2026-04-03",
        tempMax: 22,
        tempMin: 11,
        precipitation: 3.2,
        waterBalance: -0.8,
        dryDay: false,
        tempChange: 1.3,
        precipChange: -1.5,
      },
      {
        date: "2026-04-04",
        tempMax: 24,
        tempMin: 10,
        precipitation: 0,
        waterBalance: -1.6,
        dryDay: true,
        heatStress: false,
        coldStress: false,
        tempChange: 2,
        precipChange: -3.2,
      },
      {
        date: "2026-04-05",
        tempMax: 26,
        tempMin: 12,
        precipitation: 0.4,
        waterBalance: -1.2,
        dryDay: false,
        heatStress: true,
        tempChange: 2,
        precipChange: 0.4,
      },
      {
        date: "2026-04-06",
        tempMax: 27,
        tempMin: 13,
        precipitation: 0,
        waterBalance: -2.2,
        dryDay: true,
        heatStress: true,
        tempChange: 1,
        precipChange: -0.4,
      },
      {
        date: "2026-04-07",
        tempMax: 25,
        tempMin: 12,
        precipitation: 1.1,
        waterBalance: -0.9,
        dryDay: false,
        heatStress: false,
        tempChange: -2,
        precipChange: 1.1,
      },
    ],
    metrics: {
      waterDeficit7d: 8.1,
      waterDeficit15d: 17.4,
      waterDeficit30d: 35.2,
      dryDaysConsecutive: 2,
      tempTrend: 1.4,
      rainTrend: -9.6,
      heatStressDays: 3,
      coldStressDays: 0,
      rain7d: 6.7,
      rain30d: 22.4,
      tempAvg: 18.3,
      variabilityIndex: 0.42,
    },
    risks: {
      waterStress: "medium",
      pestRisk: "low",
    },
  },
  "2": {
    status: "ok",
    daily: [
      {
        date: "2026-04-03",
        tempMax: 20,
        tempMin: 8,
        precipitation: 0,
        waterBalance: -2.1,
        dryDay: true,
        tempChange: 0.8,
        precipChange: -0.6,
      },
      {
        date: "2026-04-04",
        tempMax: 22,
        tempMin: 7,
        precipitation: 0,
        waterBalance: -2.7,
        dryDay: true,
        coldStress: true,
        tempChange: 2,
        precipChange: 0,
      },
      {
        date: "2026-04-05",
        tempMax: 24,
        tempMin: 9,
        precipitation: 0,
        waterBalance: -3,
        dryDay: true,
        heatStress: false,
        tempChange: 2,
        precipChange: 0,
      },
      {
        date: "2026-04-06",
        tempMax: 25,
        tempMin: 10,
        precipitation: 0.2,
        waterBalance: -2.4,
        dryDay: false,
        heatStress: true,
        tempChange: 1,
        precipChange: 0.2,
      },
      {
        date: "2026-04-07",
        tempMax: 26,
        tempMin: 11,
        precipitation: 0,
        waterBalance: -2.9,
        dryDay: true,
        heatStress: true,
        tempChange: 1,
        precipChange: -0.2,
      },
    ],
    metrics: {
      waterDeficit7d: 13.5,
      waterDeficit15d: 27.8,
      waterDeficit30d: 52.1,
      dryDaysConsecutive: 4,
      tempTrend: 2.3,
      rainTrend: -13.1,
      heatStressDays: 4,
      coldStressDays: 1,
      rain7d: 1.6,
      rain30d: 10.3,
      tempAvg: 16.9,
      variabilityIndex: 0.56,
    },
    risks: {
      waterStress: "high",
      pestRisk: "medium",
    },
  },
  "3": {
    status: "ok",
    daily: [
      {
        date: "2026-04-03",
        tempMax: 23,
        tempMin: 11,
        precipitation: 4.1,
        waterBalance: 0.6,
        dryDay: false,
        tempChange: 0.3,
        precipChange: 1.5,
      },
      {
        date: "2026-04-04",
        tempMax: 24,
        tempMin: 12,
        precipitation: 3.6,
        waterBalance: 0.4,
        dryDay: false,
        heatStress: false,
        tempChange: 1,
        precipChange: -0.5,
      },
      {
        date: "2026-04-05",
        tempMax: 25,
        tempMin: 12,
        precipitation: 2.9,
        waterBalance: 0.2,
        dryDay: false,
        heatStress: false,
        tempChange: 1,
        precipChange: -0.7,
      },
      {
        date: "2026-04-06",
        tempMax: 27,
        tempMin: 13,
        precipitation: 1.8,
        waterBalance: -0.4,
        dryDay: false,
        heatStress: true,
        tempChange: 2,
        precipChange: -1.1,
      },
      {
        date: "2026-04-07",
        tempMax: 28,
        tempMin: 14,
        precipitation: 0,
        waterBalance: -1.1,
        dryDay: true,
        heatStress: true,
        tempChange: 1,
        precipChange: -1.8,
      },
    ],
    metrics: {
      waterDeficit7d: 4.9,
      waterDeficit15d: 9.2,
      waterDeficit30d: 18.7,
      dryDaysConsecutive: 1,
      tempTrend: 1.1,
      rainTrend: -4.2,
      heatStressDays: 2,
      coldStressDays: 0,
      rain7d: 12.4,
      rain30d: 35.8,
      tempAvg: 19.7,
      variabilityIndex: 0.31,
    },
    risks: {
      waterStress: "low",
      pestRisk: "medium",
    },
  },
  "4": {
    status: "ok",
    daily: [
      {
        date: "2026-04-03",
        tempMax: 21,
        tempMin: 9,
        precipitation: 1.7,
        waterBalance: -0.6,
        dryDay: false,
        tempChange: -0.3,
        precipChange: 0.3,
      },
      {
        date: "2026-04-04",
        tempMax: 22,
        tempMin: 8,
        precipitation: 0,
        waterBalance: -1.4,
        dryDay: true,
        coldStress: true,
        tempChange: 1,
        precipChange: -1.7,
      },
      {
        date: "2026-04-05",
        tempMax: 24,
        tempMin: 10,
        precipitation: 0.5,
        waterBalance: -1,
        dryDay: false,
        heatStress: false,
        tempChange: 2,
        precipChange: 0.5,
      },
      {
        date: "2026-04-06",
        tempMax: 25,
        tempMin: 11,
        precipitation: 0,
        waterBalance: -1.7,
        dryDay: true,
        heatStress: true,
        tempChange: 1,
        precipChange: -0.5,
      },
      {
        date: "2026-04-07",
        tempMax: 24,
        tempMin: 10,
        precipitation: 2.4,
        waterBalance: -0.2,
        dryDay: false,
        heatStress: false,
        tempChange: -1,
        precipChange: 2.4,
      },
    ],
    metrics: {
      waterDeficit7d: 6.4,
      waterDeficit15d: 12.8,
      waterDeficit30d: 24.5,
      dryDaysConsecutive: 1,
      tempTrend: 0.5,
      rainTrend: -2.1,
      heatStressDays: 1,
      coldStressDays: 1,
      rain7d: 8.9,
      rain30d: 26.1,
      tempAvg: 17.8,
      variabilityIndex: 0.37,
    },
    risks: {
      waterStress: "medium",
      pestRisk: "low",
    },
  },
}
