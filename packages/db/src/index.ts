import {
  events,
  parcels,
  transactions,
  users,
  weatherData,
} from "../../db2/src/schemas"

export { db } from "./db"
export * from "../../db2/src/schemas"
export * from "@/src/types"

export const user = users
export const objects = {
  users,
  parcels,
  weatherData,
  events,
  transactions,
}
