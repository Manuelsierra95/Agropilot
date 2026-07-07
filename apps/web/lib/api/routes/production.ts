import { client } from "@workspace/web/lib/api/client"
import { notifyDashboardMutation } from "@workspace/web/lib/dashboard/notify-dashboard-mutation"
import type {
  HarvestDeliveriesQuery,
  HarvestDeliveryListItem,
  HarvestDeliveryCreateInput,
  HarvestSaleCreateInput,
} from "@workspace/schemas"

const getHarvestDeliveries = (
  query: HarvestDeliveriesQuery
): Promise<HarvestDeliveryListItem[]> =>
  client.api.v1.production.deliveries
    .$get({ query })
    .then(
      (res) =>
        res.json() as Promise<{
          data: { deliveries: HarvestDeliveryListItem[] }
        }>
    )
    .then((res) => res.data.deliveries)

const createHarvestDelivery = (data: HarvestDeliveryCreateInput) =>
  client.api.v1.production.deliveries
    .$post({ json: data })
    .then(
      (res) =>
        res.json() as Promise<{
          data: { delivery: { id: string } }
        }>
    )
    .then((res) => {
      notifyDashboardMutation(["production"])
      return res.data.delivery
    })

const createHarvestSale = (data: HarvestSaleCreateInput) =>
  client.api.v1.production.sales
    .$post({ json: data })
    .then(
      (res) =>
        res.json() as Promise<{
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

export const productionApi = {
  getHarvestDeliveries,
  createHarvestDelivery,
  createHarvestSale,
}
