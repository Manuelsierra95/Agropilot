import {
  LastUpdate,
  WeatherData,
  Uptime,
  Statistic,
  DevicesList,
  WindStatistics,
  DeviceInfo,
  Device,
  Map,
  weatherCloudId,
} from "./types"

// Helpers

type apiReturn =
  | LastUpdate
  | WeatherData
  | Uptime[]
  | Statistic
  | DevicesList
  | WindStatistics
  | DeviceInfo
  | Map

export async function fetchData(
  url: string,
  data: string = ""
): Promise<apiReturn | { error: boolean; err: any }> {
  try {
    const resp = await fetch(url, {
      method: "post",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: data,
    })
    const respData: any = await resp.json()
    return respData
  } catch (err) {
    return { error: true, err }
  }
}

export function parseDevicesList(devices: Device[], dataName?: string) {
  // correct a few deffect of devicelist
  return devices.map((device: Device) => {
    const { data, values, ...deviceInfos } = device
    // Convert string values to numbers
    const numberValues = Object.fromEntries(
      // parse values to int and divide them so it's just like normal WeatherData because weathercloud is terribly inconsistent
      Object.entries(values).map(([key, value]) => {
        if (typeof value === "string") {
          return /epoch|hum|wdir/.test(key) ? [key, +value] : [key, +value / 10] // devide by ten the value so it's the right decimal
        }
        return [key, value]
      })
    )
    if (dataName && !data) throw new Error("no data found")
    if (dataName && data)
      return {
        ...deviceInfos,
        values: numberValues,
        [dataName]: +data, // get a value that make sense
      }
    return {
      ...deviceInfos,
      values: numberValues,
    }
  })
}

export const chillFn = (temp: number, wspd: number) => {
  // mostly untouched from weathercloud
  if (wspd < 1.3 || temp > 21) return temp

  let windPow = Math.pow(wspd * 3.6, 0.16)
  let _chill = 13.12 + 0.6215 * temp - 11.37 * windPow + 0.3965 * temp * windPow

  return Math.min(temp, _chill)
}

export const heatFn = (temp: number, hum: number) => {
  // mostly untouched from weathercloud
  if (temp <= 4.44) return temp

  // 1. Steadman ( Celsius ) This formula include the average with the temperature
  let heat = -3.94 + 1.1 * temp + 0.026 * hum

  // 2. HI > 80ºF (26.7ºC) -> The regression equation of Rothfusz ( Celsius )
  if (heat > 26.5)
    heat =
      -8.784694755 +
      1.61139411 * temp +
      2.338548838 * hum -
      0.1461160501 * hum * temp -
      0.012308094 * temp * temp -
      0.01642482777 * hum * hum +
      0.002211732 * hum * temp * temp +
      0.00072546 * hum * hum * temp -
      0.000003582 * hum * hum * temp * temp

  // 3. Adjustments.
  if (hum < 13 && temp > 26.5 && temp < 44.5)
    heat -= ((13 - hum) / 4) * Math.sqrt(1 - 0.059 * Math.abs(1.8 * temp - 63))
  else if (hum > 85 && temp > 26.5 && temp < 30.5)
    heat += ((hum - 85) / 10) * (11 - 0.36 * temp)

  return Math.max(temp, heat)
}

// Station selection types

export interface StationCandidate {
  code: weatherCloudId
  name: string
  latitude: number
  longitude: number
  elevation: number
  distance: number
  followers: number
  score: number
}

export interface StationSelection {
  main: StationCandidate
  fallbacks: StationCandidate[]
  radiusUsed: number
}

// Functions

const RADIUS_STEPS = [5, 10, 20, 50] as const

export async function getNearest(
  lat: string | number,
  lon: string | number,
  radius: string | number
) {
  try {
    const data = await fetchData(
      `https://app.weathercloud.net/page/coordinates/latitude/${lat}/longitude/${lon}/distance/${radius}`
    )
    if (!data || !("devices" in data) || !Array.isArray(data.devices))
      throw new Error("Failed to fetch")
    return parseDevicesList(data.devices as Device[], "distance")
  } catch (err) {
    return [{ error: err }]
  }
}

export async function getNearestWithRetry(
  lat: string | number,
  lon: string | number
): Promise<{ devices: ReturnType<typeof parseDevicesList>; radiusUsed: number }> {
  for (const radius of RADIUS_STEPS) {
    const devices = await getNearest(lat, lon, radius)
    if (
      Array.isArray(devices) &&
      devices.length > 0 &&
      !("error" in devices[0]!)
    ) {
      return { devices: devices as ReturnType<typeof parseDevicesList>, radiusUsed: radius }
    }
  }
  throw new Error("No weather stations found within 50km")
}

export function scoreStation(
  distance: number,
  followers: number,
  maxFollowers: number,
  radius: number
): number {
  const normFollowers = maxFollowers > 0 ? followers / maxFollowers : 0
  const normDistance = radius > 0 ? distance / radius : 1
  return 0.7 * normFollowers + 0.3 * (1 - normDistance)
}

export async function getBestStations(
  lat: string | number,
  lon: string | number
): Promise<StationSelection> {
  const { devices, radiusUsed } = await getNearestWithRetry(lat, lon)

  const followerResults = await Promise.allSettled(
    devices.map((d) => getFollowers(d.code as weatherCloudId))
  )

  const followersList = followerResults.map((r) =>
    r.status === "fulfilled" && typeof r.value === "number" ? r.value : 0
  )

  const maxFollowers = Math.max(...followersList, 0)

  const candidates: StationCandidate[] = devices.map((device, i) => {
    const distance = (device as any).distance as number
    const followers = followersList[i]!
    return {
      code: device.code as weatherCloudId,
      name: device.name,
      latitude: +device.latitude,
      longitude: +device.longitude,
      elevation: +device.elevation,
      distance,
      followers,
      score: scoreStation(distance, followers, maxFollowers, radiusUsed),
    }
  })

  candidates.sort((a, b) => b.score - a.score)

  const [main, ...rest] = candidates
  if (!main) throw new Error("No weather stations found")

  const fallbacks = [...rest]
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 2)

  return { main, fallbacks, radiusUsed }
}

export async function getFollowers(
  id: weatherCloudId
): Promise<number | { error: any }> {
  const type = checkId(id)

  if (!type) {
    throw new Error("Invalid ID")
  }

  try {
    const profile = await fetchData(
      `https://app.weathercloud.net/${type}/ajaxprofile`,
      `d=${id}`
    ) as any
    const followers = profile?.followers?.number

    if (typeof followers !== "number") {
      throw new Error("Failed to fetch")
    }

    return followers
  } catch (err) {
    return { error: err }
  }
}

export function checkId(id: weatherCloudId) {
  // check ID validity and return if is metar or device type
  const deviceRegex = /^[0-9]{9,10}$/
  const metarRegex = /^[A-Z]{4}$/
  if (!deviceRegex.test(id) && !metarRegex.test(id)) return false // check that id is valid
  // defines the type of id
  return metarRegex.test(id) ? "metar" : "device"
}

export async function getWeather(id: weatherCloudId) {
  const type = checkId(id)

  if (!type) {
    throw new Error("Invalid ID")
  }

  try {
    const data = await fetchData(
      `https://app.weathercloud.net/${type}/values?code=${id}`
    )
    if (!("epoch" in data)) throw new Error("Failed to fetch")
    // fix visibility if present
    if (typeof data.vis === "number") data.vis = data.vis * 100

    /* ------------------------------ parse weather ----------------------------- */
    // calculate clouds height
    const cloudsHeight =
      typeof data.temp === "number" &&
      typeof data.dew === "number" &&
      data.temp > -40 &&
      data.dew > -40
        ? Math.max(0, 124.69 * (data.temp - data.dew))
        : null
    let weatherAvg: string | null = null
    // check data presence
    if (
      typeof data.bar === "number" &&
      typeof data.rainrate === "number" &&
      typeof data.hum === "number"
    ) {
      // check data validity
      if (
        data.bar < 0 ||
        data.rainrate < 0 ||
        typeof cloudsHeight !== "number" ||
        data.hum < 0 ||
        data.hum > 100
      )
        throw new Error("Invalid data")
      // guess current conditions based on data
      weatherAvg = "clear"
      if (data.rainrate == 0) {
        if (data.bar < 1005) weatherAvg = "cloud"
        else if (data.bar < 1010) weatherAvg = "change"
        else if (data.bar < 1015) weatherAvg = "few"

        if (cloudsHeight < 150) weatherAvg += "-fog"
      } else {
        if (data.rainrate < 2) weatherAvg = "light"
        else if (data.rainrate < 15) weatherAvg = "moderate"
        else weatherAvg = "heavy"
      }
    }
    // get feel (more or less just like heat / chill but since this is optionnal we get the value no matter what)
    let feel = data.temp ? data.temp : null
    if (
      typeof data.temp === "number" &&
      typeof data.wspd === "number" &&
      data.temp < 10
    )
      feel = chillFn(data.temp, data.wspd)
    else if (
      typeof data.temp === "number" &&
      typeof data.hum === "number" &&
      data.temp > 26
    )
      feel = heatFn(data.temp, data.hum)

    return {
      ...data,
      computed: {
        // rounded computed data
        cloudsHeight: cloudsHeight ? Math.round(cloudsHeight * 10) / 10 : null,
        feel: feel ? Math.round(feel * 10) / 10 : null,
        weatherAvg,
      },
    }
  } catch (err) {
    return { error: err }
  }
}

export async function getWind(id: weatherCloudId) {
  const type = checkId(id)

  if (!type) {
    throw new Error("Invalid ID")
  }
  try {
    const data = await fetchData(
      `https://app.weathercloud.net/${type}/wind?code=${id}`
    )
    if (!("date" in data)) throw new Error("Failed to fetch")

    // calculation from weatherclouds to display graphs
    let wdirdistData: number[] = []
    let wspddistData: number[] = []
    let total = 0
    let calm = 0

    data.values.forEach((value) => {
      const wdir = value.scale.reduce((a, b) => a + b, 0) - (value.scale[0] ?? 0) // total of scale[] - scale[0] (which is no wind)
      wdirdistData.push(wdir)
      wspddistData.push(wdir > 0 ? value.sum / wdir : 0)
      total += wdir
      calm += value.scale[0] ?? 0
    })
    total += calm

    let wdirproportions = wdirdistData.map((wdir) => (wdir / total) * 100)

    return {
      date: data.date, // time of the update
      // for graph of percentage per cardinals
      wdirproportions, // array of proportion of wind, each one is a cardinals
      calm: (calm / total) * 100, // proportion of calm wind time
      // for graphs of speed per cardinals
      wspddistData, // array of wind speeds, each one is a cardinals
      raw: data, // original values
    }
  } catch (err) {
    return { error: err }
  }
}
