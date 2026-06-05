import { client } from "@/lib/api/client"
import {
  ParcelSelect,
  ParcelCreateInput,
  ParcelUpdateInput,
} from "@workspace/schemas"
import { cache } from "react"

const getListParcels = cache(
  (): Promise<ParcelSelect[]> =>
    client.api.v1.parcel
      .$get()
      .then((res) => res.json())
      .then((res) => res.parcels)
)

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
    .then((res) => res.parcel)

const updateParcel = (id: string, data: ParcelUpdateInput) =>
  client.api.v1.parcel[":id"]
    .$put({
      param: {
        id,
      },
      json: data,
    })
    .then((res) => res.json())
    .then((res) => res.parcel)

const deleteParcel = (id: string) =>
  client.api.v1.parcel[":id"]
    .$delete({
      param: {
        id,
      },
    })
    .then((res) => res.json())
    .then((res) => res.id)

export const parcelApi = {
  getListParcels: getListParcels,
  getParcelById: getParcelById,
  createParcel: createParcel,
  updateParcel: updateParcel,
  deleteParcel: deleteParcel,
}
