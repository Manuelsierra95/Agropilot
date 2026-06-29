import { Hono } from "hono"
import type { Env } from "@env"
import type { AuthVariables } from "@workspace/api/types/variables"
import { zValidator } from "@hono/zod-validator"
import { requireAuth } from "@workspace/api/middlewares/require-auth"
import { createCacheMiddleware } from "@workspace/api/middlewares/cache"
import { apiQuerySchema } from "@workspace/schemas"
import { parseInclude } from "@workspace/api/lib/parse-include"
import { apiResponse } from "@workspace/api/lib/api-response"
import {
  bulkCreateTransactions,
  createTransaction,
  deleteTransaction,
  getCampaignMarginForDashboard,
  getFinanceResumeForDashboard,
  getOlivePricesForDashboard,
  getParcelsFinanceComparisonForDashboard,
  getParcelsSellingWindowsForDashboard,
  getProductionValueForDashboard,
  getRecentTransactionsForDashboard,
  getSellingWindowForDashboard,
  getTransactionById,
  getTransactionsForDashboard,
  listTransactions,
  updateTransaction,
} from "@workspace/api/services/finance"
import {
  transactionBulkCreateSchema,
  transactionCreateSchema,
  transactionUpdateInputSchema,
} from "@workspace/schemas"

const cache5min = createCacheMiddleware({ ttlSeconds: 300 })
const cache1min = createCacheMiddleware({ ttlSeconds: 60 })

export const financeRoutes = new Hono<{
  Bindings: Env
  Variables: AuthVariables
}>()
  .use(requireAuth)

  .get("/", cache5min, zValidator("query", apiQuerySchema), async (c) => {
    const query = c.req.valid("query")
    const include = parseInclude(query.include)
    const organizationId = c.get("organizationId")

    const data: Record<string, unknown> = {}

    if (include.includes("transactions") || include.length === 0) {
      data.transactions = await getTransactionsForDashboard(
        organizationId,
        query
      )
    }
    if (include.includes("resume")) {
      data.resume = await getFinanceResumeForDashboard(organizationId, query)
    }
    if (include.includes("campaignMargin")) {
      data.campaignMargin = await getCampaignMarginForDashboard(
        organizationId,
        query
      )
    }
    if (include.includes("sellingWindows")) {
      data.sellingWindows = await getParcelsSellingWindowsForDashboard(
        organizationId,
        query
      )
    }
    if (include.includes("productionValue")) {
      data.productionValue = await getProductionValueForDashboard(
        organizationId,
        query
      )
    }
    if (include.includes("parcelsComparison")) {
      data.parcelsComparison = await getParcelsFinanceComparisonForDashboard(
        organizationId,
        query
      )
    }
    if (include.includes("recentTransactions")) {
      data.recentTransactions = await getRecentTransactionsForDashboard(
        organizationId,
        { ...query, limit: query.limit ?? 50 }
      )
    }
    if (include.includes("sellingWindow")) {
      data.sellingWindow = await getSellingWindowForDashboard(
        organizationId,
        query
      )
    }

    return c.json(
      apiResponse({
        data,
        meta: {
          scope: query.parcelId ? "parcel" : "organization",
          mode: query.mode,
          from: query.from,
          to: query.to,
          ...(query.parcelId ? { parcelId: query.parcelId } : {}),
        },
      }),
      200
    )
  })

  .get("/olive-prices", cache5min, async (c) => {
    const olivePrices = await getOlivePricesForDashboard()
    return c.json(
      apiResponse({
        data: { olivePrices },
        meta: { scope: "organization", mode: "full" },
      }),
      200
    )
  })

  .get("/:id", async (c) => {
    const transaction = await getTransactionById(
      c.get("organizationId"),
      c.req.param("id")
    )
    return c.json(
      apiResponse({
        data: { transaction },
        meta: { scope: "parcel", mode: "full" },
      }),
      200
    )
  })

  .post("/", zValidator("json", transactionCreateSchema), async (c) => {
    const data = c.req.valid("json")
    const transaction = await createTransaction(
      c.get("organizationId"),
      c.get("user").id,
      data
    )
    return c.json(
      apiResponse({
        data: { transaction },
        meta: { scope: "parcel", mode: "full" },
      }),
      201
    )
  })

  .put("/:id", zValidator("json", transactionUpdateInputSchema), async (c) => {
    const data = c.req.valid("json")
    const transaction = await updateTransaction(
      c.get("organizationId"),
      c.req.param("id"),
      data
    )
    return c.json(
      apiResponse({
        data: { transaction },
        meta: { scope: "parcel", mode: "full" },
      }),
      200
    )
  })

  .post("/bulk", zValidator("json", transactionBulkCreateSchema), async (c) => {
    const { transactions } = c.req.valid("json")
    const created = await bulkCreateTransactions(
      c.get("organizationId"),
      c.get("user").id,
      transactions
    )
    return c.json(
      apiResponse({
        data: { transactions: created, count: created.length },
        meta: { scope: "organization", mode: "full" },
      }),
      201
    )
  })

  .delete("/:id", async (c) => {
    await deleteTransaction(c.get("organizationId"), c.req.param("id"))
    return c.json(
      apiResponse({
        data: { id: c.req.param("id") },
        meta: { scope: "parcel", mode: "full" },
      }),
      200
    )
  })
