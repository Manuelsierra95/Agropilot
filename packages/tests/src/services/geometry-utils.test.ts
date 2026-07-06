import { describe, expect, it } from "vitest"

import {
  parseGeoJsonPolygon,
  parsePolygonGeometry,
  parseWktPolygon,
} from "@workspace/api/services/shared/geometry-utils"

describe("geometry-utils polygon parsers", () => {
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
