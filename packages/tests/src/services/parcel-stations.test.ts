import { beforeEach, describe, expect, it, vi } from "vitest"

const dbMock = vi.hoisted(() => ({
  select: vi.fn(),
  transaction: vi.fn(),
  query: {
    parcels: { findFirst: vi.fn() },
    parcelStation: { findFirst: vi.fn() },
    weatherStation: { findFirst: vi.fn() },
  },
}))

const getBestStationsMock = vi.hoisted(() => vi.fn())

vi.mock("@workspace/db", () => ({
  db: dbMock,
  eq: vi.fn(() => "eq_condition"),
  sql: Object.assign(
    (...args: any[]) => ({
      as: (alias: string) => `sql_alias_${alias}`,
    }),
    { raw: vi.fn() }
  ),
  schema: {
    parcels: { centroid: "centroid_col", id: "id_col" },
    weatherStation: {
      stationId: "station_id_col",
      id: "ws_id_col",
      name: "name_col",
      location: "location_col",
      altitude: "altitude_col",
    },
    parcelStation: {
      parcelId: "ps_parcel_id_col",
      primaryStationId: "ps_primary_col",
      fallbackStations: "ps_fallbacks_col",
      computedAt: "ps_computed_at_col",
    },
  },
}))

vi.mock("@workspace/scrapers", () => ({
  getBestStations: getBestStationsMock,
}))

import { getStations } from "@workspace/api/services/weather"

function mockParcelCentroid(lat: number | null, lng: number | null) {
  const chain = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([{ lat, lng }]),
  }
  dbMock.select.mockReturnValue(chain)
}

function createTxMock() {
  const insertResult = [{ id: "station-new" }]

  const whereChain = {
    where: vi.fn().mockResolvedValue(undefined),
  }

  const setChain = {
    set: vi.fn().mockReturnValue(whereChain),
  }

  const tx = {
    query: dbMock.query,
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue(insertResult),
      }),
    }),
    update: vi.fn().mockReturnValue(setChain),
  }

  return tx
}

function mockStationSelection() {
  return {
    main: {
      code: "MAIN001" as any,
      name: "Main Station",
      latitude: 38.0,
      longitude: -3.5,
      elevation: 420,
      distance: 2.5,
      followers: 150,
      score: 0.85,
    },
    fallbacks: [
      {
        code: "FB001" as any,
        name: "Fallback 1",
        latitude: 38.1,
        longitude: -3.6,
        elevation: 380,
        distance: 5.0,
        followers: 80,
        score: 0.6,
      },
      {
        code: "FB002" as any,
        name: "Fallback 2",
        latitude: 37.9,
        longitude: -3.4,
        elevation: 450,
        distance: 8.0,
        followers: 40,
        score: 0.4,
      },
    ],
    radiusUsed: 10,
  }
}

describe("getStations", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("asigna estaciones correctamente cuando se pasan lat/lng directamente", async () => {
    getBestStationsMock.mockResolvedValue(mockStationSelection())
    const tx = createTxMock()
    dbMock.transaction.mockImplementation(async (fn: Function) => fn(tx))
    tx.query.weatherStation.findFirst.mockResolvedValue(null)
    tx.query.parcelStation.findFirst.mockResolvedValue(null)

    await getStations("parcel-1", 38.0, -3.5)

    expect(getBestStationsMock).toHaveBeenCalledWith(38.0, -3.5)
    expect(dbMock.select).not.toHaveBeenCalled()
    expect(tx.insert).toHaveBeenCalledTimes(4)
  })

  it("asigna estaciones correctamente cuando consulta centroid de la DB", async () => {
    mockParcelCentroid(38.0, -3.5)
    getBestStationsMock.mockResolvedValue(mockStationSelection())
    const tx = createTxMock()
    dbMock.transaction.mockImplementation(async (fn: Function) => fn(tx))
    tx.query.weatherStation.findFirst.mockResolvedValue(null)
    tx.query.parcelStation.findFirst.mockResolvedValue(null)

    await getStations("parcel-1")

    expect(getBestStationsMock).toHaveBeenCalledWith(38.0, -3.5)
    expect(tx.query.weatherStation.findFirst).toHaveBeenCalledTimes(3)
    expect(tx.query.parcelStation.findFirst).toHaveBeenCalledTimes(1)
    expect(tx.insert).toHaveBeenCalledTimes(4) // 3 weather stations + 1 parcelStation
  })

  it("no falla si no hay centroid (lat null)", async () => {
    mockParcelCentroid(null, -3.5)

    await getStations("parcel-1")

    expect(getBestStationsMock).not.toHaveBeenCalled()
  })

  it("no falla si no hay centroid (lng null)", async () => {
    mockParcelCentroid(38.0, null)

    await getStations("parcel-1")

    expect(getBestStationsMock).not.toHaveBeenCalled()
  })

  it("no falla si el parcel no existe", async () => {
    const chain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    }
    dbMock.select.mockReturnValue(chain)

    await getStations("parcel-999")

    expect(getBestStationsMock).not.toHaveBeenCalled()
  })

  it("no falla si lat/lng son null directamente", async () => {
    await getStations("parcel-1", null as any, null as any)

    expect(getBestStationsMock).not.toHaveBeenCalled()
  })

  it("propaga error si getBestStations lanza excepción", async () => {
    mockParcelCentroid(38.0, -3.5)
    getBestStationsMock.mockRejectedValue(new Error("API down"))

    await expect(getStations("parcel-1")).rejects.toThrow("API down")
  })

  it("upsert en lugar de insert si ya existe parcelStation", async () => {
    mockParcelCentroid(38.0, -3.5)
    getBestStationsMock.mockResolvedValue(mockStationSelection())
    const tx = createTxMock()
    dbMock.transaction.mockImplementation(async (fn: Function) => fn(tx))
    tx.query.weatherStation.findFirst.mockResolvedValue({ id: "station-existing" })
    tx.query.parcelStation.findFirst.mockResolvedValue({ parcelId: "parcel-1" })

    await getStations("parcel-1")

    expect(tx.update).toHaveBeenCalled()
    expect(tx.insert).not.toHaveBeenCalled()
  })
})
