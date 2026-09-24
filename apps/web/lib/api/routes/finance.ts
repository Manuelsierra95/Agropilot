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
  type UpdateCampaignSaleTargetInput,
} from "@workspace/schemas"
import { cache } from "react"
import { isDemoMode } from "@workspace/web/lib/demo-mode"
import {
  createDemoTransaction,
  deleteDemoTransaction,
  getDemoCampaignMargin,
  getDemoFinanceResume,
  getDemoOlivePrices,
  getDemoParcelsFinanceComparisonFn,
  getDemoParcelsSellingWindowsFn,
  getDemoProductionValue,
  getDemoRecentTransactions,
  getDemoScopedTransactions,
  getDemoSellingWindowFn,
  getDemoTransactions,
  updateDemoCampaignSaleTarget,
  updateDemoTransaction,
  DEMO_TRANSACTIONS_SELECT,
} from "@workspace/web/lib/mockdata"

const listTransactions = cache(
  (): Promise<TransactionSelect[]> => {
    if (isDemoMode()) return Promise.resolve(DEMO_TRANSACTIONS_SELECT)
    return client.api.v1.finance
      .$get({ query: {} })
      .then(
        (res) =>
          res.json() as unknown as Promise<{ data: { transactions: TransactionSelect[] } }>
      )
      .then((res) => res.data.transactions)
  }
)

const getTransactionById = cache(
  (id: string): Promise<TransactionSelect> => {
    if (isDemoMode()) {
      const found = DEMO_TRANSACTIONS_SELECT.find((t) => t.id === id)
      if (!found) return Promise.reject(new Error("Demo transaction not found"))
      return Promise.resolve(found)
    }
    return client.api.v1.finance[":id"]
      .$get({
        param: { id },
      })
      .then(
        (res) =>
          res.json() as unknown as Promise<{ data: { transaction: TransactionSelect } }>
      )
      .then((res) => res.data.transaction)
  }
)

const createTransaction = (data: TransactionCreateInput): Promise<TransactionSelect> => {
  if (isDemoMode()) {
    const tx = createDemoTransaction(data)
    notifyDashboardMutation(["finance", "production"])
    return Promise.resolve(tx)
  }
  return client.api.v1.finance
    .$post({
      json: data,
    })
    .then(
      (res) =>
        res.json() as unknown as Promise<{ data: { transaction: TransactionSelect } }>
    )
    .then((res) => {
      notifyDashboardMutation(["finance", "production"])
      return res.data.transaction
    })
}

const bulkCreateTransactions = (data: TransactionBulkCreateInput): Promise<TransactionSelect[]> => {
  if (isDemoMode()) {
    const items = data.transactions.map((t) => createDemoTransaction(t))
    notifyDashboardMutation(["finance", "production"])
    return Promise.resolve(items)
  }
  return client.api.v1.finance.bulk
    .$post({
      json: data,
    })
    .then(
      (res) =>
        res.json() as unknown as Promise<{ data: { transactions: TransactionSelect[] } }>
    )
    .then((res) => {
      notifyDashboardMutation(["finance", "production"])
      return res.data.transactions
    })
}

const updateTransaction = (id: string, data: TransactionUpdateInput): Promise<TransactionSelect> => {
  if (isDemoMode()) {
    const tx = updateDemoTransaction(id, data)
    if (!tx) return Promise.reject(new Error("Demo transaction not found"))
    notifyDashboardMutation(["finance", "production"])
    return Promise.resolve(tx)
  }
  return client.api.v1.finance[":id"]
    .$put({
      param: { id },
      json: data,
    })
    .then(
      (res) =>
        res.json() as unknown as Promise<{ data: { transaction: TransactionSelect } }>
    )
    .then((res) => {
      notifyDashboardMutation(["finance", "production"])
      return res.data.transaction
    })
}

const deleteTransaction = (id: string): Promise<string> => {
  if (isDemoMode()) {
    notifyDashboardMutation(["finance", "production"])
    return Promise.resolve(deleteDemoTransaction(id))
  }
  return client.api.v1.finance[":id"]
    .$delete({
      param: { id },
    })
    .then((res) => res.json() as unknown as Promise<{ data: { id: string } }>)
    .then((res) => {
      notifyDashboardMutation(["finance", "production"])
      return res.data.id
    })
}

const getOlivePrices = (): Promise<DashboardOlivePriceItem[]> => {
  if (isDemoMode()) return Promise.resolve(getDemoOlivePrices())
  return client.api.v1.finance["olive-prices"]
    .$get()
    .then(
      (res) =>
        res.json() as unknown as Promise<{
          data: { olivePrices: DashboardOlivePriceItem[] }
        }>
    )
    .then((res) => res.data.olivePrices)
}

const getSellingWindow = (
  scope: DashboardScopeParams
): Promise<DashboardSellingWindow> => {
  if (isDemoMode()) return Promise.resolve(getDemoSellingWindowFn(scope))
  return client.api.v1.finance
    .$get({ query: { ...toScopeQuery(scope), include: "sellingWindow" } })
    .then(
      (res) =>
        res.json() as unknown as Promise<{
          data: { sellingWindow: DashboardSellingWindow }
        }>
    )
    .then((res) => res.data.sellingWindow)
}

const getParcelsSellingWindows = (
  scope: DashboardScopeParams
): Promise<DashboardParcelsSellingWindows> => {
  if (isDemoMode())
    return Promise.resolve(getDemoParcelsSellingWindowsFn(scope))
  return client.api.v1.finance
    .$get({ query: { ...toScopeQuery(scope), include: "sellingWindows" } })
    .then(
      (res) =>
        res.json() as unknown as Promise<{
          data: { sellingWindows: DashboardParcelsSellingWindows }
        }>
    )
    .then((res) => res.data.sellingWindows)
}

const getFinanceResume = (
  scope: DashboardScopeParams
): Promise<DashboardFinanceResume> => {
  if (isDemoMode()) return Promise.resolve(getDemoFinanceResume(scope))
  return client.api.v1.finance
    .$get({ query: { ...toScopeQuery(scope), include: "resume" } })
    .then(
      (res) =>
        res.json() as unknown as Promise<{ data: { resume: DashboardFinanceResume } }>
    )
    .then((res) => res.data.resume)
}

const getCampaignMargin = (
  scope: DashboardScopeParams
): Promise<DashboardCampaignMargin> => {
  if (isDemoMode()) return Promise.resolve(getDemoCampaignMargin(scope))
  return client.api.v1.finance
    .$get({ query: { ...toScopeQuery(scope), include: "campaignMargin" } })
    .then(
      (res) =>
        res.json() as unknown as Promise<{
          data: { campaignMargin: DashboardCampaignMargin }
        }>
    )
    .then((res) => res.data.campaignMargin)
}

const getRecentTransactions = (
  scope: DashboardScopeParams
): Promise<DashboardTransactionSnapshot[]> => {
  if (isDemoMode()) return Promise.resolve(getDemoRecentTransactions(scope))
  return client.api.v1.finance
    .$get({ query: { ...toScopeQuery(scope), include: "recentTransactions" } })
    .then(
      (res) =>
        res.json() as unknown as Promise<{
          data: { recentTransactions: DashboardTransactionSnapshot[] }
        }>
    )
    .then((res) => res.data.recentTransactions)
}

const getScopedTransactions = (
  scope: DashboardScopeParams
): Promise<DashboardFinanceTransaction[]> => {
  if (isDemoMode()) return Promise.resolve(getDemoScopedTransactions(scope))
  return client.api.v1.finance
    .$get({ query: { ...toScopeQuery(scope), include: "transactions" } })
    .then(
      (res) =>
        res.json() as unknown as Promise<{
          data: { transactions: DashboardFinanceTransaction[] }
        }>
    )
    .then((res) => res.data.transactions)
}

const getProductionValue = (
  scope: DashboardScopeParams
): Promise<DashboardProductionValue> => {
  if (isDemoMode()) return Promise.resolve(getDemoProductionValue(scope))
  return client.api.v1.finance
    .$get({ query: { ...toScopeQuery(scope), include: "productionValue" } })
    .then(
      (res) =>
        res.json() as unknown as Promise<{
          data: { productionValue: DashboardProductionValue }
        }>
    )
    .then((res) => res.data.productionValue)
}

const getParcelsFinanceComparison = (
  scope: DashboardScopeParams
): Promise<DashboardParcelsFinanceComparison> => {
  if (isDemoMode())
    return Promise.resolve(getDemoParcelsFinanceComparisonFn())
  return client.api.v1.finance
    .$get({ query: { ...toScopeQuery(scope), include: "parcelsComparison" } })
    .then(
      (res) =>
        res.json() as unknown as Promise<{
          data: { parcelsComparison: DashboardParcelsFinanceComparison }
        }>
    )
    .then((res) => res.data.parcelsComparison)
}

const updateCampaignSaleTarget = (
  data: UpdateCampaignSaleTargetInput
): Promise<{ campaignTarget: number }> => {
  if (isDemoMode()) return Promise.resolve(updateDemoCampaignSaleTarget(data))
  return client.api.v1.finance["selling-window"]["campaign-target"]
    .$patch({ json: data })
    .then(
      (res) =>
        res.json() as unknown as Promise<{
          data: { campaignTarget: number }
        }>
    )
    .then((res) => res.data)
}

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
  updateCampaignSaleTarget,
}
