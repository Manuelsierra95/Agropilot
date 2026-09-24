import { client } from "@workspace/web/lib/api/client"
import { notifyDashboardMutation } from "@workspace/web/lib/dashboard/notify-dashboard-mutation"
import type {
  HarvestDeliveriesQuery,
  HarvestDeliveryListItem,
  HarvestDeliveryCreateInput,
  HarvestSaleCreateInput,
} from "@workspace/schemas"
import { isDemoMode } from "@workspace/web/lib/demo-mode"
import {
  createDemoHarvestDelivery,
  createDemoHarvestSale,
  getDemoHarvestDeliveries,
} from "@workspace/web/lib/mockdata"

const getHarvestDeliveries = (
  query: HarvestDeliveriesQuery
): Promise<HarvestDeliveryListItem[]> => {
  if (isDemoMode()) return Promise.resolve(getDemoHarvestDeliveries(query))
  return client.api.v1.production.deliveries
    .$get({ query })
    .then(
      (res) =>
        res.json() as unknown as Promise<{
          data: { deliveries: HarvestDeliveryListItem[] }
        }>
    )
    .then((res) => res.data.deliveries)
}

const createHarvestDelivery = (
  data: HarvestDeliveryCreateInput
): Promise<{ id: string }> => {
  if (isDemoMode()) {
    notifyDashboardMutation(["production"])
    return Promise.resolve(createDemoHarvestDelivery(data))
  }
  return client.api.v1.production.deliveries
    .$post({ json: data })
    .then(
      (res) =>
        res.json() as unknown as Promise<{
          data: { delivery: { id: string } }
        }>
    )
    .then((res) => {
      notifyDashboardMutation(["production"])
      return res.data.delivery
    })
}

const createHarvestSale = (
  data: HarvestSaleCreateInput
): Promise<{
  transaction: { id: string }
  sales: { id: string }[]
}> => {
  if (isDemoMode()) {
    notifyDashboardMutation(["finance", "production"])
    return Promise.resolve(createDemoHarvestSale(data))
  }
  return client.api.v1.production.sales
    .$post({ json: data })
    .then(
      (res) =>
        res.json() as unknown as Promise<{
          data: {
            transaction: { id: string }
            sales: { id: string }[]
          }
        }>
    )
    .then((res) => {
      notifyDashboardMutation(["finance", "production"])
      return res.data
    })
}

export const productionApi = {
  getHarvestDeliveries,
  createHarvestDelivery,
  createHarvestSale,
}
