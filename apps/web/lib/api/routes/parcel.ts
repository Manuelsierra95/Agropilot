import { client } from "@/lib/api/client"
import { notifyDashboardMutation } from "@/lib/dashboard/notify-dashboard-mutation"
import type { DashboardScopeParams } from "@/lib/dashboard/scope-key"
import { toScopeQuery } from "@/lib/dashboard/scope-query"
import {
  ParcelSelect,
  ParcelCreateInput,
  ParcelUpdateInput,
  type DashboardMapParcel,
  type DashboardOlivar,
  type DashboardRecommendation,
  type DashboardRisks,
} from "@workspace/schemas"
import { cache } from "react"

const getListParcels = (): Promise<ParcelSelect[]> =>
  client.api.v1.parcel
    .$get()
    .then((res) => res.json())
    .then((res) => res.parcels)

const getParcelById = cache(
  (id: string): Promise<ParcelSelect> =>
    client.api.v1.parcel[":id"]
      .$get({
        param: {
          id,
        },
      })
      .then((res) => res.json())
      .then((res) => res.parcel)
)

const createParcel = (data: ParcelCreateInput) =>
  client.api.v1.parcel
    .$post({
      json: data,
    })
    .then((res) => res.json())
    .then((res) => {
      notifyDashboardMutation(["parcels", "daily", "production"])
      return res.parcel
    })

const updateParcel = (id: string, data: ParcelUpdateInput) =>
  client.api.v1.parcel[":id"]
    .$put({
      param: {
        id,
      },
      json: data,
    })
    .then((res) => res.json())
    .then((res) => {
      notifyDashboardMutation(["parcels", "daily", "production"], {
        parcelId: id,
      })
      return res.parcel
    })

const deleteParcel = (id: string) =>
  client.api.v1.parcel[":id"]
    .$delete({
      param: {
        id,
      },
    })
    .then((res) => res.json())
    .then((res) => {
      notifyDashboardMutation(["parcels", "daily", "production"], {
        parcelId: id,
      })
      return res.id
    })

const getParcelsMap = (): Promise<DashboardMapParcel[]> =>
  client.api.v1.parcel.map
    .$get()
    .then((res) => res.json())
    .then((res) => res.mapParcels)

const getParcelRecommendations = (
  parcelId: string
): Promise<DashboardRecommendation[]> =>
  client.api.v1.parcel[":id"].recommendations
    .$get({ param: { id: parcelId } })
    .then((res) => res.json())
    .then((res) => res.recommendations)

const getParcelRisks = (parcelId: string): Promise<DashboardRisks> =>
  client.api.v1.parcel[":id"].risks
    .$get({ param: { id: parcelId } })
    .then((res) => res.json())
    .then((res) => res.risks)

const getParcelCropOverview = (
  parcelId: string,
  scope: DashboardScopeParams
): Promise<DashboardOlivar> =>
  client.api.v1.parcel[":id"]["crop-overview"]
    .$get({
      param: { id: parcelId },
      query: toScopeQuery(scope),
    })
    .then((res) => res.json())
    .then((res) => res.olivar)

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
}
