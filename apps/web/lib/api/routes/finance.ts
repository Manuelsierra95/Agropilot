import { client } from "@/lib/api/client"
import {
  TransactionBulkCreateInput,
  TransactionCreateInput,
  TransactionSelect,
  TransactionUpdateInput,
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
    .then((res) => res.transaction)

const bulkCreateTransactions = (data: TransactionBulkCreateInput) =>
  client.api.v1.finance.bulk
    .$post({
      json: data,
    })
    .then((res) => res.json())
    .then((res) => res.transactions)

const updateTransaction = (id: string, data: TransactionUpdateInput) =>
  client.api.v1.finance[":id"]
    .$put({
      param: { id },
      json: data,
    })
    .then((res) => res.json())
    .then((res) => res.transaction)

const deleteTransaction = (id: string) =>
  client.api.v1.finance[":id"]
    .$delete({
      param: { id },
    })
    .then((res) => res.json())
    .then((res) => res.id)

export const financeApi = {
  listTransactions,
  getTransactionById,
  createTransaction,
  bulkCreateTransactions,
  updateTransaction,
  deleteTransaction,
}
