export {
  fetchData,
  parseDevicesList,
  chillFn,
  heatFn,
  getNearest,
  getNearestWithRetry,
  scoreStation,
  getBestStations,
  getFollowers,
  checkId,
  getWeather,
  getWind,
  type StationCandidate,
  type StationSelection,
} from "./weather"

export type {
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
  regularID,
  metarID,
  deviceMapElement,
} from "./weather"

export { getOilPrices } from "./oil-prices"
