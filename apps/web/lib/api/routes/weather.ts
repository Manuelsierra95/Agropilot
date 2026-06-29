import { client } from "@workspace/web/lib/api/client"
import type { ParcelWeatherResponse } from "@workspace/schemas"

const getParcelWeather = (
  parcelId: string,
  query?: { from?: string; to?: string }
): Promise<ParcelWeatherResponse> =>
  client.api.v1.weather
    .$get({
      query: { parcelId, ...query },
    })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to fetch parcel weather")
      }
      return res.json() as Promise<{ data: { weather: ParcelWeatherResponse } }>
    })
    .then((res) => res.data.weather)

export const weatherApi = {
  getParcelWeather,
}
