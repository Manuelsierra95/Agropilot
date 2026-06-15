import { client } from "@/lib/api/client"
import type { ParcelWeatherResponse } from "@workspace/schemas"

const getParcelWeather = (
  parcelId: string,
  query?: { from?: string; to?: string }
): Promise<ParcelWeatherResponse> =>
  client.api.v1.weather[":parcelId"]
    .$get({
      param: { parcelId },
      query: query ?? {},
    })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to fetch parcel weather")
      }
      return res.json()
    })

export const weatherApi = {
  getParcelWeather,
}
