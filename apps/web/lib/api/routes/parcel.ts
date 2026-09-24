import { client } from "@workspace/web/lib/api/client"
import { notifyDashboardMutation } from "@workspace/web/lib/dashboard/notify-dashboard-mutation"
import type { DashboardScopeParams } from "@workspace/web/lib/dashboard/scope-key"
import { toScopeQuery } from "@workspace/web/lib/dashboard/scope-query"
import {
  ParcelSelect,
  ParcelCreateInput,
  ParcelUpdateInput,
  type ParcelSelectWithCrop,
  type DashboardMapParcel,
  type DashboardOlivar,
  type DashboardParcelAgroclimate,
  type DashboardParcelsCropOverviews,
  type DashboardParcelsRecommendations,
  type DashboardParcelsRisks,
  type DashboardParcelsWeatherComparison,
  type DashboardRecommendation,
  type DashboardRisks,
} from "@workspace/schemas"
import { cache } from "react"
import { isDemoMode } from "@workspace/web/lib/demo-mode"
import {
  DEMO_PARCELS,
  DEMO_PARCELS_MAP,
  getDemoDashboardListParcels,
  getDemoParcelAgroclimate,
  getDemoParcelById,
  getDemoParcelCropOverview,
  getDemoParcelRecommendations,
  getDemoParcelRisks,
  getDemoParcelsCropOverviews,
  getDemoParcelsRecommendations,
  getDemoParcelsRisks,
  getDemoWeatherComparison,
} from "@workspace/web/lib/mockdata"

const getListParcels = (): Promise<ParcelSelectWithCrop[]> => {
  if (isDemoMode()) return Promise.resolve(getDemoDashboardListParcels())
  return client.api.v1.parcel
    .$get()
    .then(
      (res) =>
        res.json() as unknown as Promise<{
          data: { parcels: ParcelSelectWithCrop[] }
        }>
    )
    .then((res) => res.data.parcels)
}

const getParcelById = cache(
  (id: string): Promise<ParcelSelectWithCrop> => {
    if (isDemoMode()) {
      const found = getDemoParcelById(id)
      if (!found) return Promise.reject(new Error("Demo parcel not found"))
      return Promise.resolve(found)
    }
    return client.api.v1.parcel[":id"]
      .$get({
        param: {
          id,
        },
      })
      .then(
        (res) =>
          res.json() as unknown as Promise<{
            data: { parcel: ParcelSelectWithCrop }
          }>
      )
      .then((res) => res.data.parcel)
  }
)

const createParcel = (data: ParcelCreateInput): Promise<ParcelSelect> => {
  if (isDemoMode()) {
    notifyDashboardMutation(["parcels", "daily", "production"])
    return Promise.resolve({ ...data, id: `parcel-${Date.now()}` } as unknown as ParcelSelect)
  }
  return client.api.v1.parcel
    .$post({
      json: data,
    })
    .then((res) => res.json() as unknown as Promise<{ data: { parcel: ParcelSelect } }>)
    .then((res) => {
      notifyDashboardMutation(["parcels", "daily", "production"])
      return res.data.parcel
    })
}

const updateParcel = (id: string, data: ParcelUpdateInput): Promise<ParcelSelect> => {
  if (isDemoMode()) {
    notifyDashboardMutation(["parcels", "daily", "production"], { parcelId: id })
    return Promise.resolve({ ...data, id } as unknown as ParcelSelect)
  }
  return client.api.v1.parcel[":id"]
    .$put({
      param: {
        id,
      },
      json: data,
    })
    .then((res) => res.json() as unknown as Promise<{ data: { parcel: ParcelSelect } }>)
    .then((res) => {
      notifyDashboardMutation(["parcels", "daily", "production"], {
        parcelId: id,
      })
      return res.data.parcel
    })
}

const deleteParcel = (id: string): Promise<string> => {
  if (isDemoMode()) {
    notifyDashboardMutation(["parcels", "daily", "production"], { parcelId: id })
    return Promise.resolve(id)
  }
  return client.api.v1.parcel[":id"]
    .$delete({
      param: {
        id,
      },
    })
    .then((res) => res.json() as unknown as Promise<{ data: { id: string } }>)
    .then((res) => {
      notifyDashboardMutation(["parcels", "daily", "production"], {
        parcelId: id,
      })
      return res.data.id
    })
}

const getParcelsMap = (): Promise<DashboardMapParcel[]> => {
  if (isDemoMode()) return Promise.resolve(DEMO_PARCELS_MAP)
  return client.api.v1.parcel.map
    .$get()
    .then(
      (res) =>
        res.json() as unknown as Promise<{ data: { mapParcels: DashboardMapParcel[] } }>
    )
    .then((res) => res.data.mapParcels)
}

const getParcelRecommendations = (
  parcelId: string
): Promise<DashboardRecommendation[]> => {
  if (isDemoMode()) return Promise.resolve(getDemoParcelRecommendations(parcelId))
  return client.api.v1.parcel[":id"].recommendations
    .$get({ param: { id: parcelId } })
    .then(
      (res) =>
        res.json() as unknown as Promise<{
          data: { recommendations: DashboardRecommendation[] }
        }>
    )
    .then((res) => res.data.recommendations)
}

const getParcelRisks = (parcelId: string): Promise<DashboardRisks> => {
  if (isDemoMode()) return Promise.resolve(getDemoParcelRisks(parcelId))
  return client.api.v1.parcel[":id"].weather
    .$get({ param: { id: parcelId } })
    .then(
      (res) =>
        res.json() as unknown as Promise<{
          data: { weather: { data: { risks: DashboardRisks } } }
        }>
    )
    .then((res) => res.data.weather.data.risks)
}

const getParcelCropOverview = (
  parcelId: string,
  _scope: DashboardScopeParams
): Promise<DashboardOlivar> => {
  if (isDemoMode())
    return Promise.resolve(getDemoParcelCropOverview(parcelId))
  return client.api.v1.parcel[":id"]["crop-overview"]
    .$get({
      param: { id: parcelId },
      query: toScopeQuery(_scope),
    })
    .then((res) => res.json() as unknown as Promise<{ data: { olivar: DashboardOlivar } }>)
    .then((res) => res.data.olivar)
}

const getParcelsCropOverviews = (
  _scope: DashboardScopeParams
): Promise<DashboardParcelsCropOverviews> => {
  if (isDemoMode()) return Promise.resolve(getDemoParcelsCropOverviews())
  return client.api.v1.parcel.dashboard
    .$get({ query: { ...toScopeQuery(_scope), include: "cropOverviews" } })
    .then(
      (res) =>
        res.json() as unknown as Promise<{
          data: { cropOverviews: DashboardParcelsCropOverviews }
        }>
    )
    .then((res) => res.data.cropOverviews)
}

const getParcelsRecommendations =
  (): Promise<DashboardParcelsRecommendations> => {
    if (isDemoMode()) return Promise.resolve(getDemoParcelsRecommendations())
    return client.api.v1.parcel.dashboard
      .$get({ query: { include: "recommendations" } })
      .then(
        (res) =>
          res.json() as unknown as Promise<{
            data: { recommendations: DashboardParcelsRecommendations }
          }>
      )
      .then((res) => res.data.recommendations)
  }

const getParcelsRisks = (): Promise<DashboardParcelsRisks> => {
  if (isDemoMode()) return Promise.resolve(getDemoParcelsRisks())
  return client.api.v1.parcel.dashboard
    .$get({ query: { include: "risks" } })
    .then(
      (res) => res.json() as unknown as Promise<{ data: { risks: DashboardParcelsRisks } }>
    )
    .then((res) => res.data.risks)
}

const getParcelAgroclimate = (
  parcelId: string,
  scope: DashboardScopeParams
): Promise<DashboardParcelAgroclimate> => {
  if (isDemoMode())
    return Promise.resolve(getDemoParcelAgroclimate(parcelId))
  return client.api.v1.parcel[":id"].agroclimate
    .$get({
      param: { id: parcelId },
      query: toScopeQuery(scope),
    })
    .then(
      (res) =>
        res.json() as unknown as Promise<{
          data: { agroclimate: DashboardParcelAgroclimate }
        }>
    )
    .then((res) => res.data.agroclimate)
}

const getParcelsWeatherComparison = (
  scope: DashboardScopeParams
): Promise<DashboardParcelsWeatherComparison> => {
  if (isDemoMode()) return Promise.resolve(getDemoWeatherComparison(scope))
  return client.api.v1.parcel.dashboard
    .$get({ query: { ...toScopeQuery(scope), include: "weatherComparison" } })
    .then(
      (res) =>
        res.json() as unknown as Promise<{
          data: { weatherComparison: DashboardParcelsWeatherComparison }
        }>
    )
    .then((res) => res.data.weatherComparison)
}

export const parcelApi = {
  getListParcels: getListParcels,
  getParcelById: getParcelById,
  createParcel: createParcel,
  updateParcel: updateParcel,
  deleteParcel: deleteParcel,
  getParcelsMap,
  getParcelRecommendations,
  getParcelRisks,
  getParcelCropOverview,
  getParcelsCropOverviews,
  getParcelsRecommendations,
  getParcelsRisks,
  getParcelAgroclimate,
  getParcelsWeatherComparison,
}
