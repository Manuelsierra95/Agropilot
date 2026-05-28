import { customType } from "drizzle-orm/pg-core"

export const geometry = (name: string, options = {}) =>
  customType<{ data: string }>({
    dataType() {
      return "geometry(Point, 4326)"
    },
  })(name, options)

export const geometryPolygon = (name: string, options = {}) =>
  customType<{ data: string }>({
    dataType() {
      return "geometry(Polygon, 4326)"
    },
  })(name, options)
