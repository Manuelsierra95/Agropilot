import { describe, expect, it } from "vitest"

import {
  normalizeLatLng,
  parseGeoJsonPolygon,
  parsePolygonGeometry,
  parseWktPoint,
  parseWktPolygon,
} from "@workspace/api/services/shared/geometry-utils"

describe("geometry-utils polygon parsers", () => {
  it("parseWktPoint reads WKT as lng lat", () => {
    expect(parseWktPoint("POINT(-3.3712 38.0112)")).toEqual({
      lat: 38.0112,
      lng: -3.3712,
    })
  })

  it("parseWktPoint corrects swapped catastro-style POINT(lat lng)", () => {
    expect(parseWktPoint("POINT(38.01122756 -3.371160160000001)")).toEqual({
      lat: 38.01122756,
      lng: -3.371160160000001,
    })
  })

  it("normalizeLatLng fixes ST_Y/ST_X reads from swapped storage", () => {
    expect(normalizeLatLng(-3.371160160000001, 38.01122756)).toEqual({
      lat: 38.01122756,
      lng: -3.371160160000001,
    })
  })

  it("normalizeLatLng keeps correct lat/lng", () => {
    expect(normalizeLatLng(38.0112, -3.3712)).toEqual({
      lat: 38.0112,
      lng: -3.3712,
    })
  })
  it("parseWktPolygon reads WKT rings", () => {
    const coordinates = parseWktPolygon(
      "POLYGON((-3.3712 38.0112, -3.3692 38.0112, -3.3692 38.0132, -3.3712 38.0132, -3.3712 38.0112))"
    )

    expect(coordinates).toEqual([
      [
        [-3.3712, 38.0112],
        [-3.3692, 38.0112],
        [-3.3692, 38.0132],
        [-3.3712, 38.0132],
        [-3.3712, 38.0112],
      ],
    ])
  })

  it("parseGeoJsonPolygon reads PostGIS GeoJSON output", () => {
    const coordinates = parseGeoJsonPolygon(
      JSON.stringify({
        type: "Polygon",
        coordinates: [
          [
            [-3.3712, 38.0112],
            [-3.3692, 38.0112],
            [-3.3692, 38.0132],
            [-3.3712, 38.0132],
            [-3.3712, 38.0112],
          ],
        ],
      })
    )

    expect(coordinates?.[0]).toHaveLength(5)
    expect(coordinates?.[0]?.[0]).toEqual([-3.3712, 38.0112])
  })

  it("parsePolygonGeometry prefers GeoJSON over WKT", () => {
    const geoJson = JSON.stringify({
      type: "Polygon",
      coordinates: [
        [
          [1, 2],
          [3, 4],
          [5, 6],
          [1, 2],
        ],
      ],
    })

    expect(parsePolygonGeometry(geoJson)?.[0]?.[0]).toEqual([1, 2])
    expect(
      parsePolygonGeometry("0103000020E61000000100000005000000")
    ).toBeNull()
  })
})
