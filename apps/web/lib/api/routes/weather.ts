import { client } from "@workspace/web/lib/api/client"
import type { ParcelWeatherResponse } from "@workspace/schemas"
import { isDemoMode } from "@workspace/web/lib/demo-mode"
import { getDemoParcelAgroclimate } from "@workspace/web/lib/mockdata"

const getParcelWeather = (
  parcelId: string,
  _query?: { from?: string; to?: string }
): Promise<ParcelWeatherResponse> => {
  if (isDemoMode())
    return Promise.resolve(getDemoParcelAgroclimate(parcelId) as unknown as ParcelWeatherResponse)
  return client.api.v1.weather
    .$get({
      query: { parcelId, ..._query },
    })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to fetch parcel weather")
      }
      return res.json() as unknown as Promise<{ data: { weather: ParcelWeatherResponse } }>
    })
    .then((res) => res.data.weather)
}

export const weatherApi = {
  getParcelWeather,
}
