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

const getListParcels = (): Promise<ParcelSelectWithCrop[]> =>
  client.api.v1.parcel
    .$get()
    .then(
      (res) =>
        res.json() as unknown as Promise<{
          data: { parcels: ParcelSelectWithCrop[] }
        }>
    )
    .then((res) => res.data.parcels)

const getParcelById = cache(
  (id: string): Promise<ParcelSelectWithCrop> =>
    client.api.v1.parcel[":id"]
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
)

const createParcel = (data: ParcelCreateInput) =>
  client.api.v1.parcel
    .$post({
      json: data,
    })
    .then((res) => res.json() as Promise<{ data: { parcel: ParcelSelect } }>)
    .then((res) => {
      notifyDashboardMutation(["parcels", "daily", "production"])
      return res.data.parcel
    })

const updateParcel = (id: string, data: ParcelUpdateInput) =>
  client.api.v1.parcel[":id"]
    .$put({
      param: {
        id,
      },
      json: data,
    })
    .then((res) => res.json() as Promise<{ data: { parcel: ParcelSelect } }>)
    .then((res) => {
      notifyDashboardMutation(["parcels", "daily", "production"], {
        parcelId: id,
      })
      return res.data.parcel
    })

const deleteParcel = (id: string) =>
  client.api.v1.parcel[":id"]
    .$delete({
      param: {
        id,
      },
    })
    .then((res) => res.json() as Promise<{ data: { id: string } }>)
    .then((res) => {
      notifyDashboardMutation(["parcels", "daily", "production"], {
        parcelId: id,
      })
      return res.data.id
    })

const getParcelsMap = (): Promise<DashboardMapParcel[]> =>
  client.api.v1.parcel.map
    .$get()
    .then(
      (res) =>
        res.json() as Promise<{ data: { mapParcels: DashboardMapParcel[] } }>
    )
    .then((res) => res.data.mapParcels)

const getParcelRecommendations = (
  parcelId: string
): Promise<DashboardRecommendation[]> =>
  client.api.v1.parcel[":id"].recommendations
    .$get({ param: { id: parcelId } })
    .then(
      (res) =>
        res.json() as Promise<{
          data: { recommendations: DashboardRecommendation[] }
        }>
    )
    .then((res) => res.data.recommendations)

const getParcelRisks = (parcelId: string): Promise<DashboardRisks> =>
  client.api.v1.parcel[":id"].weather
    .$get({ param: { id: parcelId } })
    .then(
      (res) =>
        res.json() as Promise<{
          data: { weather: { data: { risks: DashboardRisks } } }
        }>
    )
    .then((res) => res.data.weather.data.risks)

const getParcelCropOverview = (
  parcelId: string,
  scope: DashboardScopeParams
): Promise<DashboardOlivar> =>
  client.api.v1.parcel[":id"]["crop-overview"]
    .$get({
      param: { id: parcelId },
      query: toScopeQuery(scope),
    })
    .then((res) => res.json() as Promise<{ data: { olivar: DashboardOlivar } }>)
    .then((res) => res.data.olivar)

const getParcelsCropOverviews = (
  scope: DashboardScopeParams
): Promise<DashboardParcelsCropOverviews> =>
  client.api.v1.parcel.dashboard
    .$get({ query: { ...toScopeQuery(scope), include: "cropOverviews" } })
    .then(
      (res) =>
        res.json() as Promise<{
          data: { cropOverviews: DashboardParcelsCropOverviews }
        }>
    )
    .then((res) => res.data.cropOverviews)

const getParcelsRecommendations =
  (): Promise<DashboardParcelsRecommendations> =>
    client.api.v1.parcel.dashboard
      .$get({ query: { include: "recommendations" } })
      .then(
        (res) =>
          res.json() as Promise<{
            data: { recommendations: DashboardParcelsRecommendations }
          }>
      )
      .then((res) => res.data.recommendations)

const getParcelsRisks = (): Promise<DashboardParcelsRisks> =>
  client.api.v1.parcel.dashboard
    .$get({ query: { include: "risks" } })
    .then(
      (res) => res.json() as Promise<{ data: { risks: DashboardParcelsRisks } }>
    )
    .then((res) => res.data.risks)

const getParcelAgroclimate = (
  parcelId: string,
  scope: DashboardScopeParams
): Promise<DashboardParcelAgroclimate> =>
  client.api.v1.parcel[":id"].agroclimate
    .$get({
      param: { id: parcelId },
      query: toScopeQuery(scope),
    })
    .then(
      (res) =>
        res.json() as Promise<{
          data: { agroclimate: DashboardParcelAgroclimate }
        }>
    )
    .then((res) => res.data.agroclimate)

const getParcelsWeatherComparison = (
  scope: DashboardScopeParams
): Promise<DashboardParcelsWeatherComparison> =>
  client.api.v1.parcel.dashboard
    .$get({ query: { ...toScopeQuery(scope), include: "weatherComparison" } })
    .then(
      (res) =>
        res.json() as Promise<{
          data: { weatherComparison: DashboardParcelsWeatherComparison }
        }>
    )
    .then((res) => res.data.weatherComparison)

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
