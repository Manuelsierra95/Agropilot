import { client } from "@workspace/web/lib/api/client"
import { notifyDashboardMutation } from "@workspace/web/lib/dashboard/notify-dashboard-mutation"
import type { DashboardScopeParams } from "@workspace/web/lib/dashboard/scope-key"
import { toScopeQuery } from "@workspace/web/lib/dashboard/scope-query"
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
      .then((res) => res.json() as Promise<{ data: { transactions: TransactionSelect[] } }>)
      .then((res) => res.data.transactions)
)

const getTransactionById = cache(
  (id: string): Promise<TransactionSelect> =>
    client.api.v1.finance[":id"]
      .$get({
        param: { id },
      })
      .then((res) => res.json() as Promise<{ data: { transaction: TransactionSelect } }>)
      .then((res) => res.data.transaction)
)

const createTransaction = (data: TransactionCreateInput) =>
  client.api.v1.finance
    .$post({
      json: data,
    })
    .then((res) => res.json() as Promise<{ data: { transaction: TransactionSelect } }>)
    .then((res) => {
      notifyDashboardMutation(["finance", "production"])
      return res.data.transaction
    })

const bulkCreateTransactions = (data: TransactionBulkCreateInput) =>
  client.api.v1.finance.bulk
    .$post({
      json: data,
    })
    .then((res) => res.json() as Promise<{ data: { transactions: TransactionSelect[] } }>)
    .then((res) => {
      notifyDashboardMutation(["finance", "production"])
      return res.data.transactions
    })

const updateTransaction = (id: string, data: TransactionUpdateInput) =>
  client.api.v1.finance[":id"]
    .$put({
      param: { id },
      json: data,
    })
    .then((res) => res.json() as Promise<{ data: { transaction: TransactionSelect } }>)
    .then((res) => {
      notifyDashboardMutation(["finance", "production"])
      return res.data.transaction
    })

const deleteTransaction = (id: string) =>
  client.api.v1.finance[":id"]
    .$delete({
      param: { id },
    })
    .then((res) => res.json() as Promise<{ data: { id: string } }>)
    .then((res) => {
      notifyDashboardMutation(["finance", "production"])
      return res.data.id
    })

const getOlivePrices = (): Promise<DashboardOlivePriceItem[]> =>
  client.api.v1.finance["olive-prices"]
    .$get()
    .then((res) => res.json() as Promise<{ data: { olivePrices: DashboardOlivePriceItem[] } }>)
    .then((res) => res.data.olivePrices)

const getSellingWindow = (
  scope: DashboardScopeParams
): Promise<DashboardSellingWindow> =>
  client.api.v1.finance
    .$get({ query: { ...toScopeQuery(scope), include: "sellingWindow" } })
    .then((res) => res.json() as Promise<{ data: { sellingWindow: DashboardSellingWindow } }>)
    .then((res) => res.data.sellingWindow)

const getParcelsSellingWindows = (
  scope: DashboardScopeParams
): Promise<DashboardParcelsSellingWindows> =>
  client.api.v1.finance
    .$get({ query: { ...toScopeQuery(scope), include: "sellingWindows" } })
    .then((res) => res.json() as Promise<{ data: { sellingWindows: DashboardParcelsSellingWindows } }>)
    .then((res) => res.data.sellingWindows)

const getFinanceResume = (
  scope: DashboardScopeParams
): Promise<DashboardFinanceResume> =>
  client.api.v1.finance
    .$get({ query: { ...toScopeQuery(scope), include: "resume" } })
    .then((res) => res.json() as Promise<{ data: { resume: DashboardFinanceResume } }>)
    .then((res) => res.data.resume)

const getCampaignMargin = (
  scope: DashboardScopeParams
): Promise<DashboardCampaignMargin> =>
  client.api.v1.finance
    .$get({ query: { ...toScopeQuery(scope), include: "campaignMargin" } })
    .then((res) => res.json() as Promise<{ data: { campaignMargin: DashboardCampaignMargin } }>)
    .then((res) => res.data.campaignMargin)

const getRecentTransactions = (
  scope: DashboardScopeParams
): Promise<DashboardTransactionSnapshot[]> =>
  client.api.v1.finance
    .$get({ query: { ...toScopeQuery(scope), include: "recentTransactions" } })
    .then((res) => res.json() as Promise<{ data: { recentTransactions: DashboardTransactionSnapshot[] } }>)
    .then((res) => res.data.recentTransactions)

const getScopedTransactions = (
  scope: DashboardScopeParams
): Promise<DashboardFinanceTransaction[]> =>
  client.api.v1.finance
    .$get({ query: { ...toScopeQuery(scope), include: "transactions" } })
    .then((res) => res.json() as Promise<{ data: { transactions: DashboardFinanceTransaction[] } }>)
    .then((res) => res.data.transactions)

const getProductionValue = (
  scope: DashboardScopeParams
): Promise<DashboardProductionValue> =>
  client.api.v1.finance
    .$get({ query: { ...toScopeQuery(scope), include: "productionValue" } })
    .then((res) => res.json() as Promise<{ data: { productionValue: DashboardProductionValue } }>)
    .then((res) => res.data.productionValue)

const getParcelsFinanceComparison = (
  scope: DashboardScopeParams
): Promise<DashboardParcelsFinanceComparison> =>
  client.api.v1.finance
    .$get({ query: { ...toScopeQuery(scope), include: "parcelsComparison" } })
    .then((res) => res.json() as Promise<{ data: { parcelsComparison: DashboardParcelsFinanceComparison } }>)
    .then((res) => res.data.parcelsComparison)

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
