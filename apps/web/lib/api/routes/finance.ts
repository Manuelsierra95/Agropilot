import { client } from "@/lib/api/client"
import { notifyDashboardMutation } from "@/lib/dashboard/notify-dashboard-mutation"
import type { DashboardScopeParams } from "@/lib/dashboard/scope-key"
import { toScopeQuery } from "@/lib/dashboard/scope-query"
import {
  TransactionBulkCreateInput,
  TransactionCreateInput,
  TransactionSelect,
  TransactionUpdateInput,
  type DashboardCampaignMargin,
  type DashboardFinanceResume,
  type DashboardFinanceTransaction,
  type DashboardOlivePriceItem,
  type DashboardProductionValue,
  type DashboardParcelsFinanceComparison,
  type DashboardParcelsSellingWindows,
  type DashboardSellingWindow,
  type DashboardTransactionSnapshot,
} from "@workspace/schemas"
import { cache } from "react"

const listTransactions = cache(
  (): Promise<TransactionSelect[]> =>
    client.api.v1.finance
      .$get()
      .then((res) => res.json())
      .then((res) => res.transactions)
)

const getTransactionById = cache(
  (id: string): Promise<TransactionSelect> =>
    client.api.v1.finance[":id"]
      .$get({
        param: { id },
      })
      .then((res) => res.json())
      .then((res) => res.transaction)
)

const createTransaction = (data: TransactionCreateInput) =>
  client.api.v1.finance
    .$post({
      json: data,
    })
    .then((res) => res.json())
    .then((res) => {
      notifyDashboardMutation(["finance", "production"])
      return res.transaction
    })

const bulkCreateTransactions = (data: TransactionBulkCreateInput) =>
  client.api.v1.finance.bulk
    .$post({
      json: data,
    })
    .then((res) => res.json())
    .then((res) => {
      notifyDashboardMutation(["finance", "production"])
      return res.transactions
    })

const updateTransaction = (id: string, data: TransactionUpdateInput) =>
  client.api.v1.finance[":id"]
    .$put({
      param: { id },
      json: data,
    })
    .then((res) => res.json())
    .then((res) => {
      notifyDashboardMutation(["finance", "production"])
      return res.transaction
    })

const deleteTransaction = (id: string) =>
  client.api.v1.finance[":id"]
    .$delete({
      param: { id },
    })
    .then((res) => res.json())
    .then((res) => {
      notifyDashboardMutation(["finance", "production"])
      return res.id
    })

const getOlivePrices = (): Promise<DashboardOlivePriceItem[]> =>
  client.api.v1.finance["olive-prices"]
    .$get()
    .then((res) => res.json())
    .then((res) => res.olivePrices)

const getSellingWindow = (
  scope: DashboardScopeParams
): Promise<DashboardSellingWindow> =>
  client.api.v1.finance["selling-window"]
    .$get({ query: toScopeQuery(scope) })
    .then((res) => res.json())
    .then((res) => res.sellingWindow)

const getParcelsSellingWindows = (
  scope: DashboardScopeParams
): Promise<DashboardParcelsSellingWindows> =>
  client.api.v1.finance["selling-windows"]
    .$get({ query: toScopeQuery(scope) })
    .then((res) => res.json())
    .then((res) => res.sellingWindows)

const getFinanceResume = (
  scope: DashboardScopeParams
): Promise<DashboardFinanceResume> =>
  client.api.v1.finance.resume
    .$get({ query: toScopeQuery(scope) })
    .then((res) => res.json())
    .then((res) => res.finance)

const getCampaignMargin = (
  scope: DashboardScopeParams
): Promise<DashboardCampaignMargin> =>
  client.api.v1.finance["campaign-margin"]
    .$get({ query: toScopeQuery(scope) })
    .then((res) => res.json())
    .then((res) => res.campaignMargin)

const getRecentTransactions = (
  scope: DashboardScopeParams
): Promise<DashboardTransactionSnapshot[]> =>
  client.api.v1.finance["recent-transactions"]
    .$get({ query: toScopeQuery(scope) })
    .then((res) => res.json())
    .then((res) => res.transactions)

const getScopedTransactions = (
  scope: DashboardScopeParams
): Promise<DashboardFinanceTransaction[]> =>
  client.api.v1.finance.transactions
    .$get({ query: toScopeQuery(scope) })
    .then((res) => res.json())
    .then((res) => res.transactions)

const getProductionValue = (
  scope: DashboardScopeParams
): Promise<DashboardProductionValue> =>
  client.api.v1.finance["production-value"]
    .$get({ query: toScopeQuery(scope) })
    .then((res) => res.json())
    .then((res) => res.productionValue)

const getParcelsFinanceComparison = (
  scope: DashboardScopeParams
): Promise<DashboardParcelsFinanceComparison> =>
  client.api.v1.finance["parcels-comparison"]
    .$get({ query: toScopeQuery(scope) })
    .then((res) => res.json())
    .then((res) => res.parcelsComparison)

export const financeApi = {
  listTransactions,
  getTransactionById,
  createTransaction,
  bulkCreateTransactions,
  updateTransaction,
  deleteTransaction,
  getOlivePrices,
  getSellingWindow,
  getFinanceResume,
  getCampaignMargin,
  getRecentTransactions,
  getScopedTransactions,
  getProductionValue,
  getParcelsFinanceComparison,
  getParcelsSellingWindows,
}
